import { desc, eq } from "drizzle-orm"
import { db } from "@/db"
import { insights } from "@/db/schema"
import { currentWeekKey } from "@/domain/dates"
import type { InsightData } from "./types"

export async function getCachedInsight(): Promise<InsightData | null> {
  const weekStart = currentWeekKey()
  const [row] = await db
    .select()
    .from(insights)
    .where(eq(insights.weekStart, weekStart))
    .orderBy(desc(insights.createdAt))
    .limit(1)

  if (!row) return null
  return JSON.parse(row.content) as InsightData
}
