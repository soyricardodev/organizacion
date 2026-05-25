import { currentWeekKey } from "@/domain/dates"

export const queryKeys = {
  rates: ["rates"] as const,
  transactions: (month: string, category: string) =>
    ["transactions", month, category] as const,
  buckets: ["buckets"] as const,
  debts: ["debts"] as const,
  insights: (weekStart: string = currentWeekKey()) =>
    ["insights", weekStart] as const,
  dashboard: (month: string) => ["dashboard", month] as const,
  aiStatus: ["ai-status"] as const,
  loveops: (month: string) => ["loveops", month] as const,
  loveActivities: ["love-activities"] as const,
  loveProjects: ["love-projects"] as const,
}
