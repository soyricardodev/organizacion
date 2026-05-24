import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/dashboard/panel"
import { formatUsd } from "@/lib/money"

interface DebtItem {
  id: string
  name: string
  totalCents: number
  remainingCents: number
  targetDate: string
  progressPercent: number
  daysRemaining: number
  dailyRequiredCents: number
}

interface DebtTimelineProps {
  debts: DebtItem[]
  totalDebtRemaining: number
  totalDebtOriginal: number
  debtProgressPercent: number
  debtTargetDate: string
  daysToDebtTarget: number
}

export function DebtTimeline({
  debts,
  totalDebtRemaining,
  totalDebtOriginal,
  debtProgressPercent,
  debtTargetDate,
  daysToDebtTarget,
}: DebtTimelineProps) {
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Deudas</PanelTitle>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {daysToDebtTarget}d →{" "}
          {format(parseISO(debtTargetDate), "d MMM", { locale: es })}
        </span>
      </PanelHeader>
      <PanelBody className="flex flex-col gap-4">
        <div>
          <div className="mb-2 flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest">
            <span>{formatUsd(totalDebtOriginal - totalDebtRemaining)}</span>
            <span>{formatUsd(totalDebtRemaining)}</span>
          </div>
          <div className="h-px w-full bg-border">
            <div
              className="h-px bg-foreground transition-all"
              style={{ width: `${debtProgressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col divide-y divide-border">
          {debts.map((debt) => (
            <div key={debt.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-xs">{debt.name}</span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {formatUsd(debt.remainingCents)}
                </span>
              </div>
              <div className="h-px w-full bg-border">
                <div
                  className="h-px bg-muted-foreground transition-all"
                  style={{ width: `${debt.progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground tabular-nums uppercase tracking-widest">
                {debt.daysRemaining}d · {formatUsd(debt.dailyRequiredCents)}/d
              </p>
            </div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  )
}
