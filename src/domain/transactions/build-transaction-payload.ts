import type { PendingTransaction } from "@/lib/offline-queue"
import type { RegisterMovementInput } from "@/domain/types"
import { resolveEffectiveType } from "@/domain/transactions/resolve-effective-type"

export function buildTransactionPayload(
  item: PendingTransaction,
): RegisterMovementInput {
  const type = item.type ?? "expense"
  return {
    description: item.description,
    originalAmountCents: item.originalAmountCents,
    originalCurrency: item.originalCurrency,
    category: item.category,
    type,
    matchedRate: item.matchedRate,
    debtId: item.debtId,
    freezeInBucketId: item.freezeInBucketId,
  }
}

export function buildEffectiveTransactionType(item: PendingTransaction) {
  return resolveEffectiveType({
    type: item.type,
    category: item.category,
    debtId: item.debtId,
  })
}
