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

export const loveActivities = sqliteTable("love_activities", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category", {
    enum: ["ritual", "micro", "experience"],
  }).notNull(),
  tags: text("tags").notNull(),
  costEstimation: text("cost_estimation", {
    enum: ["zero", "low", "high"],
  }).notNull(),
  weatherPreference: text("weather_preference", {
    enum: ["any", "rain", "cold"],
  })
    .notNull()
    .default("any"),
  frequencyDaysTarget: integer("frequency_days_target").notNull().default(7),
  lastExecutedAt: integer("last_executed_at", { mode: "timestamp_ms" }),
  notes: text("notes"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
})

export const loveActivityLogs = sqliteTable("love_activity_logs", {
  id: text("id").primaryKey(),
  activityId: text("activity_id")
    .references(() => loveActivities.id)
    .notNull(),
  notes: text("notes"),
  executedAt: integer("executed_at", { mode: "timestamp_ms" }).notNull(),
})

export const loveHomeProjects = sqliteTable("love_home_projects", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  column: text("column", {
    enum: ["ideas", "materials", "in_progress", "done"],
  }).notNull(),
  costEstimation: text("cost_estimation", {
    enum: ["zero", "low", "high"],
  })
    .notNull()
    .default("zero"),
  notes: text("notes"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
})

export const loveSettings = sqliteTable("love_settings", {
  id: text("id").primaryKey(),
  partnerName: text("partner_name").notNull(),
  notificationsEnabled: integer("notifications_enabled", { mode: "boolean" })
    .notNull()
    .default(true),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
})

export type ExchangeRate = typeof exchangeRates.$inferSelect
export type Bucket = typeof buckets.$inferSelect
export type Debt = typeof debts.$inferSelect
export type Transaction = typeof transactions.$inferSelect
export type Insight = typeof insights.$inferSelect
export type LoveActivity = typeof loveActivities.$inferSelect
export type LoveActivityLog = typeof loveActivityLogs.$inferSelect
export type LoveHomeProject = typeof loveHomeProjects.$inferSelect
export type LoveSettings = typeof loveSettings.$inferSelect
