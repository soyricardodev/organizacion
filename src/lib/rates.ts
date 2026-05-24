export interface RatesApiResponse {
  bcv: number
  euro_bcv: number
  paralelo: number
  updated_at?: string
}

export interface ActiveRates {
  id: string
  bcvRate: string
  euroBcvRate: string
  paraleloRate: string
  source: "api" | "manual"
  fetchedAt: Date
  stale: boolean
  fetchFailed: boolean
}

interface DolaryRateEntry {
  key: string
  price: number
  lastUpdate?: string
}

interface DolaryApiResponse {
  data?: {
    bcv?: DolaryRateEntry
    paralelo?: DolaryRateEntry
    eur?: DolaryRateEntry
  }
}

const DEFAULT_RATES_URL = "https://dolary.zoysoftware.com/api/rates"

function formatRate(value: number): string {
  return value.toFixed(4)
}

function parseDolaryResponse(payload: DolaryApiResponse): RatesApiResponse | null {
  const { bcv, paralelo, eur } = payload.data ?? {}
  if (
    typeof bcv?.price !== "number" ||
    typeof paralelo?.price !== "number" ||
    typeof eur?.price !== "number"
  ) {
    return null
  }

  const timestamps = [bcv.lastUpdate, paralelo.lastUpdate, eur.lastUpdate].filter(
    Boolean,
  ) as string[]
  const latest =
    timestamps.length > 0
      ? timestamps.sort((a, b) => Date.parse(b) - Date.parse(a))[0]
      : undefined

  return {
    bcv: bcv.price,
    euro_bcv: eur.price,
    paralelo: paralelo.price,
    updated_at: latest,
  }
}

export async function fetchRatesFromApi(): Promise<RatesApiResponse | null> {
  const url = process.env.RATES_API_URL ?? DEFAULT_RATES_URL

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) return null

    const data = (await response.json()) as DolaryApiResponse
    return parseDolaryResponse(data)
  } catch {
    return null
  }
}

export function apiResponseToRates(
  data: RatesApiResponse,
  id: string,
): Omit<ActiveRates, "stale" | "fetchFailed"> {
  return {
    id,
    bcvRate: formatRate(data.bcv),
    euroBcvRate: formatRate(data.euro_bcv),
    paraleloRate: formatRate(data.paralelo),
    source: "api",
    fetchedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
  }
}

export function manualRatesToActive(
  rates: { bcvRate: string; euroBcvRate: string; paraleloRate: string },
  id: string,
): Omit<ActiveRates, "stale" | "fetchFailed"> {
  return {
    id,
    ...rates,
    source: "manual",
    fetchedAt: new Date(),
  }
}

export function isRatesStale(fetchedAt: Date, maxAgeMs = 30 * 60 * 1000): boolean {
  return Date.now() - fetchedAt.getTime() > maxAgeMs
}
