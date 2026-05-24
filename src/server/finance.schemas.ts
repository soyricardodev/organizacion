import { z } from "zod"

export const ratesInputSchema = z.object({
  bcvRate: z.string().regex(/^\d+\.\d{4}$/),
  euroBcvRate: z.string().regex(/^\d+\.\d{4}$/),
  paraleloRate: z.string().regex(/^\d+\.\d{4}$/),
})

export const transactionInputSchema = z.object({
  description: z.string().min(1).max(500),
  originalAmountCents: z.number().int().positive(),
  originalCurrency: z.enum(["VES", "USD", "EUR"]),
  category: z.enum(["needs", "wants", "savings", "health", "debt_payment"]),
  type: z
    .enum([
      "expense",
      "income",
      "transfer",
      "bucket_freeze",
      "bucket_release",
      "debt_payment",
    ])
    .default("expense"),
  matchedRate: z.enum(["bcv", "euro_bcv", "paralelo"]),
  bucketId: z.string().optional(),
  debtId: z.string().optional(),
})
