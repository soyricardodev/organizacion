import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  allocateToBucket,
  releaseFromBucket,
  transferBetweenBuckets,
} from "@/server/finance"
import { queryKeys } from "@/lib/query-keys"
import {
  enqueueBucketAllocate,
  enqueueBucketRelease,
  enqueueBucketTransfer,
  removePendingItem,
} from "@/lib/offline-queue"
import { convertToUsdCents } from "@/lib/money"
import type { Bucket, Transaction } from "@/db/schema"
import type { ActiveRates } from "@/lib/rates"
import type {
  BucketOperationInput,
} from "@/domain/transactions/bucket-operation-schemas"
import type { Currency, MatchedRate } from "@/domain/types"

export type BucketOpMode = "allocate" | "release" | "transfer"

export interface BucketOperationFormInput {
  tempId: string
  mode: BucketOpMode
  bucketId: string
  toBucketId?: string
  description: string
  originalAmountCents: number
  originalCurrency: Currency
  matchedRate: MatchedRate
}

function isOffline() {
  return typeof navigator !== "undefined" && !navigator.onLine
}

function buildOptimisticBucketTx(
  input: BucketOperationFormInput,
  rates: ActiveRates,
  type: Transaction["type"],
  bucketId: string,
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
    category: "savings",
    type,
    bucketId,
    debtId: null,
    matchedRate: input.matchedRate,
    bcvRate: rates.bcvRate,
    euroBcvRate: rates.euroBcvRate,
    paraleloRate: rates.paraleloRate,
    createdAt: new Date(),
  }
}

function applyBucketOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  input: BucketOperationFormInput,
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

  queryClient.setQueryData<Bucket[]>(queryKeys.buckets, (old) =>
    (old ?? []).map((bucket) => {
      if (input.mode === "allocate" && bucket.id === input.bucketId) {
        return { ...bucket, frozenCents: bucket.frozenCents + usdCents }
      }
      if (input.mode === "release" && bucket.id === input.bucketId) {
        return {
          ...bucket,
          frozenCents: Math.max(0, bucket.frozenCents - usdCents),
        }
      }
      if (input.mode === "transfer") {
        if (bucket.id === input.bucketId) {
          return {
            ...bucket,
            frozenCents: Math.max(0, bucket.frozenCents - usdCents),
          }
        }
        if (bucket.id === input.toBucketId) {
          return { ...bucket, frozenCents: bucket.frozenCents + usdCents }
        }
      }
      return bucket
    }),
  )
}

function toServerPayload(input: BucketOperationFormInput): BucketOperationInput {
  return {
    bucketId: input.bucketId,
    description: input.description,
    originalAmountCents: input.originalAmountCents,
    originalCurrency: input.originalCurrency,
    matchedRate: input.matchedRate,
  }
}

export function useBucketOperation(month: string, category: string) {
  const queryClient = useQueryClient()
  const txKey = queryKeys.transactions(month, category)

  return useMutation({
    mutationFn: async (input: BucketOperationFormInput) => {
      const rates = queryClient.getQueryData<ActiveRates>(queryKeys.rates)
      if (!rates?.id) {
        throw new Error("Introduce las tasas antes de registrar.")
      }

      if (isOffline()) {
        return buildOptimisticBucketTx(
          input,
          rates,
          input.mode === "release" ? "bucket_release" : "bucket_freeze",
          input.bucketId,
        )
      }

      const payload = toServerPayload(input)
      if (input.mode === "allocate") {
        return allocateToBucket({ data: payload })
      }
      if (input.mode === "release") {
        return releaseFromBucket({ data: payload })
      }
      return transferBetweenBuckets({
        data: {
          ...payload,
          toBucketId: input.toBucketId!,
        },
      })
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: txKey })
      await queryClient.cancelQueries({ queryKey: queryKeys.buckets })

      const previous = {
        transactions: queryClient.getQueryData<Transaction[]>(txKey),
        buckets: queryClient.getQueryData<Bucket[]>(queryKeys.buckets),
      }
      const rates = queryClient.getQueryData<ActiveRates>(queryKeys.rates)

      if (rates?.id) {
        const optimisticType =
          input.mode === "release" ? "bucket_release" : "bucket_freeze"
        const optimistic = buildOptimisticBucketTx(
          input,
          rates,
          optimisticType,
          input.bucketId,
        )
        queryClient.setQueryData<Transaction[]>(txKey, (old) => [
          optimistic,
          ...(old ?? []),
        ])
        applyBucketOptimistic(queryClient, input, rates)
      }

      if (isOffline()) {
        const base = {
          id: input.tempId,
          bucketId: input.bucketId,
          description: input.description,
          originalAmountCents: input.originalAmountCents,
          originalCurrency: input.originalCurrency,
          matchedRate: input.matchedRate,
          enqueuedAt: Date.now(),
        }
        if (input.mode === "allocate") enqueueBucketAllocate(base)
        else if (input.mode === "release") enqueueBucketRelease(base)
        else if (input.toBucketId) {
          enqueueBucketTransfer({ ...base, toBucketId: input.toBucketId })
        }
      }

      return { previous }
    },
    onError: (_err, input, context) => {
      if (isOffline()) return
      if (context?.previous.transactions) {
        queryClient.setQueryData(txKey, context.previous.transactions)
      }
      if (context?.previous.buckets) {
        queryClient.setQueryData(queryKeys.buckets, context.previous.buckets)
      }
      removePendingItem(input.tempId)
    },
    onSuccess: (created, input) => {
      removePendingItem(input.tempId)
      if (!isOffline() && created) {
        queryClient.setQueryData<Transaction[]>(txKey, (old) =>
          (old ?? []).map((tx) => (tx.id === input.tempId ? created : tx)),
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(month) })
      queryClient.invalidateQueries({ queryKey: queryKeys.buckets })
      if (!isOffline()) {
        queryClient.invalidateQueries({ queryKey: txKey })
      }
    },
  })
}
