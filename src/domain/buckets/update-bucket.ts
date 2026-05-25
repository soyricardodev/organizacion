import { eq } from "drizzle-orm"
import { db } from "@/db"
import { buckets } from "@/db/schema"
import type { UpdateBucketInput } from "@/domain/buckets/schemas"

export async function updateBucket(data: UpdateBucketInput) {
  await db
    .update(buckets)
    .set({
      name: data.name,
      targetCents: data.targetCents,
      weeklyTargetCents: data.weeklyTargetCents,
    })
    .where(eq(buckets.id, data.id))

  const [updated] = await db
    .select()
    .from(buckets)
    .where(eq(buckets.id, data.id))
    .limit(1)

  if (!updated) {
    throw new Error("Bucket no encontrado.")
  }

  return updated
}
