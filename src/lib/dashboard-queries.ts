import { currentWeekKey } from "@/domain/dates"
import type { FilterCategory } from "@/domain/types"
import { queryKeys } from "@/lib/query-keys"
import {
  getActiveRates,
  getTransactions,
  getBuckets,
  getDebts,
  getDashboardSummary,
} from "@/server/finance"
import { getCachedInsight, getAiStatus } from "@/server/ai"

export function dashboardQueries(month: string, category: FilterCategory) {
  const weekKey = currentWeekKey()

  return {
    rates: {
      queryKey: queryKeys.rates,
      queryFn: () => getActiveRates(),
    },
    transactions: {
      queryKey: queryKeys.transactions(month, category),
      queryFn: () => getTransactions({ data: { month, category } }),
    },
    buckets: {
      queryKey: queryKeys.buckets,
      queryFn: () => getBuckets(),
    },
    debts: {
      queryKey: queryKeys.debts,
      queryFn: () => getDebts(),
    },
    summary: {
      queryKey: queryKeys.dashboard(month),
      queryFn: () => getDashboardSummary({ data: { month } }),
    },
    insight: {
      queryKey: queryKeys.insights(weekKey),
      queryFn: () => getCachedInsight(),
    },
    aiStatus: {
      queryKey: queryKeys.aiStatus,
      queryFn: () => getAiStatus(),
      staleTime: 60_000,
    },
  } as const
}

export type DashboardQueries = ReturnType<typeof dashboardQueries>

export function dashboardQueryList(month: string, category: FilterCategory) {
  return Object.values(dashboardQueries(month, category))
}
