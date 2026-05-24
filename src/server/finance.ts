import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import {
  ratesInputSchema,
  transactionInputSchema,
} from "./finance.schemas"

export const getActiveRates = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getActiveRatesImpl } = await import("./finance.server")
    return getActiveRatesImpl()
  },
)

export const saveManualRates = createServerFn({ method: "POST" })
  .inputValidator(ratesInputSchema)
  .handler(async ({ data }) => {
    const { saveManualRatesImpl } = await import("./finance.server")
    return saveManualRatesImpl(data)
  })

export const getTransactions = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      month: z.string().regex(/^\d{4}-\d{2}$/),
      category: z
        .enum(["all", "needs", "wants", "savings", "health", "debt_payment"])
        .default("all"),
    }),
  )
  .handler(async ({ data }) => {
    const { getTransactionsImpl } = await import("./finance.server")
    return getTransactionsImpl(data)
  })

export const createTransaction = createServerFn({ method: "POST" })
  .inputValidator(transactionInputSchema)
  .handler(async ({ data }) => {
    const { createTransactionImpl } = await import("./finance.server")
    return createTransactionImpl(data)
  })

export const getBuckets = createServerFn({ method: "GET" }).handler(async () => {
  const { getBucketsImpl } = await import("./finance.server")
  return getBucketsImpl()
})

export const getDebts = createServerFn({ method: "GET" }).handler(async () => {
  const { getDebtsImpl } = await import("./finance.server")
  return getDebtsImpl()
})

export const getDashboardSummary = createServerFn({ method: "GET" })
  .inputValidator(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }))
  .handler(async ({ data }) => {
    const { getDashboardSummaryImpl } = await import("./finance.server")
    return getDashboardSummaryImpl(data)
  })

export const getLatestInsight = createServerFn({ method: "GET" })
  .inputValidator(z.object({ weekStart: z.string() }))
  .handler(async ({ data }) => {
    const { getLatestInsightImpl } = await import("./finance.server")
    return getLatestInsightImpl(data)
  })

export const freezeToBucket = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      bucketId: z.string(),
      usdCents: z.number().int().positive(),
      description: z.string().default("Congelado en bucket"),
    }),
  )
  .handler(async ({ data }) => {
    const { freezeToBucketImpl } = await import("./finance.server")
    return freezeToBucketImpl(data)
  })
