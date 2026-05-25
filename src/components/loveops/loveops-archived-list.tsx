import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/dashboard/panel"
import type { EnrichedLoveActivity } from "@/domain/loveops/get-activities"

interface LoveopsArchivedListProps {
  activities: EnrichedLoveActivity[]
  onEdit: (activity: EnrichedLoveActivity) => void
}

export function LoveopsArchivedList({ activities, onEdit }: LoveopsArchivedListProps) {
  if (activities.length === 0) return null

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Archivadas</PanelTitle>
        <span className="text-[10px] text-muted-foreground">{activities.length}</span>
      </PanelHeader>
      <PanelBody className="flex flex-col divide-y divide-border p-0">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between gap-2 px-4 py-3"
          >
            <p className="truncate text-xs text-muted-foreground">{activity.title}</p>
            <button
              type="button"
              onClick={() => onEdit(activity)}
              className="shrink-0 text-[10px] uppercase tracking-widest underline-offset-2 hover:underline"
            >
              editar
            </button>
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}
