import { useState } from "react"
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { parseAmountToCents } from "@/lib/money"
import { formatUsd } from "@/lib/money"
import {
  useBucketOperation,
  type BucketOpMode,
} from "@/hooks/use-bucket-operation"
import type { ActiveRates } from "@/lib/rates"
import type { Bucket } from "@/db/schema"
import type { Currency, MatchedRate } from "@/domain/types"

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

const MODE_LABELS: Record<BucketOpMode, string> = {
  allocate: "apartar en fondo",
  release: "liberar fondo",
  transfer: "mover fondo",
}

const MODE_SUBMIT: Record<BucketOpMode, string> = {
  allocate: "confirmar apartado",
  release: "confirmar liberación",
  transfer: "confirmar transferencia",
}

interface BucketOperationSheetProps {
  open: boolean
  mode: BucketOpMode | null
  bucket: Bucket | null
  buckets: Bucket[]
  rates: ActiveRates | undefined
  month: string
  category: string
  onClose: () => void
}

export function BucketOperationSheet({
  open,
  mode,
  bucket,
  buckets,
  rates,
  month,
  category,
  onClose,
}: BucketOperationSheetProps) {
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState<Currency>("USD")
  const [matchedRate, setMatchedRate] = useState<MatchedRate>("bcv")
  const [description, setDescription] = useState("")
  const [toBucketId, setToBucketId] = useState("")
  const [error, setError] = useState<string | null>(null)

  const mutation = useBucketOperation(month, category)

  const targetBuckets =
    mode === "transfer"
      ? buckets.filter((item) => item.id !== bucket?.id)
      : []

  function resetForm() {
    setAmount("")
    setDescription("")
    setToBucketId("")
    setError(null)
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      resetForm()
      onClose()
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!bucket || !mode || !rates?.id) {
      setError("Introduce las tasas antes de registrar.")
      return
    }
    if (mode === "transfer" && !toBucketId) {
      setError("Selecciona el bucket destino.")
      return
    }

    setError(null)
    mutation.mutate(
      {
        tempId: `optimistic-${crypto.randomUUID()}`,
        mode,
        bucketId: bucket.id,
        toBucketId: toBucketId || undefined,
        description:
          description ||
          `${MODE_LABELS[mode]} · ${bucket.name}`,
        originalAmountCents: parseAmountToCents(amount),
        originalCurrency: currency,
        matchedRate,
      },
      {
        onSuccess: () => {
          resetForm()
          onClose()
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Error al registrar")
        },
      },
    )
  }

  if (!bucket || !mode) return null

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90vh] overflow-y-auto border-border bg-background"
      >
        <SheetHeader>
          <SheetTitle className="text-xs uppercase tracking-widest">
            {MODE_LABELS[mode]}
          </SheetTitle>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            {bucket.name} · {formatUsd(bucket.frozenCents)} congelado
          </p>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="px-4 pb-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="bucket-amount" className="label-caps">
                monto
              </FieldLabel>
              <Input
                id="bucket-amount"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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
                  onValueChange={(v) => setCurrency(v as Currency)}
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
                  onValueChange={(v) => setMatchedRate(v as MatchedRate)}
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

            {mode === "transfer" && (
              <Field>
                <FieldLabel className="label-caps">destino</FieldLabel>
                <Select
                  items={targetBuckets.map((item) => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  value={toBucketId || null}
                  onValueChange={(v) => setToBucketId(v ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Bucket destino" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {targetBuckets.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="bucket-desc" className="label-caps">
                nota
              </FieldLabel>
              <Input
                id="bucket-desc"
                placeholder="opcional"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-md border-border bg-transparent"
              />
            </Field>

            {error && <FieldError>{error}</FieldError>}

            <Button
              type="submit"
              disabled={mutation.isPending || !rates?.id}
              className="w-full"
            >
              {mutation.isPending ? "…" : MODE_SUBMIT[mode]}
            </Button>
          </FieldGroup>
        </form>
      </SheetContent>
    </Sheet>
  )
}
