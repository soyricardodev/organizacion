import { eq } from "drizzle-orm"
import { db } from "@/db"
import { loveActivities } from "@/db/schema"
import {
  serializeLoveTags,
  type CreateLoveActivityInput,
  type UpdateLoveActivityInput,
} from "@/domain/loveops/types"

export async function createLoveActivity(data: CreateLoveActivityInput) {
  const id = crypto.randomUUID()
  const now = new Date()

  await db.insert(loveActivities).values({
    id,
    title: data.title.trim(),
    category: data.category,
    tags: serializeLoveTags(data.tags),
    costEstimation: data.costEstimation,
    weatherPreference: data.weatherPreference,
    frequencyDaysTarget: data.frequencyDaysTarget,
    notes: data.notes ?? null,
    lastExecutedAt: null,
    active: true,
    createdAt: now,
  })

  const [created] = await db
    .select()
    .from(loveActivities)
    .where(eq(loveActivities.id, id))
    .limit(1)

  return created
}

export async function updateLoveActivity(data: UpdateLoveActivityInput) {
  const patch: Partial<typeof loveActivities.$inferInsert> = {}

  if (data.title !== undefined) patch.title = data.title.trim()
  if (data.category !== undefined) patch.category = data.category
  if (data.tags !== undefined) patch.tags = serializeLoveTags(data.tags)
  if (data.costEstimation !== undefined) patch.costEstimation = data.costEstimation
  if (data.weatherPreference !== undefined) {
    patch.weatherPreference = data.weatherPreference
  }
  if (data.frequencyDaysTarget !== undefined) {
    patch.frequencyDaysTarget = data.frequencyDaysTarget
  }
  if (data.notes !== undefined) patch.notes = data.notes ?? null
  if (data.active !== undefined) patch.active = data.active

  await db
    .update(loveActivities)
    .set(patch)
    .where(eq(loveActivities.id, data.id))

  const [updated] = await db
    .select()
    .from(loveActivities)
    .where(eq(loveActivities.id, data.id))
    .limit(1)

  if (!updated) throw new Error("Actividad no encontrada.")
  return updated
}
