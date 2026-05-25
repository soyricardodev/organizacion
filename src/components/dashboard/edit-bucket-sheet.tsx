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
import { useUpdateBucket } from "@/hooks/use-update-bucket"
import type { Bucket } from "@/db/schema"

interface EditBucketSheetProps {
  bucket: Bucket | null
  month: string
  onClose: () => void
}

export function EditBucketSheet({ bucket, month, onClose }: EditBucketSheetProps) {
  const [name, setName] = useState("")
  const [target, setTarget] = useState("")
  const [weeklyTarget, setWeeklyTarget] = useState("")
  const [error, setError] = useState<string | null>(null)

  const mutation = useUpdateBucket(month)

  useEffect(() => {
    if (!bucket) return
    setName(bucket.name)
    setTarget(String(bucket.targetCents / 100))
    setWeeklyTarget(String(bucket.weeklyTargetCents / 100))
    setError(null)
  }, [bucket])

  function handleOpenChange(open: boolean) {
    if (!open) {
      setError(null)
      onClose()
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!bucket) return
    setError(null)

    mutation.mutate(
      {
        id: bucket.id,
        name: name.trim(),
        targetCents: parseAmountToCents(target),
        weeklyTargetCents: parseAmountToCents(weeklyTarget),
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
    <Sheet open={bucket !== null} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90vh] overflow-y-auto border-border bg-background"
      >
        <SheetHeader>
          <SheetTitle className="text-xs uppercase tracking-widest">
            editar bucket
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="px-4 pb-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="bucket-name" className="label-caps">
                nombre
              </FieldLabel>
              <Input
                id="bucket-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="bucket-target" className="label-caps">
                  meta total usd
                </FieldLabel>
                <Input
                  id="bucket-target"
                  inputMode="decimal"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="bucket-weekly" className="label-caps">
                  meta semanal usd
                </FieldLabel>
                <Input
                  id="bucket-weekly"
                  inputMode="decimal"
                  value={weeklyTarget}
                  onChange={(e) => setWeeklyTarget(e.target.value)}
                  required
                />
              </Field>
            </div>

            {error && <FieldError>{error}</FieldError>}

            <Button type="submit" disabled={mutation.isPending} className="w-full">
              {mutation.isPending ? "…" : "guardar bucket"}
            </Button>
          </FieldGroup>
        </form>
      </SheetContent>
    </Sheet>
  )
}
