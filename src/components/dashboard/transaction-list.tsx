import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CATEGORY_LABELS } from "@/lib/constants"
import { formatUsd } from "@/lib/money"
import type { Transaction } from "@/types/db"

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <p className="py-12 text-center text-[10px] text-muted-foreground uppercase tracking-widest">
        sin movimientos
      </p>
    )
  }

  return (
    <div className="panel divide-y divide-border">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between gap-3 px-4 py-3"
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-xs">{tx.description}</span>
            <span className="text-[10px] text-muted-foreground tabular-nums uppercase tracking-widest">
              {format(tx.createdAt, "dd MMM HH:mm", { locale: es })} ·{" "}
              {tx.originalCurrency} {(tx.originalAmountCents / 100).toFixed(2)}
            </span>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-0.5">
            <span className="text-xs tabular-nums">{formatUsd(tx.usdCents)}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
              {CATEGORY_LABELS[tx.category]}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
