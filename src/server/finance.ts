import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import {
  ratesInputSchema,
  registerMovementSchema,
  filterCategorySchema,
} from "@/domain/types"
import {
  bucketOperationSchema,
  bucketTransferSchema,
} from "@/domain/transactions/bucket-operation-schemas"
import {
  updateDebtSchema,
  updateBucketSchema,
} from "@/domain/buckets/schemas"

export const getActiveRates = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getActiveRates } = await import("@/domain/rates/get-active-rates")
    return getActiveRates()
  },
)

export const saveManualRates = createServerFn({ method: "POST" })
  .inputValidator(ratesInputSchema)
  .handler(async ({ data }) => {
    const { saveManualRates } = await import("@/domain/rates/save-manual-rates")
    return saveManualRates(data)
  })

export const getTransactions = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      month: z.string().regex(/^\d{4}-\d{2}$/),
      category: filterCategorySchema.default("all"),
    }),
  )
  .handler(async ({ data }) => {
    const { getTransactions } = await import(
      "@/domain/transactions/get-transactions"
    )
    return getTransactions(data)
  })

export const createTransaction = createServerFn({ method: "POST" })
  .inputValidator(registerMovementSchema)
  .handler(async ({ data }) => {
    const { registerMovement } = await import(
      "@/domain/transactions/register-movement"
    )
    return registerMovement(data)
  })

export const allocateToBucket = createServerFn({ method: "POST" })
  .inputValidator(bucketOperationSchema)
  .handler(async ({ data }) => {
    const { allocateToBucket } = await import(
      "@/domain/transactions/allocate-bucket"
    )
    return allocateToBucket(data)
  })

export const releaseFromBucket = createServerFn({ method: "POST" })
  .inputValidator(bucketOperationSchema)
  .handler(async ({ data }) => {
    const { releaseFromBucket } = await import(
      "@/domain/transactions/release-bucket"
    )
    return releaseFromBucket(data)
  })

export const transferBetweenBuckets = createServerFn({ method: "POST" })
  .inputValidator(bucketTransferSchema)
  .handler(async ({ data }) => {
    const { transferBetweenBuckets } = await import(
      "@/domain/transactions/transfer-bucket"
    )
    return transferBetweenBuckets(data)
  })

export const getBuckets = createServerFn({ method: "GET" }).handler(async () => {
  const { getBuckets } = await import("@/domain/buckets/get-buckets")
  return getBuckets()
})

export const getDebts = createServerFn({ method: "GET" }).handler(async () => {
  const { getDebts } = await import("@/domain/buckets/get-buckets")
  return getDebts()
})

export const updateDebt = createServerFn({ method: "POST" })
  .inputValidator(updateDebtSchema)
  .handler(async ({ data }) => {
    const { updateDebt } = await import("@/domain/buckets/update-debt")
    return updateDebt(data)
  })

export const updateBucket = createServerFn({ method: "POST" })
  .inputValidator(updateBucketSchema)
  .handler(async ({ data }) => {
    const { updateBucket } = await import("@/domain/buckets/update-bucket")
    return updateBucket(data)
  })

export const getDashboardSummary = createServerFn({ method: "GET" })
  .inputValidator(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }))
  .handler(async ({ data }) => {
    const { getDashboardSummary } = await import(
      "@/domain/dashboard/get-summary"
    )
    return getDashboardSummary(data)
  })
