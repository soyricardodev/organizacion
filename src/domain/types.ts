import { z } from "zod"

export const CURRENCIES = ["VES", "USD", "EUR"] as const
export type Currency = (typeof CURRENCIES)[number]
export const currencySchema = z.enum(CURRENCIES)

export const CATEGORIES = [
  "needs",
  "wants",
  "savings",
  "health",
  "debt_payment",
] as const
export type Category = (typeof CATEGORIES)[number]
export const categorySchema = z.enum(CATEGORIES)

export const FILTER_CATEGORIES = ["all", ...CATEGORIES] as const
export type FilterCategory = (typeof FILTER_CATEGORIES)[number]
export const filterCategorySchema = z.enum(FILTER_CATEGORIES)

export const MATCHED_RATES = ["bcv", "euro_bcv", "paralelo"] as const
export type MatchedRate = (typeof MATCHED_RATES)[number]
export const matchedRateSchema = z.enum(MATCHED_RATES)

export const TRANSACTION_TYPES = [
  "expense",
  "income",
  "transfer",
  "bucket_freeze",
  "bucket_release",
  "debt_payment",
] as const
export type TransactionType = (typeof TRANSACTION_TYPES)[number]
export const transactionTypeSchema = z.enum(TRANSACTION_TYPES)

export const ratesInputSchema = z.object({
  bcvRate: z.string().regex(/^\d+\.\d{4}$/),
  euroBcvRate: z.string().regex(/^\d+\.\d{4}$/),
  paraleloRate: z.string().regex(/^\d+\.\d{4}$/),
})

export const transactionInputSchema = z.object({
  description: z.string().min(1).max(500),
  originalAmountCents: z.number().int().positive(),
  originalCurrency: currencySchema,
  category: categorySchema,
  type: transactionTypeSchema.default("expense"),
  matchedRate: matchedRateSchema,
  bucketId: z.string().optional(),
  debtId: z.string().optional(),
})

export type TransactionInput = z.infer<typeof transactionInputSchema>

export const expenseInputSchema = transactionInputSchema.extend({
  type: z.literal("expense").default("expense"),
})

export type ExpenseInput = z.infer<typeof expenseInputSchema>
