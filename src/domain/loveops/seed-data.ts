import {
  LOVE_ACTIVITY_TAGS,
  serializeLoveTags,
  type LoveActivityCategory,
  type LoveActivityTag,
  type LoveCostLevel,
  type LoveWeatherPreference,
} from "@/domain/loveops/types"

interface SeedActivity {
  title: string
  category: LoveActivityCategory
  tags: LoveActivityTag[]
  costEstimation: LoveCostLevel
  weatherPreference?: LoveWeatherPreference
  frequencyDaysTarget: number
  notes?: string
}

export const DEFAULT_LOVE_ACTIVITIES: SeedActivity[] = [
  {
    title: "Ver series y películas juntos",
    category: "ritual",
    tags: ["indoor", "quality_time"],
    costEstimation: "zero",
    frequencyDaysTarget: 7,
  },
  {
    title: "Masajes",
    category: "ritual",
    tags: ["indoor", "physical_touch", "quality_time"],
    costEstimation: "zero",
    frequencyDaysTarget: 4,
  },
  {
    title: "Piojitos",
    category: "ritual",
    tags: ["indoor", "physical_touch", "quality_time"],
    costEstimation: "zero",
    frequencyDaysTarget: 4,
  },
  {
    title: "Escuchar música juntos",
    category: "ritual",
    tags: ["indoor", "quality_time"],
    costEstimation: "zero",
    frequencyDaysTarget: 7,
  },
  {
    title: "Tiempo de calidad sin pantallas",
    category: "ritual",
    tags: ["indoor", "quality_time"],
    costEstimation: "zero",
    frequencyDaysTarget: 3,
  },
  {
    title: "Comer algo rico en casa",
    category: "micro",
    tags: ["indoor", "food", "quality_time"],
    costEstimation: "low",
    frequencyDaysTarget: 7,
  },
  {
    title: "Manualidades juntos",
    category: "micro",
    tags: ["indoor", "creative", "quality_time"],
    costEstimation: "low",
    frequencyDaysTarget: 14,
  },
  {
    title: "Renovar un espacio de la casa",
    category: "micro",
    tags: ["indoor", "creative"],
    costEstimation: "low",
    frequencyDaysTarget: 30,
  },
  {
    title: "Salir de compras",
    category: "micro",
    tags: ["outdoor", "shopping", "quality_time"],
    costEstimation: "low",
    frequencyDaysTarget: 14,
  },
  {
    title: "Salir a comer",
    category: "micro",
    tags: ["outdoor", "food", "quality_time"],
    costEstimation: "low",
    frequencyDaysTarget: 14,
  },
  {
    title: "Salir a comer con clima lluvioso",
    category: "micro",
    tags: ["outdoor", "food", "weather_rain", "quality_time"],
    costEstimation: "low",
    weatherPreference: "rain",
    frequencyDaysTarget: 21,
  },
  {
    title: "Salir con presupuesto para comprar y comer",
    category: "micro",
    tags: ["outdoor", "shopping", "food", "quality_time"],
    costEstimation: "low",
    frequencyDaysTarget: 21,
  },
  {
    title: "Diseñar ropa juntos",
    category: "micro",
    tags: ["indoor", "creative", "quality_time"],
    costEstimation: "low",
    frequencyDaysTarget: 21,
  },
  {
    title: "Diseñar espacios juntos",
    category: "micro",
    tags: ["indoor", "creative", "quality_time"],
    costEstimation: "zero",
    frequencyDaysTarget: 21,
  },
  {
    title: "Regalo sorpresa",
    category: "micro",
    tags: ["indoor", "shopping", "quality_time"],
    costEstimation: "low",
    frequencyDaysTarget: 14,
    notes: "Usa el bucket Regalos sorpresa",
  },
  {
    title: "Ir a la playa",
    category: "experience",
    tags: ["outdoor", "quality_time"],
    costEstimation: "high",
    frequencyDaysTarget: 90,
  },
  {
    title: "Buscar el frío (viaje o escapada)",
    category: "experience",
    tags: ["outdoor", "weather_cold", "quality_time"],
    costEstimation: "high",
    weatherPreference: "cold",
    frequencyDaysTarget: 120,
  },
]

export function buildLoveActivitySeedRows(now: Date) {
  return DEFAULT_LOVE_ACTIVITIES.map((activity) => ({
    id: crypto.randomUUID(),
    title: activity.title,
    category: activity.category,
    tags: serializeLoveTags(activity.tags),
    costEstimation: activity.costEstimation,
    weatherPreference: activity.weatherPreference ?? "any",
    frequencyDaysTarget: activity.frequencyDaysTarget,
    lastExecutedAt: null,
    notes: activity.notes ?? null,
    active: true,
    createdAt: now,
  }))
}

export const DEFAULT_HOME_PROJECTS = [
  "Reorganizar la sala (mover muebles)",
  "Idea de diseño para la cocina",
  "Rincón de manualidades",
]

export function buildHomeProjectSeedRows(now: Date) {
  return DEFAULT_HOME_PROJECTS.map((title, index) => ({
    id: crypto.randomUUID(),
    title,
    column: "ideas" as const,
    costEstimation: "zero" as const,
    notes: null,
    sortOrder: index,
    createdAt: now,
    updatedAt: now,
  }))
}

export function assertValidTags(tags: LoveActivityTag[]) {
  for (const tag of tags) {
    if (!(LOVE_ACTIVITY_TAGS as readonly string[]).includes(tag)) {
      throw new Error(`Tag inválido: ${tag}`)
    }
  }
}
