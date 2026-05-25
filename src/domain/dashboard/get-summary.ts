import { db } from "@/db"
import { transactions, buckets, debts } from "@/db/schema"
import { MINIMUM_MONTHLY_COST_CENTS, DEBT_TARGET_DATE } from "@/lib/constants"
import {
  runwayMonths,
  debtProgressPercent,
  daysUntil,
} from "@/lib/money"
import { transactionsInMonth } from "@/domain/dates"

export async function getDashboardSummary(data: { month: string }) {
  const monthTransactions = await db
    .select()
    .from(transactions)
    .where(transactionsInMonth(data.month, transactions))

  const expenseTransactions = monthTransactions.filter(
    (tx) => tx.type === "expense" || tx.type === "debt_payment",
  )
  const incomeTransactions = monthTransactions.filter(
    (tx) => tx.type === "income",
  )
  const freezeTransactions = monthTransactions.filter(
    (tx) => tx.type === "bucket_freeze",
  )
  const releaseTransactions = monthTransactions.filter(
    (tx) => tx.type === "bucket_release",
  )

  const spendingByCategory = expenseTransactions.reduce(
    (acc, tx) => {
      acc[tx.category] = (acc[tx.category] ?? 0) + tx.usdCents
      return acc
    },
    {} as Record<string, number>,
  )

  const totalSpent = expenseTransactions.reduce(
    (sum, tx) => sum + tx.usdCents,
    0,
  )
  const totalIncome = incomeTransactions.reduce(
    (sum, tx) => sum + tx.usdCents,
    0,
  )
  const totalAllocated = freezeTransactions.reduce(
    (sum, tx) => sum + tx.usdCents,
    0,
  )
  const totalReleased = releaseTransactions.reduce(
    (sum, tx) => sum + tx.usdCents,
    0,
  )

  const bucketRows = await db.select().from(buckets)
  const emergency = bucketRows.find((b) => b.slug === "emergency")
  const runway = runwayMonths(
    emergency?.frozenCents ?? 0,
    MINIMUM_MONTHLY_COST_CENTS,
  )

  const debtRows = await db.select().from(debts)
  const totalDebtRemaining = debtRows.reduce(
    (sum, d) => sum + d.remainingCents,
    0,
  )
  const totalDebtOriginal = debtRows.reduce((sum, d) => sum + d.totalCents, 0)

  return {
    spendingByCategory,
    totalSpent,
    totalIncome,
    totalAllocated,
    totalReleased,
    netBalance: totalIncome - totalSpent,
    availableBalance:
      totalIncome - totalSpent - totalAllocated + totalReleased,
    runway,
    emergencyCents: emergency?.frozenCents ?? 0,
    minimumMonthlyCostCents: MINIMUM_MONTHLY_COST_CENTS,
    debtTargetDate: DEBT_TARGET_DATE,
    totalDebtRemaining,
    totalDebtOriginal,
    debtProgressPercent: debtProgressPercent(
      totalDebtOriginal,
      totalDebtRemaining,
    ),
    daysToDebtTarget: daysUntil(DEBT_TARGET_DATE),
  }
}
