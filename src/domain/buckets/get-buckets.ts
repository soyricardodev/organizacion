import { db } from "@/db"
import { buckets, debts } from "@/db/schema"
import { debtProgressPercent, daysUntil } from "@/lib/money"

export async function getBuckets() {
  return db.select().from(buckets).orderBy(buckets.name)
}

export async function getDebts() {
  const rows = await db.select().from(debts).orderBy(debts.priority)
  return rows.map((debt) => ({
    ...debt,
    progressPercent: debtProgressPercent(debt.totalCents, debt.remainingCents),
    daysRemaining: daysUntil(debt.targetDate),
    dailyRequiredCents:
      daysUntil(debt.targetDate) > 0
        ? Math.ceil(debt.remainingCents / daysUntil(debt.targetDate))
        : debt.remainingCents,
  }))
}
