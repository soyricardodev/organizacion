import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useEffect, useState } from "react"
import { loveopsSearchSchema } from "@/lib/search-params"
import { loveopsQueries, loveopsQueryList } from "@/lib/loveops-queries"
import { LoveopsReminders } from "@/components/loveops/loveops-reminders"
import { LoveopsWeatherCard } from "@/components/loveops/loveops-weather-card"
import { LoveopsActivitiesList } from "@/components/loveops/loveops-activities-list"
import { LoveopsHomeKanban } from "@/components/loveops/loveops-home-kanban"
import { LoveopsFinanceStrip } from "@/components/loveops/loveops-finance-strip"
import { LoveopsSuggestPanel } from "@/components/loveops/loveops-suggest-panel"
import { LoveopsDuePanel } from "@/components/loveops/loveops-due-panel"
import { LoveopsLogSheet } from "@/components/loveops/loveops-log-sheet"
import { LoveopsAddActivity } from "@/components/loveops/loveops-add-activity"
import { LoveopsEditActivitySheet } from "@/components/loveops/loveops-edit-activity-sheet"
import { LoveopsSettingsPanel } from "@/components/loveops/loveops-settings-panel"
import { DashboardFilters } from "@/components/dashboard/dashboard-filters"
import { notifyLoveopsReminder } from "@/lib/loveops-notifications"
import { queryKeys } from "@/lib/query-keys"
import type { EnrichedLoveActivity } from "@/domain/loveops/get-activities"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/loveops/")({
  validateSearch: loveopsSearchSchema,
  loaderDeps: ({ search }) => ({ month: search.month }),
  loader: async ({ context, deps }) => {
    const { queryClient } = context
    await Promise.all(
      loveopsQueryList(deps.month).map((query) =>
        queryClient.ensureQueryData(query as Parameters<typeof queryClient.ensureQueryData>[0]),
      ),
    )
  },
  component: LoveopsPage,
})

function LoveopsPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const queries = loveopsQueries(search.month)

  const summaryQuery = useQuery(queries.summary)
  const activitiesQuery = useQuery(queries.activities)
  const projectsQuery = useQuery(queries.projects)
  const aiStatusQuery = useQuery(queries.aiStatus)

  const [logTarget, setLogTarget] = useState<{ id: string; title: string } | null>(null)
  const [editActivity, setEditActivity] = useState<EnrichedLoveActivity | null>(null)

  const summary = summaryQuery.data
  const tab = search.tab

  function openLogSheet(activityId: string) {
    const activity =
      summary?.activities.find((item) => item.id === activityId) ??
      activitiesQuery.data?.find((item) => item.id === activityId)
    if (!activity) return
    setLogTarget({ id: activity.id, title: activity.title })
  }

  function refreshLoveops() {
    queryClient.invalidateQueries({ queryKey: queryKeys.loveops(search.month) })
    queryClient.invalidateQueries({ queryKey: queryKeys.loveActivities })
  }

  useEffect(() => {
    if (!summary?.settings.notificationsEnabled) return
    const critical = summary.reminders.find((r) => r.severity === "critical")
    if (!critical) return
    notifyLoveopsReminder(critical.title, critical.message)
  }, [summary?.reminders, summary?.settings.notificationsEnabled])

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xs uppercase tracking-widest">loveops</h1>
          <Link
            to="/dashboard"
            className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            finanzas →
          </Link>
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground uppercase tracking-widest">
          planificar tiempo de calidad
          {summary?.settings.partnerName
            ? ` · ${summary.settings.partnerName}`
            : ""}
        </p>

        <DashboardFilters
          month={search.month}
          category="all"
          showCategoryFilter={false}
          onMonthChange={(month) =>
            navigate({ search: (prev) => ({ ...prev, month }) })
          }
          onCategoryChange={() => {}}
        />

        <nav className="mt-3 flex flex-wrap gap-1">
          {(
            [
              ["hoy", "hoy"],
              ["actividades", "actividades"],
              ["proyectos", "proyectos"],
              ["ajustes", "ajustes"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => navigate({ search: (prev) => ({ ...prev, tab: value }) })}
              className={cn(
                "rounded-md px-2.5 py-1 text-[10px] uppercase tracking-widest transition-colors",
                tab === value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex flex-1 flex-col gap-3 p-4 pb-12">
        {tab === "hoy" && summary && (
          <>
            <LoveopsDuePanel
              activities={summary.dueActivities}
              onLog={openLogSheet}
            />
            <LoveopsReminders
              reminders={summary.reminders}
              onLog={(activityId) => openLogSheet(activityId)}
            />
            <LoveopsWeatherCard
              weather={summary.weather}
              suggestions={summary.weatherSuggestions}
              onLog={openLogSheet}
            />
            <LoveopsFinanceStrip
              availableBalance={summary.finance.availableBalance}
              buckets={summary.buckets}
            />
            <LoveopsSuggestPanel
              month={search.month}
              aiConfigured={Boolean(aiStatusQuery.data?.configured)}
            />
            {summary.recentLogs.length > 0 && (
              <section className="panel px-4 py-3">
                <p className="label-caps mb-2">Reciente</p>
                <div className="flex flex-col gap-2">
                  {summary.recentLogs.map((log) => (
                    <p
                      key={log.id}
                      className="text-[10px] text-muted-foreground uppercase tracking-widest"
                    >
                      {format(log.executedAt, "dd MMM", { locale: es })} · {log.title}
                      {log.notes ? ` · ${log.notes}` : ""}
                    </p>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {tab === "actividades" && activitiesQuery.data && (
          <>
            <LoveopsAddActivity onCreated={refreshLoveops} />
            <LoveopsActivitiesList
              activities={activitiesQuery.data}
              onLog={openLogSheet}
              onEdit={setEditActivity}
              filter="ritual"
            />
            <LoveopsActivitiesList
              activities={activitiesQuery.data}
              onLog={openLogSheet}
              onEdit={setEditActivity}
              filter="micro"
            />
            <LoveopsActivitiesList
              activities={activitiesQuery.data}
              onLog={openLogSheet}
              onEdit={setEditActivity}
              filter="experience"
            />
          </>
        )}

        {tab === "proyectos" && projectsQuery.data && (
          <LoveopsHomeKanban projects={projectsQuery.data} />
        )}

        {tab === "ajustes" && summary && (
          <LoveopsSettingsPanel
            partnerName={summary.settings.partnerName}
            notificationsEnabled={summary.settings.notificationsEnabled}
            reminders={summary.reminders}
            onSaved={refreshLoveops}
          />
        )}
      </main>

      <LoveopsLogSheet
        open={logTarget !== null}
        activity={logTarget}
        month={search.month}
        onClose={() => setLogTarget(null)}
      />
      <LoveopsEditActivitySheet
        activity={editActivity}
        onClose={() => setEditActivity(null)}
        onSaved={refreshLoveops}
      />
    </div>
  )
}
