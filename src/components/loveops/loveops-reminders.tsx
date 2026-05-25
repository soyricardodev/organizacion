import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/dashboard/panel"
import { cn } from "@/lib/utils"
import type { LoveReminder } from "@/domain/loveops/get-reminders"

interface LoveopsRemindersProps {
  reminders: LoveReminder[]
  onLog?: (activityId: string) => void
}

export function LoveopsReminders({ reminders, onLog }: LoveopsRemindersProps) {
  if (reminders.length === 0) {
    return (
      <Panel>
        <PanelHeader>
          <PanelTitle>Recordatorios</PanelTitle>
        </PanelHeader>
        <PanelBody>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Al día en conexión — sigue así.
          </p>
        </PanelBody>
      </Panel>
    )
  }

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Recordatorios</PanelTitle>
        <span className="text-[10px] text-muted-foreground">{reminders.length}</span>
      </PanelHeader>
      <PanelBody className="flex flex-col divide-y divide-border p-0">
        {reminders.map((reminder) => (
          <div key={reminder.id} className="flex flex-col gap-2 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "text-[10px] uppercase tracking-widest",
                  reminder.severity === "critical" && "text-red-600 dark:text-red-400",
                  reminder.severity === "warning" && "text-amber-600 dark:text-amber-400",
                  reminder.severity === "info" && "text-muted-foreground",
                )}
              >
                {reminder.title}
              </span>
              {reminder.activityId && onLog && (
                <button
                  type="button"
                  onClick={() => onLog(reminder.activityId!)}
                  className="text-[10px] uppercase tracking-widest text-foreground underline-offset-2 hover:underline"
                >
                  hecho
                </button>
              )}
            </div>
            <p className="text-xs leading-relaxed">{reminder.message}</p>
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}
