import { generateObject } from "ai"
import { z } from "zod"
import { db } from "@/db"
import { transactions, debts, insights } from "@/db/schema"
import { desc, gte, lt, and, eq } from "drizzle-orm"
import { format, startOfWeek } from "date-fns"
import { BUDGET_RULE } from "@/lib/constants"
import { getAiModel, getAiModelId, requireAiModel, aiProviderOptions } from "@/lib/ai"

const parsedExpenseSchema = z.object({
  description: z.string(),
  originalAmount: z.number().positive(),
  originalCurrency: z.enum(["VES", "USD", "EUR"]),
  category: z.enum(["needs", "wants", "savings", "health", "debt_payment"]),
  matchedRate: z.enum(["bcv", "euro_bcv", "paralelo"]),
})

export async function parseNaturalLanguageExpenseImpl(text: string) {
  const model = requireAiModel()

  const { object } = await generateObject({
    model,
    schema: parsedExpenseSchema,
    providerOptions: aiProviderOptions(),
    prompt: `Extrae un gasto financiero venezolano del siguiente texto.
Interpreta montos en bolívares (VES), dólares (USD) o euros (EUR).
Si menciona "bcv", "oficial" o "tasa bcv" usa matchedRate "bcv".
Si menciona "euro" usa "euro_bcv". Si menciona "paralelo", "binance" o "dólar paralelo" usa "paralelo".
Categoriza semánticamente: salud/medicina/farmacia -> health, deudas/abonos -> debt_payment, 
supermercado/servicios básicos -> needs, ocio/restaurantes -> wants, ahorro -> savings.

Texto: "${text}"`,
  })

  return {
    description: object.description,
    originalAmountCents: Math.round(object.originalAmount * 100),
    originalCurrency: object.originalCurrency,
    category: object.category,
    matchedRate: object.matchedRate,
  }
}

export async function classifyExpenseCategoryImpl(description: string) {
  const model = getAiModel()
  if (!model) {
    return { category: "needs" as const, confidence: 0 }
  }

  const { object } = await generateObject({
    model,
    schema: z.object({
      category: z.enum([
        "needs",
        "wants",
        "savings",
        "health",
        "debt_payment",
      ]),
      confidence: z.number().min(0).max(1),
    }),
    providerOptions: aiProviderOptions(),
    prompt: `Clasifica esta descripción de gasto venezolano en una categoría presupuestaria.
Ejemplos: "Tratamiento de Rosario", "Pastillas para el sueño" -> health.
"El chino de la esquina", "Automercado" -> needs.
"Restaurante", "Cine" -> wants.

Descripción: "${description}"`,
  })

  return object
}

export async function generateWeeklyInsightImpl(month: string) {
  const model = getAiModel()
  if (!model) {
    return {
      title: "IA no configurada",
      body: "Añade OPENROUTER_API_KEY para recibir análisis semanal automatizado.",
      severity: "info" as const,
      model: null,
    }
  }

  const weekStart = format(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
    "yyyy-MM-dd",
  )

  const start = new Date(`${month}-01T00:00:00`)
  const end = new Date(start)
  end.setMonth(end.getMonth() + 1)

  const monthTx = await db
    .select()
    .from(transactions)
    .where(
      and(
        gte(transactions.createdAt, start),
        lt(transactions.createdAt, end),
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

  const result = { ...object, model: getAiModelId() }

  await db.insert(insights).values({
    id: crypto.randomUUID(),
    weekStart,
    content: JSON.stringify(result),
    createdAt: new Date(),
  })

  return result
}

export async function getCachedInsightImpl() {
  const weekStart = format(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
    "yyyy-MM-dd",
  )
  const [row] = await db
    .select()
    .from(insights)
    .where(eq(insights.weekStart, weekStart))
    .orderBy(desc(insights.createdAt))
    .limit(1)

  if (!row) return null
  return JSON.parse(row.content) as {
    title: string
    body: string
    severity: "info" | "warning" | "critical"
    recommendation?: string
    model?: string | null
  }
}

export function getAiStatusImpl() {
  return {
    configured: Boolean(process.env.OPENROUTER_API_KEY),
    model: getAiModelId(),
  }
}
