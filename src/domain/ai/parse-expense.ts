import { generateObject } from "ai"
import { z } from "zod"
import { requireAiModel, aiProviderOptions } from "@/lib/ai"
import {
  categorySchema,
  currencySchema,
  matchedRateSchema,
} from "@/domain/types"

const parsedExpenseSchema = z.object({
  description: z.string(),
  originalAmount: z.number().positive(),
  originalCurrency: currencySchema,
  category: categorySchema,
  matchedRate: matchedRateSchema,
})

export async function parseNaturalLanguageExpense(text: string) {
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
