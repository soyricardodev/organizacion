import { BUDGET_RULE, CATEGORY_LABELS } from "@/lib/constants"
import { formatUsd } from "@/lib/money"
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/dashboard/panel"
import type { Category } from "@/domain/types"

const BUDGET_CATEGORIES = ["needs", "wants", "savings"] as const satisfies readonly Category[]

interface CategoryBreakdownProps {
  totalIncome: number
  spendingByCategory: Record<string, number>
}

export function CategoryBreakdown({
  totalIncome,
  spendingByCategory,
}: CategoryBreakdownProps) {
  if (totalIncome === 0) return null

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>60 / 20 / 20</PanelTitle>
      </PanelHeader>
      <PanelBody className="flex flex-col gap-3">
        {BUDGET_CATEGORIES.map((category) => {
          const spent = spendingByCategory[category] ?? 0
          const budget = Math.round(totalIncome * BUDGET_RULE[category])
          const progress =
            budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0

          return (
            <div key={category} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {CATEGORY_LABELS[category]}
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {formatUsd(spent)}
                  <span className="text-muted-foreground/60">
                    /{formatUsd(budget)}
                  </span>
                </span>
              </div>
              <div className="h-px w-full bg-border">
                <div
                  className="h-px bg-foreground transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )
        })}
      </PanelBody>
    </Panel>
  )
}
