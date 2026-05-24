import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { flushPendingTransactions } from "@/lib/sync/flush-pending-transactions"
import { queryKeys } from "@/lib/query-keys"

export function OfflineSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    async function flush() {
      const synced = await flushPendingTransactions()
      if (synced === 0) return

      queryClient.invalidateQueries({ queryKey: queryKeys.rates })
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    }

    flush()
    window.addEventListener("online", flush)
    return () => window.removeEventListener("online", flush)
  }, [queryClient])

  return null
}
