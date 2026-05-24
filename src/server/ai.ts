import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

export const parseNaturalLanguageExpense = createServerFn({ method: "POST" })
  .inputValidator(z.object({ text: z.string().min(3).max(1000) }))
  .handler(async ({ data }) => {
    const { parseNaturalLanguageExpenseImpl } = await import("./ai.server")
    return parseNaturalLanguageExpenseImpl(data.text)
  })

export const classifyExpenseCategory = createServerFn({ method: "POST" })
  .inputValidator(z.object({ description: z.string().min(1).max(500) }))
  .handler(async ({ data }) => {
    const { classifyExpenseCategoryImpl } = await import("./ai.server")
    return classifyExpenseCategoryImpl(data.description)
  })

export const generateWeeklyInsight = createServerFn({ method: "POST" })
  .inputValidator(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }))
  .handler(async ({ data }) => {
    const { generateWeeklyInsightImpl } = await import("./ai.server")
    return generateWeeklyInsightImpl(data.month)
  })

export const getCachedInsight = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getCachedInsightImpl } = await import("./ai.server")
    return getCachedInsightImpl()
  },
)

export const getAiStatus = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getAiStatusImpl } = await import("./ai.server")
    return getAiStatusImpl()
  },
)
