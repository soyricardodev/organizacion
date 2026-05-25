import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import {
  createLoveActivitySchema,
  createLoveProjectSchema,
  logLoveActivitySchema,
  moveLoveProjectSchema,
  saveLoveSettingsSchema,
  updateLoveActivitySchema,
  updateLoveProjectSchema,
} from "@/domain/loveops/types"

export const getLoveopsSummary = createServerFn({ method: "GET" })
  .inputValidator(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }))
  .handler(async ({ data }) => {
    const { getLoveopsSummary } = await import("@/domain/loveops/get-summary")
    return getLoveopsSummary(data)
  })

export const getLoveActivities = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getLoveActivities } = await import("@/domain/loveops/get-activities")
    return getLoveActivities()
  },
)

export const getLoveHomeProjects = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getLoveHomeProjects } = await import("@/domain/loveops/home-projects")
    return getLoveHomeProjects()
  },
)

export const logLoveActivity = createServerFn({ method: "POST" })
  .inputValidator(logLoveActivitySchema)
  .handler(async ({ data }) => {
    const { logLoveActivity } = await import("@/domain/loveops/log-activity")
    return logLoveActivity(data)
  })

export const createLoveHomeProject = createServerFn({ method: "POST" })
  .inputValidator(createLoveProjectSchema)
  .handler(async ({ data }) => {
    const { createLoveHomeProject } = await import("@/domain/loveops/home-projects")
    return createLoveHomeProject(data)
  })

export const updateLoveHomeProject = createServerFn({ method: "POST" })
  .inputValidator(updateLoveProjectSchema)
  .handler(async ({ data }) => {
    const { updateLoveHomeProject } = await import("@/domain/loveops/home-projects")
    return updateLoveHomeProject(data)
  })

export const moveLoveHomeProject = createServerFn({ method: "POST" })
  .inputValidator(moveLoveProjectSchema)
  .handler(async ({ data }) => {
    const { moveLoveHomeProject } = await import("@/domain/loveops/home-projects")
    return moveLoveHomeProject(data)
  })

export const suggestLoveDate = createServerFn({ method: "POST" })
  .inputValidator(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }))
  .handler(async ({ data }) => {
    const { suggestLoveDate } = await import("@/domain/loveops/suggest-date")
    return suggestLoveDate(data.month)
  })

export const getLoveSettingsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getLoveSettings } = await import("@/domain/loveops/settings")
    return getLoveSettings()
  },
)

export const saveLoveSettings = createServerFn({ method: "POST" })
  .inputValidator(saveLoveSettingsSchema)
  .handler(async ({ data }) => {
    const { saveLoveSettings } = await import("@/domain/loveops/settings")
    return saveLoveSettings(data)
  })

export const createLoveActivity = createServerFn({ method: "POST" })
  .inputValidator(createLoveActivitySchema)
  .handler(async ({ data }) => {
    const { createLoveActivity } = await import("@/domain/loveops/manage-activities")
    return createLoveActivity(data)
  })

export const updateLoveActivity = createServerFn({ method: "POST" })
  .inputValidator(updateLoveActivitySchema)
  .handler(async ({ data }) => {
    const { updateLoveActivity } = await import("@/domain/loveops/manage-activities")
    return updateLoveActivity(data)
  })
