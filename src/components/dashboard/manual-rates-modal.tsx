import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { saveManualRates } from "@/server/finance"

interface ManualRatesModalProps {
  open: boolean
  onSaved: () => void
}

export function ManualRatesModal({ open, onSaved }: ManualRatesModalProps) {
  const [bcvRate, setBcvRate] = useState("")
  const [euroBcvRate, setEuroBcvRate] = useState("")
  const [paraleloRate, setParaleloRate] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const format = (v: string) => Number.parseFloat(v).toFixed(4)
      await saveManualRates({
        data: {
          bcvRate: format(bcvRate),
          euroBcvRate: format(euroBcvRate),
          paraleloRate: format(paraleloRate),
        },
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar tasas")
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent showCloseButton={false} className="border-border bg-background">
        <DialogHeader>
          <DialogTitle className="text-xs uppercase tracking-widest">
            tasas requeridas
          </DialogTitle>
          <DialogDescription className="text-xs">
            API no disponible. Introduce las 3 tasas para continuar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="label-caps">bcv</span>
            <Input
              id="bcv"
              inputMode="decimal"
              placeholder="530.5047"
              value={bcvRate}
              onChange={(e) => setBcvRate(e.target.value)}
              className="rounded-md border-border bg-transparent tabular-nums"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="label-caps">eur bcv</span>
            <Input
              id="euro"
              inputMode="decimal"
              placeholder="615.5022"
              value={euroBcvRate}
              onChange={(e) => setEuroBcvRate(e.target.value)}
              className="rounded-md border-border bg-transparent tabular-nums"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="label-caps">paralelo</span>
            <Input
              id="paralelo"
              inputMode="decimal"
              placeholder="718.7998"
              value={paraleloRate}
              onChange={(e) => setParaleloRate(e.target.value)}
              className="rounded-md border-border bg-transparent tabular-nums"
              required
            />
          </div>
          {error && <p className="text-destructive text-xs">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "…" : "confirmar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
