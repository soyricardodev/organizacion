import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { ExpenseAiPanel } from "@/components/dashboard/expense-ai-panel"
import { TransactionManualFields } from "@/components/dashboard/transaction-manual-fields"
import { useTransactionFormState } from "@/hooks/use-transaction-form-state"
import type { ActiveRates } from "@/lib/rates"
import type { Bucket, Debt } from "@/db/schema"

type DebtOption = Debt & {
  progressPercent: number
  daysRemaining: number
  dailyRequiredCents: number
}

interface QuickExpenseFormProps {
  rates: ActiveRates | undefined
  aiConfigured: boolean
  aiModel?: string
  month: string
  category: string
  debts: DebtOption[]
  buckets: Bucket[]
  onSuccess: () => void
}

export function QuickExpenseForm({
  rates,
  aiConfigured,
  aiModel,
  month,
  category,
  debts,
  buckets,
  onSuccess,
}: QuickExpenseFormProps) {
  const form = useTransactionFormState({
    rates,
    aiConfigured,
    month,
    category,
    debts,
    buckets,
    onSuccess,
  })

  return (
    <FieldGroup>
      <Field>
        <FieldLabel className="label-caps">tipo</FieldLabel>
        <ToggleGroup
          variant="outline"
          spacing={0}
          className="w-full"
          value={[form.transactionType]}
          onValueChange={(values) => {
            const next = values[0] as "expense" | "income" | undefined
            if (next) form.setTransactionType(next)
          }}
        >
          <ToggleGroupItem value="expense" className="flex-1">
            gasto
          </ToggleGroupItem>
          <ToggleGroupItem value="income" className="flex-1">
            ingreso
          </ToggleGroupItem>
        </ToggleGroup>
      </Field>

      {aiConfigured && form.transactionType === "expense" && (
        <Field>
          <FieldLabel className="label-caps">modo</FieldLabel>
          <ToggleGroup
            variant="outline"
            spacing={0}
            className="w-full"
            value={[form.entryMode]}
            onValueChange={(values) => {
              const next = values[0] as "manual" | "ai" | undefined
              if (next) form.setEntryMode(next)
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

      {form.showAiPanel && (
        <ExpenseAiPanel
          aiModel={aiModel}
          nlText={form.nlText}
          onNlTextChange={form.setNlText}
          onParse={form.handleNlParse}
          pending={form.nlPending}
        />
      )}

      {form.showManualForm && (
        <TransactionManualFields
          transactionType={form.transactionType}
          description={form.description}
          onDescriptionChange={form.setDescription}
          amount={form.amount}
          onAmountChange={form.setAmount}
          currency={form.currency}
          onCurrencyChange={form.setCurrency}
          txCategory={form.txCategory}
          onTxCategoryChange={form.setTxCategory}
          matchedRate={form.matchedRate}
          onMatchedRateChange={form.setMatchedRate}
          debtId={form.debtId}
          onDebtIdChange={form.setDebtId}
          freezeInBucketId={form.freezeInBucketId}
          onFreezeInBucketIdChange={form.setFreezeInBucketId}
          debts={form.debts}
          buckets={form.buckets}
          error={form.error}
          isPending={form.createMutation.isPending}
          canSubmit={Boolean(rates?.id)}
          onSubmit={form.handleSubmit}
        />
      )}
    </FieldGroup>
  )
}
