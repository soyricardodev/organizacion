import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { format } from "date-fns"
import { Plus } from "lucide-react"
import { dashboardSearchSchema } from "@/lib/search-params"
import { queryKeys } from "@/lib/query-keys"
import {
  getActiveRates,
  getTransactions,
  getBuckets,
  getDebts,
  getDashboardSummary,
} from "@/server/finance"
import { getCachedInsight, generateWeeklyInsight, getAiStatus } from "@/server/ai"
import { RatesWidget } from "@/components/dashboard/rates-widget"
import { RunwayIndicator } from "@/components/dashboard/runway-indicator"
import { DebtTimeline } from "@/components/dashboard/debt-timeline"
import { BucketCards } from "@/components/dashboard/bucket-cards"
import { ManualRatesModal } from "@/components/dashboard/manual-rates-modal"
import { InsightsPanel } from "@/components/dashboard/insights-panel"
import { QuickExpenseForm } from "@/components/dashboard/quick-expense-form"
import { TransactionList } from "@/components/dashboard/transaction-list"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { pendingCount, subscribeQueue } from "@/lib/offline-queue"
import { cn } from "@/lib/utils"
import { useSyncExternalStore } from "react"

export const Route = createFileRoute("/dashboard/")({
  validateSearch: dashboardSearchSchema,
  loaderDeps: ({ search }) => ({ month: search.month, category: search.category }),
  loader: async ({ context, deps }) => {
    const { queryClient } = context
    await Promise.all([
      queryClient.ensureQueryData({
        queryKey: queryKeys.rates,
        queryFn: () => getActiveRates(),
      }),
      queryClient.ensureQueryData({
        queryKey: queryKeys.transactions(deps.month, deps.category),
        queryFn: () =>
          getTransactions({ data: { month: deps.month, category: deps.category } }),
      }),
      queryClient.ensureQueryData({
        queryKey: queryKeys.buckets,
        queryFn: () => getBuckets(),
      }),
      queryClient.ensureQueryData({
        queryKey: queryKeys.debts,
        queryFn: () => getDebts(),
      }),
      queryClient.ensureQueryData({
        queryKey: queryKeys.dashboard(deps.month),
        queryFn: () => getDashboardSummary({ data: { month: deps.month } }),
      }),
      queryClient.ensureQueryData({
        queryKey: queryKeys.insights(format(new Date(), "yyyy-'W'ww")),
        queryFn: () => getCachedInsight(),
      }),
      queryClient.ensureQueryData({
        queryKey: ["ai-status"],
        queryFn: () => getAiStatus(),
      }),
    ])
  },
  component: DashboardPage,
})

function DashboardPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()

  const ratesQuery = useQuery({
    queryKey: queryKeys.rates,
    queryFn: () => getActiveRates(),
  })

  const transactionsQuery = useQuery({
    queryKey: queryKeys.transactions(search.month, search.category),
    queryFn: () =>
      getTransactions({ data: { month: search.month, category: search.category } }),
  })

  const bucketsQuery = useQuery({
    queryKey: queryKeys.buckets,
    queryFn: () => getBuckets(),
  })

  const debtsQuery = useQuery({
    queryKey: queryKeys.debts,
    queryFn: () => getDebts(),
  })

  const summaryQuery = useQuery({
    queryKey: queryKeys.dashboard(search.month),
    queryFn: () => getDashboardSummary({ data: { month: search.month } }),
  })

  const insightQuery = useQuery({
    queryKey: queryKeys.insights(format(new Date(), "yyyy-'W'ww")),
    queryFn: () => getCachedInsight(),
  })

  const aiStatusQuery = useQuery({
    queryKey: ["ai-status"],
    queryFn: () => getAiStatus(),
    staleTime: 60_000,
  })

  const isOnline = useOnlineStatus()
  const queueSize = useSyncExternalStore(subscribeQueue, pendingCount, () => 0)

  const insightMutation = useMutation({
    mutationFn: () => generateWeeklyInsight({ data: { month: search.month } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.insights(format(new Date(), "yyyy-'W'ww")),
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
          <span className="text-[10px] text-muted-foreground tabular-nums uppercase tracking-widest">
            {search.month}
            {!isOnline && " · offline"}
            {queueSize > 0 && ` · ${queueSize} pend.`}
          </span>
        </div>
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
              />
            )}

            {bucketsQuery.data && <BucketCards buckets={bucketsQuery.data} />}

            <InsightsPanel
              insight={insightQuery.data}
              aiConfigured={Boolean(aiStatusQuery.data?.configured)}
              aiModel={aiStatusQuery.data?.model}
              onGenerate={() => insightMutation.mutate()}
              isGenerating={insightMutation.isPending}
            />
          </>
        ) : (
          <TransactionList transactions={transactionsQuery.data ?? []} />
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
              onSuccess={() => {
                navigate({ search: (prev) => ({ ...prev, view: "overview" }) })
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <ManualRatesModal
        open={needsManualRates}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: queryKeys.rates })
        }}
      />
    </div>
  )
}
