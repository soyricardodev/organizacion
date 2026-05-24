import { useEffect, useState } from "react"
import { parseAmountToCents } from "@/lib/money"
import { parseNaturalLanguageExpense } from "@/server/ai"
import { useCreateTransaction } from "@/hooks/use-create-transaction"
import type { Category, Currency, MatchedRate } from "@/domain/types"
import type { ActiveRates } from "@/lib/rates"

type EntryMode = "manual" | "ai"

interface UseExpenseFormStateOptions {
  rates: ActiveRates | undefined
  aiConfigured: boolean
  month: string
  category: string
  onSuccess: () => void
}

export function useExpenseFormState({
  rates,
  aiConfigured,
  month,
  category,
  onSuccess,
}: UseExpenseFormStateOptions) {
  const [entryMode, setEntryMode] = useState<EntryMode>("manual")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState<Currency>("VES")
  const [expenseCategory, setExpenseCategory] = useState<Category>("needs")
  const [matchedRate, setMatchedRate] = useState<MatchedRate>("bcv")
  const [nlText, setNlText] = useState("")
  const [nlPending, setNlPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createMutation = useCreateTransaction(month, category)

  useEffect(() => {
    if (!aiConfigured && entryMode === "ai") {
      setEntryMode("manual")
    }
  }, [aiConfigured, entryMode])

  async function handleNlParse() {
    setNlPending(true)
    setError(null)
    try {
      const parsed = await parseNaturalLanguageExpense({ data: { text: nlText } })
      setDescription(parsed.description)
      setAmount(String(parsed.originalAmountCents / 100))
      setCurrency(parsed.originalCurrency)
      setExpenseCategory(parsed.category)
      setMatchedRate(parsed.matchedRate)
      setEntryMode("manual")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo interpretar el texto",
      )
    } finally {
      setNlPending(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rates?.id) {
      setError("Introduce las tasas antes de registrar.")
      return
    }
    setError(null)

    const tempId = `optimistic-${crypto.randomUUID()}`
    createMutation.mutate(
      {
        tempId,
        description,
        originalAmountCents: parseAmountToCents(amount),
        originalCurrency: currency,
        category: expenseCategory,
        matchedRate,
      },
      {
        onSuccess: () => {
          setDescription("")
          setAmount("")
          setNlText("")
          onSuccess()
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Error al registrar")
        },
      },
    )
  }

  return {
    entryMode,
    setEntryMode,
    description,
    setDescription,
    amount,
    setAmount,
    currency,
    setCurrency,
    expenseCategory,
    setExpenseCategory,
    matchedRate,
    setMatchedRate,
    nlText,
    setNlText,
    nlPending,
    error,
    createMutation,
    handleNlParse,
    handleSubmit,
    showAiPanel: aiConfigured && entryMode === "ai",
    showManualForm: entryMode === "manual" || !aiConfigured,
  }
}

export type ExpenseFormState = ReturnType<typeof useExpenseFormState>
