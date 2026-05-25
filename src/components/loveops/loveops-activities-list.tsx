import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/dashboard/panel"
import {
  LOVE_CATEGORY_LABELS,
  LOVE_COST_LABELS,
} from "@/domain/loveops/types"
import type { EnrichedLoveActivity } from "@/domain/loveops/get-activities"

interface LoveopsActivitiesListProps {
  activities: EnrichedLoveActivity[]
  onLog: (activityId: string) => void
  onEdit?: (activity: EnrichedLoveActivity) => void
  filter?: "all" | "ritual" | "micro" | "experience"
  title?: string
}

const FILTER_TITLES: Record<NonNullable<LoveopsActivitiesListProps["filter"]>, string> = {
  all: "Actividades",
  ritual: "Rituales",
  micro: "Micro momentos",
  experience: "Experiencias",
}

export function LoveopsActivitiesList({
  activities,
  onLog,
  onEdit,
  filter = "all",
  title,
}: LoveopsActivitiesListProps) {
  const filtered =
    filter === "all"
      ? activities
      : activities.filter((activity) => activity.category === filter)

  if (filtered.length === 0) return null

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>{title ?? FILTER_TITLES[filter]}</PanelTitle>
        <span className="text-[10px] text-muted-foreground">{filtered.length}</span>
      </PanelHeader>
      <PanelBody className="flex flex-col divide-y divide-border p-0">
        {filtered.map((activity) => (
          <div key={activity.id} className="flex flex-col gap-2 px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs">{activity.title}</p>
                <p className="mt-1 text-[10px] text-muted-foreground uppercase tracking-widest">
                  {LOVE_CATEGORY_LABELS[activity.category]} ·{" "}
                  {LOVE_COST_LABELS[activity.costEstimation]} · cada{" "}
                  {activity.frequencyDaysTarget}d
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={() => onLog(activity.id)}
                  className="text-[10px] uppercase tracking-widest underline-offset-2 hover:underline"
                >
                  hecho
                </button>
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(activity)}
                    className="text-[10px] uppercase tracking-widest text-muted-foreground underline-offset-2 hover:underline"
                  >
                    editar
                  </button>
                )}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground tabular-nums uppercase tracking-widest">
              {activity.lastExecutedAt
                ? `Última: ${format(activity.lastExecutedAt, "dd MMM", { locale: es })}`
                : "Nunca registrada"}
              {activity.isDue ? ` · ${activity.daysOverdue}d de retraso` : ""}
            </p>
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}
