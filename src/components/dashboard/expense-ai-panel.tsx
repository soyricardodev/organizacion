import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel } from "@/components/ui/field"

interface ExpenseAiPanelProps {
  aiModel?: string
  nlText: string
  onNlTextChange: (value: string) => void
  onParse: () => void
  pending: boolean
}

export function ExpenseAiPanel({
  aiModel,
  nlText,
  onNlTextChange,
  onParse,
  pending,
}: ExpenseAiPanelProps) {
  return (
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
        onChange={(e) => onNlTextChange(e.target.value)}
        rows={2}
        className="rounded-md border-border bg-transparent text-xs"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2 w-full"
        onClick={onParse}
        disabled={pending || !nlText.trim()}
      >
        {pending ? "…" : "interpretar → manual"}
      </Button>
    </Field>
  )
}
