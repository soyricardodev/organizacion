import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { parseAmountToCents } from "@/lib/money"
import { useUpdateDebt } from "@/hooks/use-update-debt"
import type { Debt } from "@/db/schema"

type DebtOption = Debt & {
  progressPercent: number
  daysRemaining: number
  dailyRequiredCents: number
}

interface EditDebtSheetProps {
  debt: DebtOption | null
  month: string
  onClose: () => void
}

export function EditDebtSheet({ debt, month, onClose }: EditDebtSheetProps) {
  const [name, setName] = useState("")
  const [total, setTotal] = useState("")
  const [remaining, setRemaining] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [priority, setPriority] = useState("0")
  const [error, setError] = useState<string | null>(null)

  const mutation = useUpdateDebt(month)

  useEffect(() => {
    if (!debt) return
    setName(debt.name)
    setTotal(String(debt.totalCents / 100))
    setRemaining(String(debt.remainingCents / 100))
    setTargetDate(debt.targetDate)
    setPriority(String(debt.priority))
    setError(null)
  }, [debt])

  function handleOpenChange(open: boolean) {
    if (!open) {
      setError(null)
      onClose()
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!debt) return
    setError(null)

    mutation.mutate(
      {
        id: debt.id,
        name: name.trim(),
        totalCents: parseAmountToCents(total),
        remainingCents: parseAmountToCents(remaining),
        targetDate,
        priority: Number(priority),
      },
      {
        onSuccess: () => onClose(),
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Error al guardar")
        },
      },
    )
  }

  return (
    <Sheet open={debt !== null} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90vh] overflow-y-auto border-border bg-background"
      >
        <SheetHeader>
          <SheetTitle className="text-xs uppercase tracking-widest">
            editar deuda
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="px-4 pb-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="debt-name" className="label-caps">
                nombre
              </FieldLabel>
              <Input
                id="debt-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="debt-total" className="label-caps">
                  total usd
                </FieldLabel>
                <Input
                  id="debt-total"
                  inputMode="decimal"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="debt-remaining" className="label-caps">
                  restante usd
                </FieldLabel>
                <Input
                  id="debt-remaining"
                  inputMode="decimal"
                  value={remaining}
                  onChange={(e) => setRemaining(e.target.value)}
                  required
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="debt-date" className="label-caps">
                  meta
                </FieldLabel>
                <Input
                  id="debt-date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="debt-priority" className="label-caps">
                  prioridad
                </FieldLabel>
                <Input
                  id="debt-priority"
                  inputMode="numeric"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  required
                />
              </Field>
            </div>

            {error && <FieldError>{error}</FieldError>}

            <Button type="submit" disabled={mutation.isPending} className="w-full">
              {mutation.isPending ? "…" : "guardar deuda"}
            </Button>
          </FieldGroup>
        </form>
      </SheetContent>
    </Sheet>
  )
}
