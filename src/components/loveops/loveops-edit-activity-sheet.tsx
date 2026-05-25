import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { updateLoveActivity } from "@/server/loveops"
import type { EnrichedLoveActivity } from "@/domain/loveops/get-activities"

interface LoveopsEditActivitySheetProps {
  activity: EnrichedLoveActivity | null
  onClose: () => void
  onSaved: () => void
}

export function LoveopsEditActivitySheet({
  activity,
  onClose,
  onSaved,
}: LoveopsEditActivitySheetProps) {
  const [frequencyDaysTarget, setFrequencyDaysTarget] = useState("7")
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (activity) setFrequencyDaysTarget(String(activity.frequencyDaysTarget))
  }, [activity])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!activity) return
    setPending(true)
    try {
      await updateLoveActivity({
        data: {
          id: activity.id,
          frequencyDaysTarget: Number(frequencyDaysTarget),
        },
      })
      onSaved()
      onClose()
    } finally {
      setPending(false)
    }
  }

  async function handleArchive() {
    if (!activity) return
    setPending(true)
    try {
      await updateLoveActivity({ data: { id: activity.id, active: false } })
      onSaved()
      onClose()
    } finally {
      setPending(false)
    }
  }

  return (
    <Sheet open={activity !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="border-border bg-background">
        <SheetHeader>
          <SheetTitle className="text-xs uppercase tracking-widest">
            editar actividad
          </SheetTitle>
          {activity && <p className="text-xs text-muted-foreground">{activity.title}</p>}
        </SheetHeader>
        <form onSubmit={handleSubmit} className="px-4 pb-6">
          <FieldGroup>
            <Field>
              <FieldLabel className="label-caps">meta (días)</FieldLabel>
              <Input
                inputMode="numeric"
                value={frequencyDaysTarget}
                onChange={(e) => setFrequencyDaysTarget(e.target.value)}
                required
              />
            </Field>
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "…" : "guardar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              className="w-full"
              onClick={handleArchive}
            >
              archivar
            </Button>
          </FieldGroup>
        </form>
      </SheetContent>
    </Sheet>
  )
}
