import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import {
  ratesInputSchema,
  transactionInputSchema,
  filterCategorySchema,
} from "@/domain/types"

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
  .inputValidator(transactionInputSchema)
  .handler(async ({ data }) => {
    const { applyTransaction } = await import(
      "@/domain/transactions/apply-transaction"
    )
    return applyTransaction(data)
  })

export const getBuckets = createServerFn({ method: "GET" }).handler(async () => {
  const { getBuckets } = await import("@/domain/buckets/get-buckets")
  return getBuckets()
})

export const getDebts = createServerFn({ method: "GET" }).handler(async () => {
  const { getDebts } = await import("@/domain/buckets/get-buckets")
  return getDebts()
})

export const getDashboardSummary = createServerFn({ method: "GET" })
  .inputValidator(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }))
  .handler(async ({ data }) => {
    const { getDashboardSummary } = await import(
      "@/domain/dashboard/get-summary"
    )
    return getDashboardSummary(data)
  })
