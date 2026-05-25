import { desc, eq } from "drizzle-orm"
import { db } from "@/db"
import { loveActivities } from "@/db/schema"
import {
  parseLoveTags,
  type LoveActivityCategory,
  type LoveActivityTag,
} from "@/domain/loveops/types"

export type EnrichedLoveActivity = {
  id: string
  title: string
  category: LoveActivityCategory
  tags: LoveActivityTag[]
  costEstimation: "zero" | "low" | "high"
  weatherPreference: "any" | "rain" | "cold"
  frequencyDaysTarget: number
  lastExecutedAt: Date | null
  notes: string | null
  active: boolean
  daysSinceLast: number | null
  daysOverdue: number
  isDue: boolean
}

function daysBetween(from: Date, to: Date) {
  return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
}

function enrichActivityRow(
  row: typeof loveActivities.$inferSelect,
  now: Date,
): EnrichedLoveActivity {
  const tags = parseLoveTags(row.tags)
  const daysSinceLast = row.lastExecutedAt
    ? daysBetween(row.lastExecutedAt, now)
    : null
  const daysOverdue =
    daysSinceLast === null
      ? row.frequencyDaysTarget
      : Math.max(0, daysSinceLast - row.frequencyDaysTarget)

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    tags,
    costEstimation: row.costEstimation,
    weatherPreference: row.weatherPreference,
    frequencyDaysTarget: row.frequencyDaysTarget,
    lastExecutedAt: row.lastExecutedAt,
    notes: row.notes,
    active: row.active,
    daysSinceLast,
    daysOverdue,
    isDue: row.active && daysOverdue > 0,
  }
}

export async function getLoveActivities() {
  const rows = await db
    .select()
    .from(loveActivities)
    .where(eq(loveActivities.active, true))
    .orderBy(loveActivities.category, loveActivities.title)

  const now = new Date()
  return rows.map((row) => enrichActivityRow(row, now))
}

export async function getArchivedLoveActivities() {
  const rows = await db
    .select()
    .from(loveActivities)
    .where(eq(loveActivities.active, false))
    .orderBy(loveActivities.title)

  const now = new Date()
  return rows.map((row) => enrichActivityRow(row, now))
}

export async function getDueLoveActivities(limit = 5) {
  const activities = await getLoveActivities()
  return activities
    .filter((activity) => activity.isDue)
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .slice(0, limit)
}

export async function getRecentLoveLogs(limit = 8) {
  const { loveActivityLogs } = await import("@/db/schema")
  const rows = await db
    .select({
      id: loveActivityLogs.id,
      activityId: loveActivityLogs.activityId,
      notes: loveActivityLogs.notes,
      executedAt: loveActivityLogs.executedAt,
      title: loveActivities.title,
    })
    .from(loveActivityLogs)
    .innerJoin(loveActivities, eq(loveActivityLogs.activityId, loveActivities.id))
    .orderBy(desc(loveActivityLogs.executedAt))
    .limit(limit)

  return rows
}
