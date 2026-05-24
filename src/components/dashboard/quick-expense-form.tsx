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
import { ExpenseManualFields } from "@/components/dashboard/expense-manual-fields"
import { useExpenseFormState } from "@/hooks/use-expense-form-state"
import type { ActiveRates } from "@/lib/rates"

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
  const form = useExpenseFormState({
    rates,
    aiConfigured,
    month,
    category,
    onSuccess,
  })

  return (
    <FieldGroup>
      {aiConfigured && (
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
        <ExpenseManualFields
          description={form.description}
          onDescriptionChange={form.setDescription}
          amount={form.amount}
          onAmountChange={form.setAmount}
          currency={form.currency}
          onCurrencyChange={form.setCurrency}
          expenseCategory={form.expenseCategory}
          onExpenseCategoryChange={form.setExpenseCategory}
          matchedRate={form.matchedRate}
          onMatchedRateChange={form.setMatchedRate}
          error={form.error}
          isPending={form.createMutation.isPending}
          canSubmit={Boolean(rates?.id)}
          onSubmit={form.handleSubmit}
        />
      )}
    </FieldGroup>
  )
}
