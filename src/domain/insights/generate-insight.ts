import { eq, and } from "drizzle-orm"
import { generateObject } from "ai"
import { z } from "zod"
import { db } from "@/db"
import { transactions, debts, insights } from "@/db/schema"
import { BUDGET_RULE } from "@/lib/constants"
import { getAiModel, getAiModelId, aiProviderOptions } from "@/lib/ai"
import { transactionsInMonth, currentWeekKey } from "@/domain/dates"
import type { InsightData } from "./types"

export async function generateWeeklyInsight(month: string): Promise<InsightData> {
  const model = getAiModel()
  if (!model) {
    return {
      title: "IA no configurada",
      body: "Añade OPENROUTER_API_KEY para recibir análisis semanal automatizado.",
      severity: "info",
      model: null,
    }
  }

  const weekStart = currentWeekKey()

  const monthTx = await db
    .select()
    .from(transactions)
    .where(
      and(
        transactionsInMonth(month, transactions),
        eq(transactions.type, "expense"),
      ),
    )

  const debtRows = await db.select().from(debts)

  const totalSpent = monthTx.reduce((s, t) => s + t.usdCents, 0)
  const byCategory = monthTx.reduce(
    (acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.usdCents
      return acc
    },
    {} as Record<string, number>,
  )

  const { object } = await generateObject({
    model,
    schema: z.object({
      title: z.string(),
      body: z.string(),
      severity: z.enum(["info", "warning", "critical"]),
      recommendation: z.string(),
    }),
    providerOptions: aiProviderOptions(),
    prompt: `Eres un analista financiero para una pareja en Venezuela.
Regla presupuestaria 60/20/20: necesidades ${BUDGET_RULE.needs * 100}%, deseos ${BUDGET_RULE.wants * 100}%, ahorro ${BUDGET_RULE.savings * 100}%.
Gasto del mes (${month}): $${(totalSpent / 100).toFixed(2)} USD.
Por categoría (centavos USD): ${JSON.stringify(byCategory)}.
Deudas pendientes: ${debtRows.map((d) => `${d.name}: $${(d.remainingCents / 100).toFixed(2)} restante, meta ${d.targetDate}`).join("; ")}.
Genera un insight breve, accionable, en español. Alerta si hay riesgo de comprometer abonos semanales.`,
  })

  const result: InsightData = { ...object, model: getAiModelId() }

  await db.insert(insights).values({
    id: crypto.randomUUID(),
    weekStart,
    content: JSON.stringify(result),
    createdAt: new Date(),
  })

  return result
}
