import { useEffect, useState } from "react"
import { parseAmountToCents } from "@/lib/money"
import { parseNaturalLanguageExpense } from "@/server/ai"
import { useCreateTransaction } from "@/hooks/use-create-transaction"
import type {
  Category,
  Currency,
  IncomeCategory,
  MatchedRate,
  RegisterableTransactionType,
} from "@/domain/types"
import type { ActiveRates } from "@/lib/rates"
import type { Bucket, Debt } from "@/db/schema"

type EntryMode = "manual" | "ai"

type DebtOption = Debt & {
  progressPercent: number
  daysRemaining: number
  dailyRequiredCents: number
}

const DEFAULT_CATEGORY: Record<RegisterableTransactionType, Category> = {
  expense: "needs",
  income: "savings",
}

interface UseTransactionFormStateOptions {
  rates: ActiveRates | undefined
  aiConfigured: boolean
  month: string
  category: string
  debts: DebtOption[]
  buckets: Bucket[]
  onSuccess: () => void
}

export function useTransactionFormState({
  rates,
  aiConfigured,
  month,
  category,
  debts,
  buckets,
  onSuccess,
}: UseTransactionFormStateOptions) {
  const [transactionType, setTransactionType] =
    useState<RegisterableTransactionType>("expense")
  const [entryMode, setEntryMode] = useState<EntryMode>("manual")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState<Currency>("VES")
  const [txCategory, setTxCategory] = useState<Category>("needs")
  const [matchedRate, setMatchedRate] = useState<MatchedRate>("bcv")
  const [debtId, setDebtId] = useState<string>("")
  const [freezeInBucketId, setFreezeInBucketId] = useState<string>("")
  const [nlText, setNlText] = useState("")
  const [nlPending, setNlPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createMutation = useCreateTransaction(month, category)

  useEffect(() => {
    if (!aiConfigured && entryMode === "ai") {
      setEntryMode("manual")
    }
  }, [aiConfigured, entryMode])

  function handleTransactionTypeChange(next: RegisterableTransactionType) {
    setTransactionType(next)
    setTxCategory(DEFAULT_CATEGORY[next])
    if (next === "income") {
      setEntryMode("manual")
    } else {
      setFreezeInBucketId("")
    }
    setError(null)
  }

  function handleCategoryChange(next: Category | IncomeCategory) {
    setTxCategory(next as Category)
    if (next !== "debt_payment") {
      setDebtId("")
    }
    if (next !== "savings" && transactionType === "expense") {
      setFreezeInBucketId("")
    }
  }

  async function handleNlParse() {
    setNlPending(true)
    setError(null)
    try {
      const parsed = await parseNaturalLanguageExpense({ data: { text: nlText } })
      setDescription(parsed.description)
      setAmount(String(parsed.originalAmountCents / 100))
      setCurrency(parsed.originalCurrency)
      setTxCategory(parsed.category)
      setMatchedRate(parsed.matchedRate)
      setTransactionType("expense")
      setEntryMode("manual")
      setFreezeInBucketId("")
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
    if (transactionType === "expense" && txCategory === "debt_payment" && !debtId) {
      setError("Selecciona la deuda a abonar.")
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
        category: txCategory,
        type: transactionType,
        matchedRate,
        debtId: debtId || undefined,
        freezeInBucketId: freezeInBucketId || undefined,
      },
      {
        onSuccess: () => {
          setDescription("")
          setAmount("")
          setNlText("")
          setDebtId("")
          setFreezeInBucketId("")
          onSuccess()
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Error al registrar")
        },
      },
    )
  }

  return {
    transactionType,
    setTransactionType: handleTransactionTypeChange,
    entryMode,
    setEntryMode,
    description,
    setDescription,
    amount,
    setAmount,
    currency,
    setCurrency,
    txCategory,
    setTxCategory: handleCategoryChange,
    matchedRate,
    setMatchedRate,
    debtId,
    setDebtId,
    freezeInBucketId,
    setFreezeInBucketId,
    debts,
    buckets,
    nlText,
    setNlText,
    nlPending,
    error,
    createMutation,
    handleNlParse,
    handleSubmit,
    showAiPanel:
      aiConfigured && transactionType === "expense" && entryMode === "ai",
    showManualForm:
      entryMode === "manual" || !aiConfigured || transactionType === "income",
  }
}

export type TransactionFormState = ReturnType<typeof useTransactionFormState>

/** @deprecated use useTransactionFormState */
export const useExpenseFormState = useTransactionFormState
export type ExpenseFormState = TransactionFormState
