import { useState } from "react"
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
import { useLogLoveActivity } from "@/hooks/use-log-love-activity"

interface LoveopsLogSheetProps {
  open: boolean
  activity: { id: string; title: string } | null
  month: string
  onClose: () => void
}

export function LoveopsLogSheet({
  open,
  activity,
  month,
  onClose,
}: LoveopsLogSheetProps) {
  const [notes, setNotes] = useState("")
  const logMutation = useLogLoveActivity(month)

  function handleOpenChange(next: boolean) {
    if (!next) {
      setNotes("")
      onClose()
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!activity) return
    logMutation.mutate(
      { activityId: activity.id, notes: notes.trim() || undefined },
      {
        onSuccess: () => {
          setNotes("")
          onClose()
        },
      },
    )
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="border-border bg-background">
        <SheetHeader>
          <SheetTitle className="text-xs uppercase tracking-widest">
            registrar hecho
          </SheetTitle>
          {activity && <p className="text-xs text-muted-foreground">{activity.title}</p>}
        </SheetHeader>
        <form onSubmit={handleSubmit} className="px-4 pb-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="log-notes" className="label-caps">
                nota (opcional)
              </FieldLabel>
              <Input
                id="log-notes"
                placeholder="cómo fue, qué sintieron…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Field>
            <Button type="submit" disabled={!activity || logMutation.isPending} className="w-full">
              {logMutation.isPending ? "…" : "confirmar"}
            </Button>
          </FieldGroup>
        </form>
      </SheetContent>
    </Sheet>
  )
}
