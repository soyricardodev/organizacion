import { desc, eq, and } from "drizzle-orm"
import { db } from "@/db"
import { transactions } from "@/db/schema"
import type { FilterCategory } from "@/domain/types"
import { transactionsInMonth } from "@/domain/dates"

export async function getTransactions(data: {
  month: string
  category: FilterCategory
}) {
  const conditions = [transactionsInMonth(data.month, transactions)]

  if (data.category !== "all") {
    conditions.push(eq(transactions.category, data.category))
  }

  return db
    .select()
    .from(transactions)
    .where(and(...conditions))
    .orderBy(desc(transactions.createdAt))
}
