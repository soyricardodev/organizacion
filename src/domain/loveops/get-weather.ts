export interface WeatherSnapshot {
  configured: boolean
  description: string | null
  temperatureC: number | null
  isRainy: boolean
  isCold: boolean
  locationLabel: string
}

const DEFAULT_LAT = 10.1621
const DEFAULT_LON = -68.0077

export async function getWeatherSnapshot(): Promise<WeatherSnapshot> {
  const apiKey = process.env.OPENWEATHER_API_KEY
  const lat = Number(process.env.WEATHER_LAT ?? DEFAULT_LAT)
  const lon = Number(process.env.WEATHER_LON ?? DEFAULT_LON)
  const locationLabel = process.env.WEATHER_LOCATION_LABEL ?? "Carabobo"

  if (!apiKey) {
    return {
      configured: false,
      description: null,
      temperatureC: null,
      isRainy: false,
      isCold: false,
      locationLabel,
    }
  }

  try {
    const url = new URL("https://api.openweathermap.org/data/2.5/weather")
    url.searchParams.set("lat", String(lat))
    url.searchParams.set("lon", String(lon))
    url.searchParams.set("appid", apiKey)
    url.searchParams.set("units", "metric")
    url.searchParams.set("lang", "es")

    const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!response.ok) {
      throw new Error("weather fetch failed")
    }

    const data = (await response.json()) as {
      weather?: Array<{ main?: string; description?: string }>
      main?: { temp?: number }
    }

    const mainWeather = data.weather?.[0]?.main?.toLowerCase() ?? ""
    const description = data.weather?.[0]?.description ?? null
    const temperatureC =
      typeof data.main?.temp === "number" ? Math.round(data.main.temp) : null
    const isRainy = mainWeather.includes("rain") || mainWeather.includes("drizzle")
    const isCold = temperatureC !== null && temperatureC <= 18

    return {
      configured: true,
      description,
      temperatureC,
      isRainy,
      isCold,
      locationLabel,
    }
  } catch {
    return {
      configured: true,
      description: null,
      temperatureC: null,
      isRainy: false,
      isCold: false,
      locationLabel,
    }
  }
}
