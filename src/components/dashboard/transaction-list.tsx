import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CATEGORY_LABELS } from "@/lib/constants"
import { formatUsd } from "@/lib/money"
import { cn } from "@/lib/utils"
import type { Bucket, Transaction } from "@/db/schema"

interface TransactionListProps {
  transactions: Transaction[]
  buckets?: Bucket[]
}

export function TransactionList({
  transactions,
  buckets = [],
}: TransactionListProps) {
  const bucketNames = new Map(buckets.map((bucket) => [bucket.id, bucket.name]))

  if (transactions.length === 0) {
    return (
      <p className="py-12 text-center text-[10px] text-muted-foreground uppercase tracking-widest">
        sin movimientos
      </p>
    )
  }

  return (
    <div className="panel divide-y divide-border">
      {transactions.map((tx) => {
        const isIncome = tx.type === "income"
        const isExpense = tx.type === "expense"
        const isDebtPayment = tx.type === "debt_payment"
        const isBucketFreeze = tx.type === "bucket_freeze"
        const isBucketRelease = tx.type === "bucket_release"
        const isOutflow = isExpense || isDebtPayment || isBucketFreeze
        const bucketName = tx.bucketId ? bucketNames.get(tx.bucketId) : undefined

        return (
          <div
            key={tx.id}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <div className="flex items-center gap-2">
                {isIncome && (
                  <span className="shrink-0 rounded-sm bg-emerald-500/15 px-1 py-0.5 text-[9px] uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                    ing
                  </span>
                )}
                {isExpense && (
                  <span className="shrink-0 rounded-sm bg-muted px-1 py-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">
                    gasto
                  </span>
                )}
                {isDebtPayment && (
                  <span className="shrink-0 rounded-sm bg-amber-500/15 px-1 py-0.5 text-[9px] uppercase tracking-widest text-amber-700 dark:text-amber-400">
                    abono
                  </span>
                )}
                {isBucketFreeze && (
                  <span className="shrink-0 rounded-sm bg-sky-500/15 px-1 py-0.5 text-[9px] uppercase tracking-widest text-sky-700 dark:text-sky-400">
                    apartado
                  </span>
                )}
                {isBucketRelease && (
                  <span className="shrink-0 rounded-sm bg-violet-500/15 px-1 py-0.5 text-[9px] uppercase tracking-widest text-violet-700 dark:text-violet-400">
                    liberado
                  </span>
                )}
                <span className="truncate text-xs">{tx.description}</span>
              </div>
              <span className="text-[10px] text-muted-foreground tabular-nums uppercase tracking-widest">
                {format(tx.createdAt, "dd MMM HH:mm", { locale: es })} ·{" "}
                {tx.originalCurrency} {(tx.originalAmountCents / 100).toFixed(2)}
                {bucketName ? ` · ${bucketName}` : ""}
              </span>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5">
              <span
                className={cn(
                  "text-xs tabular-nums",
                  (isIncome || isBucketRelease) &&
                    "text-emerald-600 dark:text-emerald-400",
                )}
              >
                {isIncome || isBucketRelease
                  ? "+"
                  : isOutflow
                    ? "−"
                    : ""}
                {formatUsd(tx.usdCents)}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                {CATEGORY_LABELS[tx.category]}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
