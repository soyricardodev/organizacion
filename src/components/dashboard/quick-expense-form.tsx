import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { CATEGORY_LABELS } from "@/lib/constants"
import { parseAmountToCents } from "@/lib/money"
import { parseNaturalLanguageExpense } from "@/server/ai"
import type { getActiveRates } from "@/server/finance"
import { useCreateTransaction } from "@/hooks/use-create-transaction"

type ActiveRates = Awaited<ReturnType<typeof getActiveRates>>
type EntryMode = "manual" | "ai"

const CURRENCY_ITEMS = [
  { label: "VES", value: "VES" },
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
] as const

const RATE_ITEMS = [
  { label: "BCV", value: "bcv" },
  { label: "EUR BCV", value: "euro_bcv" },
  { label: "PAR", value: "paralelo" },
] as const

const CATEGORY_ITEMS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}))

interface QuickExpenseFormProps {
  rates: ActiveRates | undefined
  aiConfigured: boolean
  aiModel?: string
  month: string
  category: string
  onSuccess: () => void
}

export function QuickExpenseForm({
  rates,
  aiConfigured,
  aiModel,
  month,
  category,
  onSuccess,
}: QuickExpenseFormProps) {
  const [entryMode, setEntryMode] = useState<EntryMode>("manual")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState<"VES" | "USD" | "EUR">("VES")
  const [expenseCategory, setExpenseCategory] = useState<
    "needs" | "wants" | "savings" | "health" | "debt_payment"
  >("needs")
  const [matchedRate, setMatchedRate] = useState<
    "bcv" | "euro_bcv" | "paralelo"
  >("bcv")
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

  const showAiPanel = aiConfigured && entryMode === "ai"

  return (
    <FieldGroup>
      {aiConfigured && (
        <Field>
          <FieldLabel className="label-caps">modo</FieldLabel>
          <ToggleGroup
            variant="outline"
            spacing={0}
            className="w-full"
            value={[entryMode]}
            onValueChange={(values) => {
              const next = values[0] as EntryMode | undefined
              if (next) setEntryMode(next)
            }}
          >
            <ToggleGroupItem value="manual" className="flex-1">
              manual
            </ToggleGroupItem>
            <ToggleGroupItem value="ai" className="flex-1">
              ia
            </ToggleGroupItem>
          </ToggleGroup>
        </Field>
      )}

      {showAiPanel && (
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel className="label-caps">texto libre</FieldLabel>
            {aiModel && (
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                {aiModel}
              </span>
            )}
          </div>
          <Textarea
            placeholder="gasté 450 bs en harina a tasa bcv"
            value={nlText}
            onChange={(e) => setNlText(e.target.value)}
            rows={2}
            className="rounded-md border-border bg-transparent text-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={handleNlParse}
            disabled={nlPending || !nlText.trim()}
          >
            {nlPending ? "…" : "interpretar → manual"}
          </Button>
        </Field>
      )}

      {(entryMode === "manual" || !aiConfigured) && (
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="amount" className="label-caps">
                monto
              </FieldLabel>
              <Input
                id="amount"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-auto rounded-md border-border bg-transparent py-2 text-2xl tabular-nums"
                autoFocus
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel className="label-caps">moneda</FieldLabel>
                <Select
                  items={[...CURRENCY_ITEMS]}
                  value={currency}
                  onValueChange={(v) => setCurrency(v as typeof currency)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {CURRENCY_ITEMS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel className="label-caps">tasa</FieldLabel>
                <Select
                  items={[...RATE_ITEMS]}
                  value={matchedRate}
                  onValueChange={(v) =>
                    setMatchedRate(v as typeof matchedRate)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tasa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {RATE_ITEMS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="desc" className="label-caps">
                descripción
              </FieldLabel>
              <Input
                id="desc"
                placeholder="harina y queso"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-md border-border bg-transparent"
                required
              />
            </Field>

            <Field>
              <FieldLabel className="label-caps">categoría</FieldLabel>
              <Select
                items={CATEGORY_ITEMS}
                value={expenseCategory}
                onValueChange={(v) =>
                  setExpenseCategory(v as typeof expenseCategory)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {CATEGORY_ITEMS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            {error && <FieldError>{error}</FieldError>}

            <Button
              type="submit"
              disabled={createMutation.isPending || !rates?.id}
              className="w-full"
            >
              {createMutation.isPending ? "…" : "confirmar"}
            </Button>
          </FieldGroup>
        </form>
      )}
    </FieldGroup>
  )
}
