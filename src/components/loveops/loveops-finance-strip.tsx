import { Link } from "@tanstack/react-router"
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/dashboard/panel"
import { formatUsd } from "@/lib/money"

interface LoveBucketSummary {
  id: string
  slug: string
  name: string
  frozenCents: number
  targetCents: number
  weeklyTargetCents: number
}

interface LoveopsFinanceStripProps {
  availableBalance: number
  buckets: LoveBucketSummary[]
}

export function LoveopsFinanceStrip({
  availableBalance,
  buckets,
}: LoveopsFinanceStripProps) {
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Finanzas pareja</PanelTitle>
        <Link
          to="/dashboard"
          className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          dashboard →
        </Link>
      </PanelHeader>
      <PanelBody className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            disponible mes
          </span>
          <span className="text-xs tabular-nums">{formatUsd(availableBalance)}</span>
        </div>
        {buckets.map((bucket) => (
          <div key={bucket.id} className="flex items-baseline justify-between gap-2">
            <span className="truncate text-xs">{bucket.name}</span>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {formatUsd(bucket.frozenCents)}
              <span className="text-muted-foreground/60">
                /{formatUsd(bucket.targetCents)}
              </span>
            </span>
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}
