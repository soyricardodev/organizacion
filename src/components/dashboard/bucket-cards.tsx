import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/dashboard/panel"
import { formatUsd, weeklyProrate } from "@/lib/money"
import type { Bucket } from "@/types/db"

interface BucketCardsProps {
  buckets: Bucket[]
}

export function BucketCards({ buckets }: BucketCardsProps) {
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Buckets</PanelTitle>
        <span className="text-[10px] text-muted-foreground">{buckets.length}</span>
      </PanelHeader>
      <PanelBody className="flex flex-col divide-y divide-border p-0">
        {buckets.map((bucket) => {
          const progress = Math.min(
            100,
            Math.round((bucket.frozenCents / bucket.targetCents) * 100),
          )
          const weekly = weeklyProrate(bucket.targetCents, bucket.frozenCents)

          return (
            <div key={bucket.id} className="flex flex-col gap-2 px-4 py-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs">{bucket.name}</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {formatUsd(bucket.frozenCents)}
                  <span className="text-muted-foreground/60">
                    /{formatUsd(bucket.targetCents)}
                  </span>
                </span>
              </div>
              <div className="h-px w-full bg-border">
                <div
                  className="h-px bg-foreground transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground tabular-nums uppercase tracking-widest">
                wk {formatUsd(weekly.current)}/{formatUsd(weekly.target)}
              </p>
            </div>
          )
        })}
      </PanelBody>
    </Panel>
  )
}
