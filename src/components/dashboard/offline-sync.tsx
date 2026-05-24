import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { createTransaction } from "@/server/finance"
import {
  getPendingTransactions,
  removePendingTransaction,
} from "@/lib/offline-queue"
import { queryKeys } from "@/lib/query-keys"

export function OfflineSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    async function flush() {
      if (!navigator.onLine) return

      const pending = getPendingTransactions()
      if (pending.length === 0) return

      for (const item of pending) {
        try {
          await createTransaction({
            data: {
              description: item.description,
              originalAmountCents: item.originalAmountCents,
              originalCurrency: item.originalCurrency,
              category: item.category,
              type: "expense",
              matchedRate: item.matchedRate,
            },
          })
          removePendingTransaction(item.id)
        } catch {
          break
        }
      }

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
