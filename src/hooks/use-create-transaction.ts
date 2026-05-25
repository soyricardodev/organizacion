import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createTransaction } from "@/server/finance"
import { queryKeys } from "@/lib/query-keys"
import {
  enqueueTransaction,
  removePendingTransaction,
  type PendingTransaction,
} from "@/lib/offline-queue"
import { convertToUsdCents, debtProgressPercent } from "@/lib/money"
import type { Bucket, Debt, Transaction } from "@/db/schema"
import type { ActiveRates } from "@/lib/rates"
import {
  buildEffectiveTransactionType,
  buildTransactionPayload,
} from "@/domain/transactions/build-transaction-payload"
import { shouldFreezeInBucket } from "@/domain/types"
import type {
  Category,
  Currency,
  MatchedRate,
  RegisterableTransactionType,
} from "@/domain/types"

function isOffline() {
  return typeof navigator !== "undefined" && !navigator.onLine
}

export interface CreateTransactionInput {
  tempId: string
  description: string
  originalAmountCents: number
  originalCurrency: Currency
  category: Category
  type: RegisterableTransactionType
  matchedRate: MatchedRate
  debtId?: string
  freezeInBucketId?: string
}

type DebtWithMetrics = Debt & {
  progressPercent: number
  daysRemaining: number
  dailyRequiredCents: number
}

function buildOptimisticTransaction(
  input: CreateTransactionInput,
  rates: ActiveRates,
): Transaction {
  const rateSnapshot = {
    bcvRate: rates.bcvRate,
    euroBcvRate: rates.euroBcvRate,
    paraleloRate: rates.paraleloRate,
  }
  const effectiveType = buildEffectiveTransactionType(toPendingTransaction(input))
  const isSavingsAllocation =
    shouldFreezeInBucket(input) &&
    input.type === "expense" &&
    input.category === "savings"

  return {
    id: input.tempId,
    description: input.description,
    originalAmountCents: input.originalAmountCents,
    originalCurrency: input.originalCurrency,
    usdCents: convertToUsdCents(
      input.originalAmountCents,
      input.originalCurrency,
      rateSnapshot,
      input.matchedRate,
    ),
    category: isSavingsAllocation ? "savings" : input.category,
    type: isSavingsAllocation ? "bucket_freeze" : effectiveType,
    bucketId: isSavingsAllocation ? (input.freezeInBucketId ?? null) : null,
    debtId: input.debtId ?? null,
    matchedRate: input.matchedRate,
    bcvRate: rates.bcvRate,
    euroBcvRate: rates.euroBcvRate,
    paraleloRate: rates.paraleloRate,
    createdAt: new Date(),
  }
}

function toPendingTransaction(input: CreateTransactionInput): PendingTransaction {
  return {
    id: input.tempId,
    description: input.description,
    originalAmountCents: input.originalAmountCents,
    originalCurrency: input.originalCurrency,
    category: input.category,
    type: input.type,
    matchedRate: input.matchedRate,
    debtId: input.debtId,
    freezeInBucketId: input.freezeInBucketId,
    enqueuedAt: Date.now(),
  }
}

function applyOptimisticSideEffects(
  queryClient: ReturnType<typeof useQueryClient>,
  input: CreateTransactionInput,
  rates: ActiveRates,
) {
  const usdCents = convertToUsdCents(
    input.originalAmountCents,
    input.originalCurrency,
    {
      bcvRate: rates.bcvRate,
      euroBcvRate: rates.euroBcvRate,
      paraleloRate: rates.paraleloRate,
    },
    input.matchedRate,
  )
  const effectiveType = buildEffectiveTransactionType(toPendingTransaction(input))

  if (effectiveType === "debt_payment" && input.debtId) {
    queryClient.setQueryData<DebtWithMetrics[]>(queryKeys.debts, (old) =>
      (old ?? []).map((debt) => {
        if (debt.id !== input.debtId) return debt
        const remainingCents = Math.max(0, debt.remainingCents - usdCents)
        return {
          ...debt,
          remainingCents,
          progressPercent: debtProgressPercent(debt.totalCents, remainingCents),
          dailyRequiredCents:
            debt.daysRemaining > 0
              ? Math.ceil(remainingCents / debt.daysRemaining)
              : remainingCents,
        }
      }),
    )
  }

  if (shouldFreezeInBucket(input) && input.freezeInBucketId) {
    queryClient.setQueryData<Bucket[]>(queryKeys.buckets, (old) =>
      (old ?? []).map((bucket) =>
        bucket.id === input.freezeInBucketId
          ? { ...bucket, frozenCents: bucket.frozenCents + usdCents }
          : bucket,
      ),
    )
  }
}

export function useCreateTransaction(month: string, category: string) {
  const queryClient = useQueryClient()
  const txKey = queryKeys.transactions(month, category)

  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      const rates = queryClient.getQueryData<ActiveRates>(queryKeys.rates)
      if (!rates?.id) {
        throw new Error("Introduce las tasas antes de registrar.")
      }

      if (isOffline()) {
        return buildOptimisticTransaction(input, rates)
      }

      return createTransaction({
        data: buildTransactionPayload(toPendingTransaction(input)),
      })
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: txKey })
      await queryClient.cancelQueries({ queryKey: queryKeys.debts })
      await queryClient.cancelQueries({ queryKey: queryKeys.buckets })

      const previous = {
        transactions: queryClient.getQueryData<Transaction[]>(txKey),
        debts: queryClient.getQueryData<DebtWithMetrics[]>(queryKeys.debts),
        buckets: queryClient.getQueryData<Bucket[]>(queryKeys.buckets),
      }
      const rates = queryClient.getQueryData<ActiveRates>(queryKeys.rates)

      if (rates?.id) {
        const optimistic = buildOptimisticTransaction(input, rates)
        queryClient.setQueryData<Transaction[]>(txKey, (old) => [
          optimistic,
          ...(old ?? []),
        ])
        applyOptimisticSideEffects(queryClient, input, rates)
      }

      if (isOffline()) {
        enqueueTransaction(toPendingTransaction(input))
      }

      return { previous }
    },
    onError: (_err, input, context) => {
      if (isOffline()) return
      if (context?.previous.transactions) {
        queryClient.setQueryData(txKey, context.previous.transactions)
      }
      if (context?.previous.debts) {
        queryClient.setQueryData(queryKeys.debts, context.previous.debts)
      }
      if (context?.previous.buckets) {
        queryClient.setQueryData(queryKeys.buckets, context.previous.buckets)
      }
      removePendingTransaction(input.tempId)
    },
    onSuccess: (created, input) => {
      removePendingTransaction(input.tempId)
      if (!isOffline() && created) {
        queryClient.setQueryData<Transaction[]>(txKey, (old) =>
          (old ?? []).map((tx) => (tx.id === input.tempId ? created : tx)),
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(month) })
      queryClient.invalidateQueries({ queryKey: queryKeys.debts })
      queryClient.invalidateQueries({ queryKey: queryKeys.buckets })
      if (!isOffline()) {
        queryClient.invalidateQueries({ queryKey: txKey })
      }
    },
  })
}
