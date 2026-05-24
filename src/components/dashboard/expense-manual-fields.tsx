import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { CATEGORY_LABELS } from "@/lib/constants"
import type { Category, Currency, MatchedRate } from "@/domain/types"

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

interface ExpenseManualFieldsProps {
  description: string
  onDescriptionChange: (value: string) => void
  amount: string
  onAmountChange: (value: string) => void
  currency: Currency
  onCurrencyChange: (value: Currency) => void
  expenseCategory: Category
  onExpenseCategoryChange: (value: Category) => void
  matchedRate: MatchedRate
  onMatchedRateChange: (value: MatchedRate) => void
  error: string | null
  isPending: boolean
  canSubmit: boolean
  onSubmit: (e: React.FormEvent) => void
}

export function ExpenseManualFields({
  description,
  onDescriptionChange,
  amount,
  onAmountChange,
  currency,
  onCurrencyChange,
  expenseCategory,
  onExpenseCategoryChange,
  matchedRate,
  onMatchedRateChange,
  error,
  isPending,
  canSubmit,
  onSubmit,
}: ExpenseManualFieldsProps) {
  return (
    <form onSubmit={onSubmit}>
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
            onChange={(e) => onAmountChange(e.target.value)}
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
              onValueChange={(v) => onCurrencyChange(v as Currency)}
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
              onValueChange={(v) => onMatchedRateChange(v as MatchedRate)}
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
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="rounded-md border-border bg-transparent"
            required
          />
        </Field>

        <Field>
          <FieldLabel className="label-caps">categoría</FieldLabel>
          <Select
            items={CATEGORY_ITEMS}
            value={expenseCategory}
            onValueChange={(v) => onExpenseCategoryChange(v as Category)}
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
          disabled={isPending || !canSubmit}
          className="w-full"
        >
          {isPending ? "…" : "confirmar"}
        </Button>
      </FieldGroup>
    </form>
  )
}
