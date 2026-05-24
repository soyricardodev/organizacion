import { eq } from "drizzle-orm"
import { db } from "@/db"
import { exchangeRates } from "@/db/schema"
import {
  fetchRatesFromApi,
  apiResponseToRates,
  isRatesStale,
  type ActiveRates,
} from "@/lib/rates"
import { getLatestRatesRow } from "./get-latest-rates-row"

function newId() {
  return crypto.randomUUID()
}

const EMPTY_RATES: ActiveRates = {
  id: "",
  bcvRate: "0.0000",
  euroBcvRate: "0.0000",
  paraleloRate: "0.0000",
  source: "manual",
  fetchedAt: new Date(0),
  stale: true,
  fetchFailed: true,
}

export async function getActiveRates(): Promise<ActiveRates> {
  const existing = await getLatestRatesRow()
  const apiData = await fetchRatesFromApi()

  if (apiData) {
    const formatted = apiResponseToRates(apiData, "")

    const unchanged =
      existing &&
      existing.bcvRate === formatted.bcvRate &&
      existing.euroBcvRate === formatted.euroBcvRate &&
      existing.paraleloRate === formatted.paraleloRate

    if (unchanged && existing && !isRatesStale(existing.fetchedAt)) {
      return {
        id: existing.id,
        bcvRate: existing.bcvRate,
        euroBcvRate: existing.euroBcvRate,
        paraleloRate: existing.paraleloRate,
        source: existing.source,
        fetchedAt: existing.fetchedAt,
        stale: false,
        fetchFailed: false,
      }
    }

    if (unchanged && existing) {
      const fetchedAt = new Date()
      await db
        .update(exchangeRates)
        .set({ fetchedAt })
        .where(eq(exchangeRates.id, existing.id))

      return {
        id: existing.id,
        bcvRate: existing.bcvRate,
        euroBcvRate: existing.euroBcvRate,
        paraleloRate: existing.paraleloRate,
        source: existing.source,
        fetchedAt,
        stale: false,
        fetchFailed: false,
      }
    }

    const id = newId()
    await db.insert(exchangeRates).values({
      id,
      bcvRate: formatted.bcvRate,
      euroBcvRate: formatted.euroBcvRate,
      paraleloRate: formatted.paraleloRate,
      source: "api",
      fetchedAt: formatted.fetchedAt,
    })

    return {
      id,
      bcvRate: formatted.bcvRate,
      euroBcvRate: formatted.euroBcvRate,
      paraleloRate: formatted.paraleloRate,
      source: "api",
      fetchedAt: formatted.fetchedAt,
      stale: false,
      fetchFailed: false,
    }
  }

  if (existing) {
    return {
      id: existing.id,
      bcvRate: existing.bcvRate,
      euroBcvRate: existing.euroBcvRate,
      paraleloRate: existing.paraleloRate,
      source: existing.source,
      fetchedAt: existing.fetchedAt,
      stale: isRatesStale(existing.fetchedAt),
      fetchFailed: true,
    }
  }

  return EMPTY_RATES
}
