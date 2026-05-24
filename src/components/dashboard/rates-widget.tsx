import { format } from "date-fns"
import { es } from "date-fns/locale"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/dashboard/panel"
import type { ActiveRates } from "@/lib/rates"

interface RatesWidgetProps {
  rates: ActiveRates | undefined
  isLoading: boolean
  onRefresh: () => void
}

export function RatesWidget({ rates, isLoading, onRefresh }: RatesWidgetProps) {
  const needsManual = rates?.fetchFailed && !rates?.id

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Tasas</PanelTitle>
        <div className="flex items-center gap-2">
          {rates?.fetchFailed && (
            <span className="text-[10px] text-destructive uppercase tracking-widest">
              offline
            </span>
          )}
          {rates?.stale && !needsManual && (
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
              stale
            </span>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Actualizar tasas"
          >
            <RefreshCw />
          </Button>
        </div>
      </PanelHeader>
      <PanelBody>
        {needsManual ? (
          <p className="text-muted-foreground text-xs">
            Servicio no disponible — introduce tasas manualmente
          </p>
        ) : (
          <div className="grid grid-cols-3 divide-x divide-border">
            <RateCell label="BCV" value={rates?.bcvRate ?? "—"} />
            <RateCell label="EUR" value={rates?.euroBcvRate ?? "—"} />
            <RateCell label="PAR" value={rates?.paraleloRate ?? "—"} />
          </div>
        )}
        {rates?.fetchedAt && rates.id && (
          <p className="mt-3 text-[10px] text-muted-foreground uppercase tracking-widest">
            {rates.source} · {format(rates.fetchedAt, "dd MMM HH:mm", { locale: es })}
          </p>
        )}
      </PanelBody>
    </Panel>
  )
}

function RateCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 px-3 first:pl-0 last:pr-0">
      <span className="label-caps">{label}</span>
      <span className="text-sm tabular-nums">{value}</span>
    </div>
  )
}
