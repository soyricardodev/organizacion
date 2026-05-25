import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/dashboard/panel"
import { saveLoveSettings } from "@/server/loveops"
import {
  notifyLoveopsReminder,
  requestNotificationPermission,
} from "@/lib/loveops-notifications"
import type { LoveReminder } from "@/domain/loveops/get-reminders"

interface LoveopsSettingsPanelProps {
  partnerName: string
  notificationsEnabled: boolean
  reminders: LoveReminder[]
  onSaved: () => void
}

export function LoveopsSettingsPanel({
  partnerName,
  notificationsEnabled,
  reminders,
  onSaved,
}: LoveopsSettingsPanelProps) {
  const [name, setName] = useState(partnerName)
  const [notify, setNotify] = useState(notificationsEnabled)
  const [pending, setPending] = useState(false)
  const [notifyStatus, setNotifyStatus] = useState<string | null>(null)

  useEffect(() => {
    setName(partnerName)
    setNotify(notificationsEnabled)
  }, [partnerName, notificationsEnabled])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    try {
      await saveLoveSettings({
        data: { partnerName: name.trim(), notificationsEnabled: notify },
      })
      onSaved()
    } finally {
      setPending(false)
    }
  }

  async function handleEnableNotifications() {
    const permission = await requestNotificationPermission()
    if (permission === "granted" && reminders[0]) {
      notifyLoveopsReminder("LoveOps", reminders[0].message)
      setNotifyStatus("Notificaciones activas")
    } else if (permission === "denied") {
      setNotifyStatus("Permiso denegado en el navegador")
    } else if (permission === "unsupported") {
      setNotifyStatus("Este navegador no soporta notificaciones")
    }
  }

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Ajustes</PanelTitle>
      </PanelHeader>
      <PanelBody>
        <form onSubmit={handleSave}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="partner-name" className="label-caps">
                nombre
              </FieldLabel>
              <Input
                id="partner-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={notify}
                onChange={(e) => setNotify(e.target.checked)}
              />
              Recordatorios en la app
            </label>
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "…" : "guardar ajustes"}
            </Button>
          </FieldGroup>
        </form>
        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            notificaciones del sistema
          </p>
          <Button type="button" variant="outline" onClick={handleEnableNotifications}>
            activar push
          </Button>
          {notifyStatus && (
            <p className="text-[10px] text-muted-foreground">{notifyStatus}</p>
          )}
        </div>
      </PanelBody>
    </Panel>
  )
}
