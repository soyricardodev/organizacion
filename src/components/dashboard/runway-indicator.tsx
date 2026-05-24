import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/dashboard/panel"
import { formatUsd } from "@/lib/money"

interface RunwayIndicatorProps {
  emergencyCents: number
  minimumMonthlyCostCents: number
  months: number
  days: number
}

export function RunwayIndicator({
  emergencyCents,
  minimumMonthlyCostCents,
  months,
  days,
}: RunwayIndicatorProps) {
  const totalDays = months * 30 + days
  const maxDisplayDays = 180
  const progressPercent = Math.min(100, (totalDays / maxDisplayDays) * 100)

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Runway</PanelTitle>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {formatUsd(emergencyCents)}
        </span>
      </PanelHeader>
      <PanelBody>
        <p className="text-2xl tabular-nums tracking-tight">
          {totalDays === 0 ? (
            "—"
          ) : (
            <>
              {months > 0 && `${months}mo`}
              {months > 0 && days > 0 && " "}
              {days > 0 && `${days}d`}
            </>
          )}
        </p>
        <div className="mt-4 h-px w-full bg-border">
          <div
            className="h-px bg-foreground transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground uppercase tracking-widest">
          mín {formatUsd(minimumMonthlyCostCents)}/mes
        </p>
      </PanelBody>
    </Panel>
  )
}
