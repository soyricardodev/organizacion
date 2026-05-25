import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/dashboard/panel"
import type { EnrichedLoveActivity } from "@/domain/loveops/get-activities"

interface LoveopsDuePanelProps {
  activities: EnrichedLoveActivity[]
  onLog: (activityId: string) => void
}

export function LoveopsDuePanel({ activities, onLog }: LoveopsDuePanelProps) {
  const due = activities.filter((a) => a.isDue).slice(0, 5)
  if (due.length === 0) return null

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Pendientes</PanelTitle>
        <span className="text-[10px] text-muted-foreground">{due.length}</span>
      </PanelHeader>
      <PanelBody className="flex flex-col divide-y divide-border p-0">
        {due.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between gap-2 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-xs">{activity.title}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                {activity.daysOverdue}d de retraso
              </p>
            </div>
            <button
              type="button"
              onClick={() => onLog(activity.id)}
              className="shrink-0 text-[10px] uppercase tracking-widest underline-offset-2 hover:underline"
            >
              hecho
            </button>
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}
