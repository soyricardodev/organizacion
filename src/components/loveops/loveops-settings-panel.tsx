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
  getLoveopsNotifyPermission,
  getLoveopsServiceWorkerRegistration,
  loveopsPermissionLabel,
  requestNotificationPermission,
  sendTestLoveopsNotification,
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
  const [pushPending, setPushPending] = useState(false)
  const [permission, setPermission] = useState(getLoveopsNotifyPermission())
  const [swReady, setSwReady] = useState(false)
  const [notifyStatus, setNotifyStatus] = useState<string | null>(null)

  useEffect(() => {
    setName(partnerName)
    setNotify(notificationsEnabled)
  }, [partnerName, notificationsEnabled])

  useEffect(() => {
    setPermission(getLoveopsNotifyPermission())
    getLoveopsServiceWorkerRegistration().then((registration) => {
      setSwReady(Boolean(registration))
    })
  }, [])

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

  async function handleEnablePush() {
    setPushPending(true)
    setNotifyStatus(null)
    try {
      const nextPermission = await requestNotificationPermission()
      setPermission(nextPermission)

      if (nextPermission === "denied") {
        setNotifyStatus("Permiso denegado — revisa ajustes del sitio en el navegador")
        return
      }
      if (nextPermission === "unsupported") {
        setNotifyStatus("Este navegador no soporta notificaciones")
        return
      }

      const registration = await getLoveopsServiceWorkerRegistration()
      setSwReady(Boolean(registration))

      const testBody =
        reminders[0]?.message ??
        `Recordatorio de prueba para ${name.trim() || "tu pareja"}`

      const sent = await sendTestLoveopsNotification(testBody)
      if (sent) {
        setNotifyStatus("Push activo vía service worker — prueba enviada")
      } else {
        setNotifyStatus("Permiso ok, pero no se pudo enviar (máx. 1/día o SW pendiente)")
      }
    } finally {
      setPushPending(false)
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
              Recordatorios al abrir la app (1/día si hay crítico)
            </label>
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "…" : "guardar ajustes"}
            </Button>
          </FieldGroup>
        </form>
        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            web push (pwa)
          </p>
          <p className="text-[10px] text-muted-foreground">
            {loveopsPermissionLabel(permission)}
            {swReady ? " · SW listo" : " · SW cargando…"}
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={pushPending || permission === "denied"}
            onClick={handleEnablePush}
          >
            {pushPending ? "…" : "activar push y probar"}
          </Button>
          {notifyStatus && (
            <p className="text-[10px] text-muted-foreground">{notifyStatus}</p>
          )}
          <p className="text-[10px] text-muted-foreground">
            Funciona con la app instalada o en segundo plano. Al tocar la notificación abre
            LoveOps.
          </p>
        </div>
      </PanelBody>
    </Panel>
  )
}
