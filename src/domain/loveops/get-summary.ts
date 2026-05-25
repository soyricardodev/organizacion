import { db } from "@/db"
import { buckets } from "@/db/schema"
import { inArray } from "drizzle-orm"
import { getDashboardSummary } from "@/domain/dashboard/get-summary"
import {
  getDueLoveActivities,
  getLoveActivities,
  getRecentLoveLogs,
} from "@/domain/loveops/get-activities"
import { buildLoveReminders } from "@/domain/loveops/get-reminders"
import { getWeatherSnapshot } from "@/domain/loveops/get-weather"
import { getLoveSettings } from "@/domain/loveops/settings"
import { formatUsd } from "@/lib/money"

const LOVE_BUCKET_SLUGS = ["surprise_gifts", "anniversary", "date_night"] as const

export async function getLoveopsSummary(data: { month: string }) {
  const [activities, dueActivities, recentLogs, weather, finance, settings] =
    await Promise.all([
      getLoveActivities(),
      getDueLoveActivities(8),
      getRecentLoveLogs(6),
      getWeatherSnapshot(),
      getDashboardSummary(data),
      getLoveSettings(),
    ])

  const bucketRows = await db
    .select()
    .from(buckets)
    .where(inArray(buckets.slug, [...LOVE_BUCKET_SLUGS]))

  const reminders = buildLoveReminders(activities, settings.partnerName)

  const weatherSuggestions = weather
    ? activities.filter((activity) => {
        if (weather.isRainy && activity.weatherPreference === "rain") return true
        if (weather.isCold && activity.weatherPreference === "cold") return true
        if (weather.isRainy && activity.tags.includes("weather_rain")) return true
        return false
      })
    : []

  const surpriseBucket = bucketRows.find((b) => b.slug === "surprise_gifts")

  return {
    reminders,
    dueActivities,
    recentLogs,
    activities,
    weather,
    weatherSuggestions,
    buckets: bucketRows.map((bucket) => ({
      id: bucket.id,
      slug: bucket.slug,
      name: bucket.name,
      frozenCents: bucket.frozenCents,
      targetCents: bucket.targetCents,
      weeklyTargetCents: bucket.weeklyTargetCents,
      label: formatUsd(bucket.frozenCents),
    })),
    finance: {
      availableBalance: finance.availableBalance,
      totalIncome: finance.totalIncome,
      totalSpent: finance.totalSpent,
    },
    surpriseBucketCents: surpriseBucket?.frozenCents ?? 0,
    settings: {
      partnerName: settings.partnerName,
      notificationsEnabled: settings.notificationsEnabled,
    },
  }
}
