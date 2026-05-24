export const queryKeys = {
  rates: ["rates"] as const,
  transactions: (month: string, category: string) =>
    ["transactions", month, category] as const,
  buckets: ["buckets"] as const,
  debts: ["debts"] as const,
  insights: (weekStart: string) => ["insights", weekStart] as const,
  dashboard: (month: string) => ["dashboard", month] as const,
}
