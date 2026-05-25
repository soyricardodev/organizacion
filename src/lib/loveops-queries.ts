import {
  getLoveActivities,
  getLoveHomeProjects,
  getLoveopsSummary,
} from "@/server/loveops"
import { getAiStatus } from "@/server/ai"
import { queryKeys } from "@/lib/query-keys"

export function loveopsQueries(month: string) {
  return {
    summary: {
      queryKey: queryKeys.loveops(month),
      queryFn: () => getLoveopsSummary({ data: { month } }),
    },
    activities: {
      queryKey: queryKeys.loveActivities,
      queryFn: () => getLoveActivities(),
    },
    projects: {
      queryKey: queryKeys.loveProjects,
      queryFn: () => getLoveHomeProjects(),
    },
    aiStatus: {
      queryKey: queryKeys.aiStatus,
      queryFn: () => getAiStatus(),
      staleTime: 60_000,
    },
  } as const
}

export function loveopsQueryList(month: string) {
  return Object.values(loveopsQueries(month))
}
