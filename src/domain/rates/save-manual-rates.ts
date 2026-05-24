import { db } from "@/db"
import { exchangeRates } from "@/db/schema"
import { manualRatesToActive, type ActiveRates } from "@/lib/rates"

function newId() {
  return crypto.randomUUID()
}

export async function saveManualRates(data: {
  bcvRate: string
  euroBcvRate: string
  paraleloRate: string
}): Promise<ActiveRates> {
  const id = newId()
  const rates = manualRatesToActive(data, id)
  await db.insert(exchangeRates).values({
    id,
    bcvRate: rates.bcvRate,
    euroBcvRate: rates.euroBcvRate,
    paraleloRate: rates.paraleloRate,
    source: "manual",
    fetchedAt: rates.fetchedAt,
  })
  return {
    ...rates,
    stale: false,
    fetchFailed: false,
  }
}
