import { generateObject } from "ai"
import { z } from "zod"
import { getAiModel, getAiModelId, aiProviderOptions } from "@/lib/ai"
import { getLoveopsSummary } from "@/domain/loveops/get-summary"
import type { EnrichedLoveActivity } from "@/domain/loveops/get-activities"

export async function suggestLoveDate(month: string) {
  const model = getAiModel()
  if (!model) {
    return {
      configured: false,
      suggestion: null as null,
      model: null,
    }
  }

  const summary = await getLoveopsSummary({ month })
  const settings = summary.settings
  const activityList = summary.activities
    .map(
      (activity: EnrichedLoveActivity) =>
        `- ${activity.title} (${activity.category}, costo ${activity.costEstimation}, tags: ${activity.tags.join(", ")})`,
    )
    .join("\n")

  const { object } = await generateObject({
    model,
    schema: z.object({
      title: z.string(),
      plan: z.string(),
      estimatedCostUsd: z.string(),
      whyNow: z.string(),
    }),
    providerOptions: aiProviderOptions(),
    prompt: `Eres un coach de pareja empático. Planifica una cita para este fin de semana en Venezuela para ${settings.partnerName}.
Saldo disponible del mes: $${(summary.finance.availableBalance / 100).toFixed(2)} USD.
Bucket regalos sorpresa: $${(summary.surpriseBucketCents / 100).toFixed(2)} USD.
Clima: ${summary.weather.configured ? `${summary.weather.description ?? "desconocido"}, ${summary.weather.temperatureC ?? "?"}°C, lluvia=${summary.weather.isRainy}, frío=${summary.weather.isCold}` : "sin datos de clima"}.
Actividades que le gustan:
${activityList}
Recordatorios pendientes: ${summary.reminders.map((r) => r.message).join(" | ") || "ninguno"}.
Devuelve un plan concreto, asequible, cálido y accionable en español. Prioriza conexión emocional y contacto físico si hace falta.`,
  })

  return {
    configured: true,
    suggestion: object,
    model: getAiModelId(),
  }
}
