import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createTransaction } from "@/server/finance"
import { queryKeys } from "@/lib/query-keys"
import {
  enqueueTransaction,
  removePendingTransaction,
  type PendingTransaction,
} from "@/lib/offline-queue"
import { convertToUsdCents } from "@/lib/money"
import type { Transaction } from "@/db/schema"
import type { ActiveRates } from "@/lib/rates"
import { buildExpensePayload } from "@/domain/transactions/build-expense-payload"
import type { Category, Currency, MatchedRate } from "@/domain/types"

function isOffline() {
  return typeof navigator !== "undefined" && !navigator.onLine
}

export interface CreateExpenseInput {
  tempId: string
  description: string
  originalAmountCents: number
  originalCurrency: Currency
  category: Category
  matchedRate: MatchedRate
}

function buildOptimisticTransaction(
  input: CreateExpenseInput,
  rates: ActiveRates,
): Transaction {
  const rateSnapshot = {
    bcvRate: rates.bcvRate,
    euroBcvRate: rates.euroBcvRate,
    paraleloRate: rates.paraleloRate,
  }
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
    category: input.category,
    type: "expense",
    bucketId: null,
    debtId: null,
    matchedRate: input.matchedRate,
    bcvRate: rates.bcvRate,
    euroBcvRate: rates.euroBcvRate,
    paraleloRate: rates.paraleloRate,
    createdAt: new Date(),
  }
}

function toPendingTransaction(input: CreateExpenseInput): PendingTransaction {
  return {
    id: input.tempId,
    description: input.description,
    originalAmountCents: input.originalAmountCents,
    originalCurrency: input.originalCurrency,
    category: input.category,
    matchedRate: input.matchedRate,
    enqueuedAt: Date.now(),
  }
}

export function useCreateTransaction(month: string, category: string) {
  const queryClient = useQueryClient()
  const txKey = queryKeys.transactions(month, category)

  return useMutation({
    mutationFn: async (input: CreateExpenseInput) => {
      const rates = queryClient.getQueryData<ActiveRates>(queryKeys.rates)
      if (!rates?.id) {
        throw new Error("Introduce las tasas antes de registrar.")
      }

      if (isOffline()) {
        return buildOptimisticTransaction(input, rates)
      }

      return createTransaction({ data: buildExpensePayload(toPendingTransaction(input)) })
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: txKey })
      const previous = queryClient.getQueryData<Transaction[]>(txKey)
      const rates = queryClient.getQueryData<ActiveRates>(queryKeys.rates)

      if (rates?.id) {
        const optimistic = buildOptimisticTransaction(input, rates)
        queryClient.setQueryData<Transaction[]>(txKey, (old) => [
          optimistic,
          ...(old ?? []),
        ])
      }

      if (isOffline()) {
        enqueueTransaction(toPendingTransaction(input))
      }

      return { previous }
    },
    onError: (_err, input, context) => {
      if (isOffline()) return
      if (context?.previous) {
        queryClient.setQueryData(txKey, context.previous)
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
      if (!isOffline()) {
        queryClient.invalidateQueries({ queryKey: txKey })
      }
    },
  })
}
