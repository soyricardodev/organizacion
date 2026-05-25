import type { EnrichedLoveActivity } from "@/domain/loveops/get-activities"

export interface LoveReminder {
  id: string
  severity: "info" | "warning" | "critical"
  title: string
  message: string
  activityId?: string
}

export function buildLoveReminders(
  activities: EnrichedLoveActivity[],
  partnerName: string,
): LoveReminder[] {
  const reminders: LoveReminder[] = []
  const name = partnerName.trim() || "tu pareja"

  const touchActivities = activities.filter((activity) =>
    activity.tags.includes("physical_touch"),
  )
  const overdueTouch = touchActivities.filter((activity) => activity.isDue)
  if (overdueTouch.length > 0) {
    const worst = overdueTouch.sort((a, b) => b.daysOverdue - a.daysOverdue)[0]
    reminders.push({
      id: "physical-touch",
      severity: worst.daysOverdue >= 7 ? "critical" : "warning",
      title: "Contacto físico",
      message: `Llevas ${worst.daysSinceLast ?? "demasiados"} días sin ${worst.title.toLowerCase()} con ${name}. Tómate 15 minutos hoy.`,
      activityId: worst.id,
    })
  }

  const qualityDue = activities
    .filter(
      (activity) =>
        activity.tags.includes("quality_time") &&
        activity.isDue &&
        !activity.tags.includes("physical_touch"),
    )
    .sort((a, b) => b.daysOverdue - a.daysOverdue)[0]

  if (qualityDue) {
    reminders.push({
      id: "quality-time",
      severity: qualityDue.daysOverdue >= 10 ? "warning" : "info",
      title: "Tiempo de calidad",
      message: `Hace ${qualityDue.daysSinceLast ?? "mucho"} días que no hacen con ${name}: ${qualityDue.title}.`,
      activityId: qualityDue.id,
    })
  }

  const ritualsDue = activities
    .filter((activity) => activity.category === "ritual" && activity.isDue)
    .slice(0, 3)

  for (const activity of ritualsDue) {
    reminders.push({
      id: `ritual-${activity.id}`,
      severity: activity.daysOverdue >= 7 ? "warning" : "info",
      title: "Ritual pendiente",
      message: `${activity.title} con ${name} — meta cada ${activity.frequencyDaysTarget} días.`,
      activityId: activity.id,
    })
  }

  return reminders.slice(0, 6)
}
