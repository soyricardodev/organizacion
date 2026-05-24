import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const exchangeRates = sqliteTable("exchange_rates", {
  id: text("id").primaryKey(),
  bcvRate: text("bcv_rate").notNull(),
  euroBcvRate: text("euro_bcv_rate").notNull(),
  paraleloRate: text("paralelo_rate").notNull(),
  source: text("source", { enum: ["api", "manual"] }).notNull(),
  fetchedAt: integer("fetched_at", { mode: "timestamp_ms" }).notNull(),
})

export const buckets = sqliteTable("buckets", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  targetCents: integer("target_cents").notNull(),
  frozenCents: integer("frozen_cents").notNull().default(0),
  weeklyTargetCents: integer("weekly_target_cents").notNull(),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
})

export const debts = sqliteTable("debts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  totalCents: integer("total_cents").notNull(),
  remainingCents: integer("remaining_cents").notNull(),
  targetDate: text("target_date").notNull(),
  priority: integer("priority").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
})

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  description: text("description").notNull(),
  originalAmountCents: integer("original_amount_cents").notNull(),
  originalCurrency: text("original_currency", {
    enum: ["VES", "USD", "EUR"],
  }).notNull(),
  usdCents: integer("usd_cents").notNull(),
  category: text("category", {
    enum: ["needs", "wants", "savings", "health", "debt_payment"],
  }).notNull(),
  type: text("type", {
    enum: [
      "expense",
      "income",
      "transfer",
      "bucket_freeze",
      "bucket_release",
      "debt_payment",
    ],
  }).notNull(),
  bucketId: text("bucket_id").references(() => buckets.id),
  debtId: text("debt_id").references(() => debts.id),
  matchedRate: text("matched_rate", {
    enum: ["bcv", "euro_bcv", "paralelo"],
  }).notNull(),
  bcvRate: text("bcv_rate").notNull(),
  euroBcvRate: text("euro_bcv_rate").notNull(),
  paraleloRate: text("paralelo_rate").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
})

export const insights = sqliteTable("insights", {
  id: text("id").primaryKey(),
  weekStart: text("week_start").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
})

export type ExchangeRate = typeof exchangeRates.$inferSelect
export type Bucket = typeof buckets.$inferSelect
export type Debt = typeof debts.$inferSelect
export type Transaction = typeof transactions.$inferSelect
export type Insight = typeof insights.$inferSelect
