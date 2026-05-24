import { desc } from "drizzle-orm"
import { db } from "@/db"
import { exchangeRates } from "@/db/schema"

export async function getLatestRatesRow() {
  const [row] = await db
    .select()
    .from(exchangeRates)
    .orderBy(desc(exchangeRates.fetchedAt))
    .limit(1)
  return row ?? null
}
