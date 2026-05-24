import type { PendingTransaction } from "@/lib/offline-queue"
import type { ExpenseInput } from "@/domain/types"

export function buildExpensePayload(item: PendingTransaction): ExpenseInput {
  return {
    description: item.description,
    originalAmountCents: item.originalAmountCents,
    originalCurrency: item.originalCurrency,
    category: item.category,
    type: "expense",
    matchedRate: item.matchedRate,
  }
}
