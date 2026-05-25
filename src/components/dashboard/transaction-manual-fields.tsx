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
import { CATEGORY_LABELS, INCOME_CATEGORY_LABELS } from "@/lib/constants"
import { formatUsd } from "@/lib/money"
import type {
  Category,
  Currency,
  IncomeCategory,
  MatchedRate,
  RegisterableTransactionType,
} from "@/domain/types"
import type { Bucket, Debt } from "@/db/schema"

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

const EXPENSE_CATEGORY_ITEMS = Object.entries(CATEGORY_LABELS).map(
  ([value, label]) => ({ value, label }),
)

const INCOME_CATEGORY_ITEMS = Object.entries(INCOME_CATEGORY_LABELS).map(
  ([value, label]) => ({ value, label }),
)

const NONE_BUCKET = { label: "No apartar", value: "_none" }

type DebtOption = Debt & {
  progressPercent: number
  daysRemaining: number
  dailyRequiredCents: number
}

interface TransactionManualFieldsProps {
  transactionType: RegisterableTransactionType
  description: string
  onDescriptionChange: (value: string) => void
  amount: string
  onAmountChange: (value: string) => void
  currency: Currency
  onCurrencyChange: (value: Currency) => void
  txCategory: Category | IncomeCategory
  onTxCategoryChange: (value: Category | IncomeCategory) => void
  matchedRate: MatchedRate
  onMatchedRateChange: (value: MatchedRate) => void
  debtId: string
  onDebtIdChange: (value: string) => void
  freezeInBucketId: string
  onFreezeInBucketIdChange: (value: string) => void
  debts: DebtOption[]
  buckets: Bucket[]
  error: string | null
  isPending: boolean
  canSubmit: boolean
  onSubmit: (e: React.FormEvent) => void
}

export function TransactionManualFields({
  transactionType,
  description,
  onDescriptionChange,
  amount,
  onAmountChange,
  currency,
  onCurrencyChange,
  txCategory,
  onTxCategoryChange,
  matchedRate,
  onMatchedRateChange,
  debtId,
  onDebtIdChange,
  freezeInBucketId,
  onFreezeInBucketIdChange,
  debts,
  buckets,
  error,
  isPending,
  canSubmit,
  onSubmit,
}: TransactionManualFieldsProps) {
  const isIncome = transactionType === "income"
  const isDebtPayment = !isIncome && txCategory === "debt_payment"
  const isSavingsExpense = !isIncome && txCategory === "savings"
  const showBucketPicker =
    buckets.length > 0 && (isIncome || isSavingsExpense)
  const categoryItems = isIncome
    ? INCOME_CATEGORY_ITEMS
    : EXPENSE_CATEGORY_ITEMS

  const debtItems = debts.map((debt) => ({
    label: `${debt.name} · ${formatUsd(debt.remainingCents)}`,
    value: debt.id,
  }))

  const bucketItems = [
    NONE_BUCKET,
    ...buckets.map((bucket) => ({
      label: bucket.name,
      value: bucket.id,
    })),
  ]

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
            placeholder={
              isIncome ? "salario mayo" : isDebtPayment ? "abono tarjeta" : "harina y queso"
            }
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="rounded-md border-border bg-transparent"
            required
          />
        </Field>

        <Field>
          <FieldLabel className="label-caps">
            {isIncome ? "destino" : "categoría"}
          </FieldLabel>
          <Select
            items={categoryItems}
            value={txCategory}
            onValueChange={(v) =>
              onTxCategoryChange(v as Category | IncomeCategory)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {categoryItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        {isDebtPayment && (
          <Field>
            <FieldLabel className="label-caps">deuda</FieldLabel>
            <Select
              items={debtItems}
              value={debtId || null}
              onValueChange={(v) => onDebtIdChange(v ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona deuda" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {debtItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        )}

        {showBucketPicker && (
          <Field>
            <FieldLabel className="label-caps">apartar en</FieldLabel>
            <Select
              items={bucketItems}
              value={freezeInBucketId || "_none"}
              onValueChange={(v) =>
                onFreezeInBucketIdChange(v === "_none" ? "" : (v ?? ""))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Opcional" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {bucketItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        )}

        {error && <FieldError>{error}</FieldError>}

        <Button
          type="submit"
          disabled={isPending || !canSubmit}
          className="w-full"
        >
          {isPending
            ? "…"
            : isIncome
              ? freezeInBucketId
                ? "confirmar ingreso y apartar"
                : "confirmar ingreso"
              : isDebtPayment
                ? "confirmar abono"
                : isSavingsExpense && freezeInBucketId
                  ? "confirmar gasto y apartar"
                  : "confirmar gasto"}
        </Button>
      </FieldGroup>
    </form>
  )
}

/** @deprecated use TransactionManualFields */
export const ExpenseManualFields = TransactionManualFields
