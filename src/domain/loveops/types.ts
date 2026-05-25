import { z } from "zod"

export const LOVE_ACTIVITY_CATEGORIES = ["ritual", "micro", "experience"] as const
export type LoveActivityCategory = (typeof LOVE_ACTIVITY_CATEGORIES)[number]

export const LOVE_ACTIVITY_TAGS = [
  "indoor",
  "outdoor",
  "physical_touch",
  "creative",
  "food",
  "shopping",
  "quality_time",
  "weather_rain",
  "weather_cold",
] as const
export type LoveActivityTag = (typeof LOVE_ACTIVITY_TAGS)[number]

export const LOVE_COST_LEVELS = ["zero", "low", "high"] as const
export type LoveCostLevel = (typeof LOVE_COST_LEVELS)[number]

export const LOVE_WEATHER_PREFS = ["any", "rain", "cold"] as const
export type LoveWeatherPreference = (typeof LOVE_WEATHER_PREFS)[number]

export const LOVE_PROJECT_COLUMNS = [
  "ideas",
  "materials",
  "in_progress",
  "done",
] as const
export type LoveProjectColumn = (typeof LOVE_PROJECT_COLUMNS)[number]

export const loveActivityTagSchema = z.enum(LOVE_ACTIVITY_TAGS)
export const loveActivityCategorySchema = z.enum(LOVE_ACTIVITY_CATEGORIES)
export const loveCostLevelSchema = z.enum(LOVE_COST_LEVELS)
export const loveWeatherPreferenceSchema = z.enum(LOVE_WEATHER_PREFS)
export const loveProjectColumnSchema = z.enum(LOVE_PROJECT_COLUMNS)

export const logLoveActivitySchema = z.object({
  activityId: z.string().min(1),
  notes: z.string().max(500).optional(),
})

export const createLoveProjectSchema = z.object({
  title: z.string().min(1).max(200),
  column: loveProjectColumnSchema.default("ideas"),
  costEstimation: loveCostLevelSchema.default("zero"),
  notes: z.string().max(500).optional(),
})

export const updateLoveProjectSchema = createLoveProjectSchema
  .extend({
    id: z.string().min(1),
  })
  .partial({
    title: true,
    column: true,
    costEstimation: true,
    notes: true,
  })
  .required({ id: true })

export const moveLoveProjectSchema = z.object({
  id: z.string().min(1),
  column: loveProjectColumnSchema,
})

export const createLoveActivitySchema = z.object({
  title: z.string().min(1).max(200),
  category: loveActivityCategorySchema,
  tags: z.array(loveActivityTagSchema).min(1),
  costEstimation: loveCostLevelSchema,
  weatherPreference: loveWeatherPreferenceSchema.default("any"),
  frequencyDaysTarget: z.number().int().min(1).max(365),
  notes: z.string().max(500).optional(),
})

export const updateLoveActivitySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  category: loveActivityCategorySchema.optional(),
  tags: z.array(loveActivityTagSchema).min(1).optional(),
  costEstimation: loveCostLevelSchema.optional(),
  weatherPreference: loveWeatherPreferenceSchema.optional(),
  frequencyDaysTarget: z.number().int().min(1).max(365).optional(),
  notes: z.string().max(500).optional(),
  active: z.boolean().optional(),
})

export const saveLoveSettingsSchema = z.object({
  partnerName: z.string().min(1).max(100),
  notificationsEnabled: z.boolean().default(true),
})

export type LogLoveActivityInput = z.infer<typeof logLoveActivitySchema>
export type CreateLoveProjectInput = z.infer<typeof createLoveProjectSchema>
export type UpdateLoveProjectInput = z.infer<typeof updateLoveProjectSchema>
export type MoveLoveProjectInput = z.infer<typeof moveLoveProjectSchema>
export type CreateLoveActivityInput = z.infer<typeof createLoveActivitySchema>
export type UpdateLoveActivityInput = z.infer<typeof updateLoveActivitySchema>
export type SaveLoveSettingsInput = z.infer<typeof saveLoveSettingsSchema>

export const LOVE_CATEGORY_LABELS: Record<LoveActivityCategory, string> = {
  ritual: "Ritual diario/semanal",
  micro: "Micro-salida o proyecto",
  experience: "Experiencia planificada",
}

export const LOVE_COST_LABELS: Record<LoveCostLevel, string> = {
  zero: "$0",
  low: "Bajo",
  high: "Alto (bucket)",
}

export const LOVE_PROJECT_COLUMN_LABELS: Record<LoveProjectColumn, string> = {
  ideas: "Ideas",
  materials: "Materiales",
  in_progress: "En ejecución",
  done: "Logrado",
}

export const LOVE_TAG_LABELS: Record<LoveActivityTag, string> = {
  indoor: "Interior",
  outdoor: "Exterior",
  physical_touch: "Contacto físico",
  creative: "Creativo",
  food: "Comida",
  shopping: "Compras",
  quality_time: "Tiempo de calidad",
  weather_rain: "Lluvia",
  weather_cold: "Frío",
}

export function parseLoveTags(raw: string): LoveActivityTag[] {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (tag): tag is LoveActivityTag =>
        typeof tag === "string" &&
        (LOVE_ACTIVITY_TAGS as readonly string[]).includes(tag),
    )
  } catch {
    return []
  }
}

export function serializeLoveTags(tags: LoveActivityTag[]) {
  return JSON.stringify(tags)
}
