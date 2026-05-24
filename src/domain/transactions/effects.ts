import { eq } from "drizzle-orm"
import type { db } from "@/db"
import { buckets, debts } from "@/db/schema"

type DbTx = Parameters<Parameters<typeof db.transaction>[0]>[0]

export async function applyDebtPaymentEffect(
  tx: DbTx,
  debtId: string,
  usdCents: number,
) {
  const [debt] = await tx
    .select()
    .from(debts)
    .where(eq(debts.id, debtId))
    .limit(1)

  if (!debt) return

  await tx
    .update(debts)
    .set({ remainingCents: Math.max(0, debt.remainingCents - usdCents) })
    .where(eq(debts.id, debtId))
}

export async function applyBucketFreezeEffect(
  tx: DbTx,
  bucketId: string,
  usdCents: number,
) {
  const [bucket] = await tx
    .select()
    .from(buckets)
    .where(eq(buckets.id, bucketId))
    .limit(1)

  if (!bucket) return

  await tx
    .update(buckets)
    .set({ frozenCents: bucket.frozenCents + usdCents })
    .where(eq(buckets.id, bucketId))
}
