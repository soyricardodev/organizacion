import { format, startOfWeek } from "date-fns"
import { gte, lt, and, type SQL } from "drizzle-orm"
import type { transactions } from "@/db/schema"

export function monthRange(month: string): { start: Date; end: Date } {
  const start = new Date(`${month}-01T00:00:00`)
  const end = new Date(start)
  end.setMonth(end.getMonth() + 1)
  return { start, end }
}

export function currentWeekKey(): string {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd")
}

export function transactionsInMonth(
  month: string,
  table: typeof transactions,
): SQL {
  const { start, end } = monthRange(month)
  return and(gte(table.createdAt, start), lt(table.createdAt, end))!
}
