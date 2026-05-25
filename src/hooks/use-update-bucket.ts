import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateBucket as updateBucketFn } from "@/server/finance"
import { queryKeys } from "@/lib/query-keys"
import type { UpdateBucketInput } from "@/domain/buckets/schemas"
import type { Bucket } from "@/db/schema"

export function useUpdateBucket(month: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateBucketInput) => updateBucketFn({ data }),
    onSuccess: (updated) => {
      queryClient.setQueryData<Bucket[]>(queryKeys.buckets, (old) =>
        (old ?? []).map((bucket) =>
          bucket.id === updated.id ? updated : bucket,
        ),
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(month) })
    },
  })
}
