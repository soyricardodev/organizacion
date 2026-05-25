import { eq } from "drizzle-orm"
import { db } from "@/db"
import { loveHomeProjects } from "@/db/schema"
import type {
  CreateLoveProjectInput,
  LoveProjectColumn,
  MoveLoveProjectInput,
  UpdateLoveProjectInput,
} from "@/domain/loveops/types"

export async function getLoveHomeProjects() {
  const rows = await db
    .select()
    .from(loveHomeProjects)
    .orderBy(loveHomeProjects.column, loveHomeProjects.sortOrder)

  const grouped = {
    ideas: [] as typeof rows,
    materials: [] as typeof rows,
    in_progress: [] as typeof rows,
    done: [] as typeof rows,
  }

  for (const row of rows) {
    grouped[row.column].push(row)
  }

  return grouped
}

export async function createLoveHomeProject(data: CreateLoveProjectInput) {
  const now = new Date()
  const id = crypto.randomUUID()
  const existing = await db
    .select({ id: loveHomeProjects.id })
    .from(loveHomeProjects)
    .where(eq(loveHomeProjects.column, data.column))

  await db.insert(loveHomeProjects).values({
    id,
    title: data.title,
    column: data.column,
    costEstimation: data.costEstimation,
    notes: data.notes ?? null,
    sortOrder: existing.length,
    createdAt: now,
    updatedAt: now,
  })

  const [created] = await db
    .select()
    .from(loveHomeProjects)
    .where(eq(loveHomeProjects.id, id))
    .limit(1)

  return created
}

export async function updateLoveHomeProject(data: UpdateLoveProjectInput) {
  const now = new Date()
  const patch: Partial<{
    title: string
    column: LoveProjectColumn
    costEstimation: "zero" | "low" | "high"
    notes: string | null
    updatedAt: Date
  }> = { updatedAt: now }

  if (data.title !== undefined) patch.title = data.title
  if (data.column !== undefined) patch.column = data.column
  if (data.costEstimation !== undefined) patch.costEstimation = data.costEstimation
  if (data.notes !== undefined) patch.notes = data.notes ?? null

  await db
    .update(loveHomeProjects)
    .set(patch)
    .where(eq(loveHomeProjects.id, data.id))

  const [updated] = await db
    .select()
    .from(loveHomeProjects)
    .where(eq(loveHomeProjects.id, data.id))
    .limit(1)

  if (!updated) throw new Error("Proyecto no encontrado.")
  return updated
}

export async function moveLoveHomeProject(data: MoveLoveProjectInput) {
  return updateLoveHomeProject({ id: data.id, column: data.column })
}
