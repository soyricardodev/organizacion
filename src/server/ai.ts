import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

export const parseNaturalLanguageExpense = createServerFn({ method: "POST" })
  .inputValidator(z.object({ text: z.string().min(3).max(1000) }))
  .handler(async ({ data }) => {
    const { parseNaturalLanguageExpense } = await import(
      "@/domain/ai/parse-expense"
    )
    return parseNaturalLanguageExpense(data.text)
  })

export const generateWeeklyInsight = createServerFn({ method: "POST" })
  .inputValidator(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }))
  .handler(async ({ data }) => {
    const { generateWeeklyInsight } = await import(
      "@/domain/insights/generate-insight"
    )
    return generateWeeklyInsight(data.month)
  })

export const getCachedInsight = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getCachedInsight } = await import("@/domain/insights/get-insight")
    return getCachedInsight()
  },
)

export const getAiStatus = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getAiStatus } = await import("@/domain/ai/status")
    return getAiStatus()
  },
)
