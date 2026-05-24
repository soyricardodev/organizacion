import { createTransaction } from "@/server/finance"
import {
  getPendingTransactions,
  removePendingTransaction,
} from "@/lib/offline-queue"
import { buildExpensePayload } from "@/domain/transactions/build-expense-payload"

export async function flushPendingTransactions() {
  if (typeof navigator !== "undefined" && !navigator.onLine) return 0

  const pending = getPendingTransactions()
  if (pending.length === 0) return 0

  let synced = 0

  for (const item of pending) {
    try {
      await createTransaction({ data: buildExpensePayload(item) })
      removePendingTransaction(item.id)
      synced += 1
    } catch {
      break
    }
  }

  return synced
}
