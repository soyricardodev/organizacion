import type { Category, TransactionType } from "@/domain/types"

export function resolveEffectiveType(input: {
  type?: TransactionType
  category: Category
  debtId?: string
}): TransactionType {
  const base = input.type ?? "expense"
  if (base === "expense" && input.category === "debt_payment" && input.debtId) {
    return "debt_payment"
  }
  return base
}
