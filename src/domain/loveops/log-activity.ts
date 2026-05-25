import { eq } from "drizzle-orm"
import { db } from "@/db"
import { loveActivities, loveActivityLogs } from "@/db/schema"
import type { LogLoveActivityInput } from "@/domain/loveops/types"

export async function logLoveActivity(data: LogLoveActivityInput) {
  const now = new Date()
  const id = crypto.randomUUID()

  return db.transaction(async (tx) => {
    const [activity] = await tx
      .select()
      .from(loveActivities)
      .where(eq(loveActivities.id, data.activityId))
      .limit(1)

    if (!activity) {
      throw new Error("Actividad no encontrada.")
    }

    await tx.insert(loveActivityLogs).values({
      id,
      activityId: data.activityId,
      notes: data.notes ?? null,
      executedAt: now,
    })

    await tx
      .update(loveActivities)
      .set({ lastExecutedAt: now })
      .where(eq(loveActivities.id, data.activityId))

    return {
      id,
      activityId: data.activityId,
      title: activity.title,
      executedAt: now,
    }
  })
}
