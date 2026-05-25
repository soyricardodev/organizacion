import { Button } from "@/components/ui/button"
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/dashboard/panel"
import { formatUsd, weeklyProrate } from "@/lib/money"
import type { Bucket } from "@/db/schema"
import type { BucketOpMode } from "@/hooks/use-bucket-operation"

interface BucketCardsProps {
  buckets: Bucket[]
  onOperation: (bucket: Bucket, mode: BucketOpMode) => void
}

export function BucketCards({ buckets, onOperation }: BucketCardsProps) {
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
          const canRelease = bucket.frozenCents > 0
          const canTransfer = buckets.length > 1 && canRelease

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
              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[10px] uppercase tracking-widest"
                  onClick={() => onOperation(bucket, "allocate")}
                >
                  apartar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[10px] uppercase tracking-widest"
                  disabled={!canRelease}
                  onClick={() => onOperation(bucket, "release")}
                >
                  liberar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[10px] uppercase tracking-widest"
                  disabled={!canTransfer}
                  onClick={() => onOperation(bucket, "transfer")}
                >
                  mover
                </Button>
              </div>
            </div>
          )
        })}
      </PanelBody>
    </Panel>
  )
}
