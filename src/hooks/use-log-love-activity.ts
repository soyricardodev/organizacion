import { useMutation, useQueryClient } from "@tanstack/react-query"
import { logLoveActivity } from "@/server/loveops"
import { queryKeys } from "@/lib/query-keys"
import type { LogLoveActivityInput } from "@/domain/loveops/types"

export function useLogLoveActivity(month: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LogLoveActivityInput) => logLoveActivity({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loveops(month) })
      queryClient.invalidateQueries({ queryKey: queryKeys.loveActivities })
    },
  })
}
