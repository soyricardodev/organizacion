import { createFileRoute } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useState } from "react"
import { dashboardSearchSchema } from "@/lib/search-params"
import { queryKeys } from "@/lib/query-keys"
import {
  dashboardQueries,
  dashboardQueryList,
} from "@/lib/dashboard-queries"
import { generateWeeklyInsight } from "@/server/ai"
import { RatesWidget } from "@/components/dashboard/rates-widget"
import { RunwayIndicator } from "@/components/dashboard/runway-indicator"
import { DebtTimeline } from "@/components/dashboard/debt-timeline"
import { BucketCards } from "@/components/dashboard/bucket-cards"
import { BucketOperationSheet } from "@/components/dashboard/bucket-operation-sheet"
import { EditBucketSheet } from "@/components/dashboard/edit-bucket-sheet"
import { EditDebtSheet } from "@/components/dashboard/edit-debt-sheet"
import { ManualRatesModal } from "@/components/dashboard/manual-rates-modal"
import { InsightsPanel } from "@/components/dashboard/insights-panel"
import { QuickExpenseForm } from "@/components/dashboard/quick-expense-form"
import { MonthSummary } from "@/components/dashboard/month-summary"
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown"
import { DashboardFilters } from "@/components/dashboard/dashboard-filters"
import { TransactionList } from "@/components/dashboard/transaction-list"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useOnlineStatus } from "@/hooks/use-online-status"
import type { BucketOpMode } from "@/hooks/use-bucket-operation"
import { pendingCount, subscribeQueue } from "@/lib/offline-queue"
import { cn } from "@/lib/utils"
import { useSyncExternalStore } from "react"
import { currentWeekKey } from "@/domain/dates"
import type { Bucket } from "@/db/schema"
import type { FilterCategory } from "@/domain/types"

export const Route = createFileRoute("/dashboard/")({
  validateSearch: dashboardSearchSchema,
  loaderDeps: ({ search }) => ({ month: search.month, category: search.category }),
  loader: async ({ context, deps }) => {
    const { queryClient } = context
    await Promise.all(
      dashboardQueryList(deps.month, deps.category).map((query) =>
        queryClient.ensureQueryData(query as Parameters<typeof queryClient.ensureQueryData>[0]),
      ),
    )
  },
  component: DashboardPage,
})

function DashboardPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const queries = dashboardQueries(search.month, search.category)

  const ratesQuery = useQuery(queries.rates)
  const transactionsQuery = useQuery(queries.transactions)
  const bucketsQuery = useQuery(queries.buckets)
  const debtsQuery = useQuery(queries.debts)
  const summaryQuery = useQuery(queries.summary)
  const insightQuery = useQuery(queries.insight)
  const aiStatusQuery = useQuery(queries.aiStatus)

  const [bucketOp, setBucketOp] = useState<{
    bucket: Bucket
    mode: BucketOpMode
  } | null>(null)
  const [editDebt, setEditDebt] = useState<
    NonNullable<typeof debtsQuery.data>[number] | null
  >(null)
  const [editBucket, setEditBucket] = useState<Bucket | null>(null)

  const isOnline = useOnlineStatus()
  const queueSize = useSyncExternalStore(subscribeQueue, pendingCount, () => 0)

  const insightMutation = useMutation({
    mutationFn: () => generateWeeklyInsight({ data: { month: search.month } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.insights(currentWeekKey()),
      })
    },
  })

  const needsManualRates = Boolean(
    ratesQuery.data?.fetchFailed && !ratesQuery.data?.id,
  )

  const summary = summaryQuery.data
  const tab = search.view === "transactions" ? "transactions" : "overview"

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xs uppercase tracking-widest">organización</h1>
          <div className="flex items-center gap-3">
            <Link
              to="/loveops"
              className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              loveops
            </Link>
            <span className="text-[10px] text-muted-foreground tabular-nums uppercase tracking-widest">
              {!isOnline && "offline"}
              {isOnline && queueSize === 0 && "online"}
              {queueSize > 0 && `${queueSize} pend.`}
            </span>
          </div>
        </div>

        <DashboardFilters
          month={search.month}
          category={search.category}
          showCategoryFilter={tab === "transactions"}
          onMonthChange={(month) =>
            navigate({ search: (prev) => ({ ...prev, month }) })
          }
          onCategoryChange={(category: FilterCategory) =>
            navigate({ search: (prev) => ({ ...prev, category }) })
          }
        />

        <nav className="mt-3 flex gap-1">
          {(["overview", "transactions"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    view: v === "overview" ? "overview" : "transactions",
                  }),
                })
              }
              className={cn(
                "rounded-md px-2.5 py-1 text-[10px] uppercase tracking-widest transition-colors",
                tab === v
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v === "overview" ? "resumen" : "movs"}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex flex-1 flex-col gap-3 p-4 pb-24">
        <RatesWidget
          rates={ratesQuery.data}
          isLoading={ratesQuery.isFetching}
          onRefresh={() => ratesQuery.refetch()}
        />

        {tab === "overview" ? (
          <>
            {summary && (
              <MonthSummary
                totalIncome={summary.totalIncome}
                totalSpent={summary.totalSpent}
                totalAllocated={summary.totalAllocated}
                totalReleased={summary.totalReleased}
                netBalance={summary.netBalance}
                availableBalance={summary.availableBalance}
              />
            )}

            {summary && summary.totalIncome > 0 && (
              <CategoryBreakdown
                totalIncome={summary.totalIncome}
                spendingByCategory={summary.spendingByCategory}
              />
            )}

            {summary && (
              <RunwayIndicator
                emergencyCents={summary.emergencyCents}
                minimumMonthlyCostCents={summary.minimumMonthlyCostCents}
                months={summary.runway.months}
                days={summary.runway.days}
              />
            )}

            {summary && debtsQuery.data && (
              <DebtTimeline
                debts={debtsQuery.data}
                totalDebtRemaining={summary.totalDebtRemaining}
                totalDebtOriginal={summary.totalDebtOriginal}
                debtProgressPercent={summary.debtProgressPercent}
                debtTargetDate={summary.debtTargetDate}
                daysToDebtTarget={summary.daysToDebtTarget}
                onEditDebt={setEditDebt}
              />
            )}

            {bucketsQuery.data && (
              <BucketCards
                buckets={bucketsQuery.data}
                onOperation={(bucket, mode) => setBucketOp({ bucket, mode })}
                onEdit={setEditBucket}
              />
            )}

            <InsightsPanel
              insight={insightQuery.data}
              aiConfigured={Boolean(aiStatusQuery.data?.configured)}
              aiModel={aiStatusQuery.data?.model}
              onGenerate={() => insightMutation.mutate()}
              isGenerating={insightMutation.isPending}
            />
          </>
        ) : (
          <TransactionList
            transactions={transactionsQuery.data ?? []}
            buckets={bucketsQuery.data ?? []}
          />
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
        <Button
          className="w-full"
          onClick={() =>
            navigate({ search: (prev) => ({ ...prev, view: "add" }) })
          }
          disabled={needsManualRates}
        >
          <Plus data-icon="inline-start" />
          registrar
        </Button>
      </div>

      <Sheet
        open={search.view === "add"}
        onOpenChange={(open) => {
          if (!open) navigate({ search: (prev) => ({ ...prev, view: "overview" }) })
        }}
      >
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto border-border bg-background">
          <SheetHeader>
            <SheetTitle className="text-xs uppercase tracking-widest">
              registro
            </SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            <QuickExpenseForm
              rates={ratesQuery.data}
              aiConfigured={Boolean(aiStatusQuery.data?.configured)}
              aiModel={aiStatusQuery.data?.model}
              month={search.month}
              category={search.category}
              debts={debtsQuery.data ?? []}
              buckets={bucketsQuery.data ?? []}
              onSuccess={() => {
                navigate({ search: (prev) => ({ ...prev, view: "overview" }) })
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <BucketOperationSheet
        open={bucketOp !== null}
        mode={bucketOp?.mode ?? null}
        bucket={bucketOp?.bucket ?? null}
        buckets={bucketsQuery.data ?? []}
        rates={ratesQuery.data}
        month={search.month}
        category={search.category}
        onClose={() => setBucketOp(null)}
      />

      <EditDebtSheet
        debt={editDebt}
        month={search.month}
        onClose={() => setEditDebt(null)}
      />

      <EditBucketSheet
        bucket={editBucket}
        month={search.month}
        onClose={() => setEditBucket(null)}
      />

      <ManualRatesModal
        open={needsManualRates}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: queryKeys.rates })
        }}
      />
    </div>
  )
}
