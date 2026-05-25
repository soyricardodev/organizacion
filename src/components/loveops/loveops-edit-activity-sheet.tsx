import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { updateLoveActivity } from "@/server/loveops"
import type { EnrichedLoveActivity } from "@/domain/loveops/get-activities"
import {
  LoveopsActivityFormFields,
  activityToFormValues,
  formValuesToPayload,
  type LoveopsActivityFormValues,
} from "@/components/loveops/loveops-activity-form-fields"

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
  const [values, setValues] = useState<LoveopsActivityFormValues | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (activity) setValues(activityToFormValues(activity))
    else setValues(null)
  }, [activity])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!activity || !values) return
    if (!values.title.trim() || values.selectedTags.length === 0) return

    setPending(true)
    try {
      await updateLoveActivity({
        data: {
          id: activity.id,
          ...formValuesToPayload(values),
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

  async function handleRestore() {
    if (!activity) return
    setPending(true)
    try {
      await updateLoveActivity({ data: { id: activity.id, active: true } })
      onSaved()
      onClose()
    } finally {
      setPending(false)
    }
  }

  return (
    <Sheet open={activity !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="max-h-[90svh] overflow-y-auto border-border bg-background">
        <SheetHeader>
          <SheetTitle className="text-xs uppercase tracking-widest">
            editar actividad
          </SheetTitle>
        </SheetHeader>
        {values && (
          <form onSubmit={handleSubmit} className="px-4 pb-6">
            <LoveopsActivityFormFields
              values={values}
              onChange={setValues}
              idPrefix="edit-activity"
            />
            <div className="mt-4 flex flex-col gap-2">
              <Button
                type="submit"
                disabled={pending || values.selectedTags.length === 0}
                className="w-full"
              >
                {pending ? "…" : "guardar cambios"}
              </Button>
              {activity?.active !== false ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  className="w-full"
                  onClick={handleArchive}
                >
                  archivar
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  className="w-full"
                  onClick={handleRestore}
                >
                  restaurar
                </Button>
              )}
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  )
}
