import { formatUsd } from "@/lib/money"
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/dashboard/panel"
import { cn } from "@/lib/utils"

interface MonthSummaryProps {
  totalIncome: number
  totalSpent: number
  totalAllocated: number
  totalReleased: number
  netBalance: number
  availableBalance: number
}

function formatSignedUsd(cents: number, sign: "+" | "−" | "auto") {
  const formatted = formatUsd(Math.abs(cents))
  if (cents === 0) return formatted
  if (sign === "auto") {
    return `${cents > 0 ? "+" : "−"}${formatted}`
  }
  return `${sign}${formatted}`
}

export function MonthSummary({
  totalIncome,
  totalSpent,
  totalAllocated,
  totalReleased,
  netBalance,
  availableBalance,
}: MonthSummaryProps) {
  const rows = [
    {
      label: "ingresos",
      value: formatSignedUsd(totalIncome, "+"),
      tone: "positive" as const,
    },
    {
      label: "gastos",
      value: formatSignedUsd(totalSpent, "−"),
      tone: "negative" as const,
    },
    ...(totalAllocated > 0
      ? [
          {
            label: "apartado",
            value: formatSignedUsd(totalAllocated, "−"),
            tone: "neutral" as const,
          },
        ]
      : []),
    ...(totalReleased > 0
      ? [
          {
            label: "liberado",
            value: formatSignedUsd(totalReleased, "+"),
            tone: "positive" as const,
          },
        ]
      : []),
    {
      label: "balance mes",
      value: formatSignedUsd(netBalance, "auto"),
      tone:
        netBalance > 0
          ? ("positive" as const)
          : netBalance < 0
            ? ("negative" as const)
            : ("neutral" as const),
    },
    {
      label: "disponible",
      value: formatSignedUsd(availableBalance, "auto"),
      tone:
        availableBalance > 0
          ? ("positive" as const)
          : availableBalance < 0
            ? ("negative" as const)
            : ("neutral" as const),
    },
  ]

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>mes</PanelTitle>
      </PanelHeader>
      <PanelBody className="divide-y divide-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
          >
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
              {row.label}
            </span>
            <span
              className={cn(
                "text-xs tabular-nums",
                row.tone === "positive" && "text-emerald-600 dark:text-emerald-400",
                row.tone === "negative" && "text-red-600 dark:text-red-400",
              )}
            >
              {row.value}
            </span>
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}
