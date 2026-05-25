import { eq } from "drizzle-orm"
import { db } from "@/db"
import { debts } from "@/db/schema"
import type { UpdateDebtInput } from "@/domain/buckets/schemas"

export async function updateDebt(data: UpdateDebtInput) {
  await db
    .update(debts)
    .set({
      name: data.name,
      totalCents: data.totalCents,
      remainingCents: data.remainingCents,
      targetDate: data.targetDate,
      priority: data.priority,
    })
    .where(eq(debts.id, data.id))

  const [updated] = await db
    .select()
    .from(debts)
    .where(eq(debts.id, data.id))
    .limit(1)

  if (!updated) {
    throw new Error("Deuda no encontrada.")
  }

  return updated
}
