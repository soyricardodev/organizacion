import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateDebt as updateDebtFn } from "@/server/finance"
import { queryKeys } from "@/lib/query-keys"
import type { UpdateDebtInput } from "@/domain/buckets/schemas"
import type { Debt } from "@/db/schema"
import { debtProgressPercent, daysUntil } from "@/lib/money"

type DebtWithMetrics = Debt & {
  progressPercent: number
  daysRemaining: number
  dailyRequiredCents: number
}

function enrichDebt(debt: Debt): DebtWithMetrics {
  const daysRemaining = daysUntil(debt.targetDate)
  return {
    ...debt,
    progressPercent: debtProgressPercent(debt.totalCents, debt.remainingCents),
    daysRemaining,
    dailyRequiredCents:
      daysRemaining > 0
        ? Math.ceil(debt.remainingCents / daysRemaining)
        : debt.remainingCents,
  }
}

export function useUpdateDebt(month: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateDebtInput) => updateDebtFn({ data }),
    onSuccess: (updated) => {
      queryClient.setQueryData<DebtWithMetrics[]>(queryKeys.debts, (old) =>
        (old ?? []).map((debt) =>
          debt.id === updated.id ? enrichDebt(updated) : debt,
        ),
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(month) })
    },
  })
}
