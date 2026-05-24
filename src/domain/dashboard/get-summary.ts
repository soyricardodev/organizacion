import { eq, and } from "drizzle-orm"
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
    .where(
      and(
        transactionsInMonth(data.month, transactions),
        eq(transactions.type, "expense"),
      ),
    )

  const spendingByCategory = monthTransactions.reduce(
    (acc, tx) => {
      acc[tx.category] = (acc[tx.category] ?? 0) + tx.usdCents
      return acc
    },
    {} as Record<string, number>,
  )

  const totalSpent = monthTransactions.reduce((sum, tx) => sum + tx.usdCents, 0)

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
