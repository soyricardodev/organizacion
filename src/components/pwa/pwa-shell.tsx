import { useEffect, useState } from "react"
import { Download, RefreshCw, WifiOff, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  PWA_NEED_REFRESH,
  PWA_OFFLINE_READY,
} from "@/lib/pwa/events"
import { applyServiceWorkerUpdate } from "@/lib/pwa/update-sw"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function isStandalone() {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  )
}

function isIosSafari() {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream
}

export function PwaShell() {
  const [mounted, setMounted] = useState(false)
  const [needRefresh, setNeedRefresh] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showIosHint, setShowIosHint] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    function onNeedRefresh() {
      setNeedRefresh(true)
    }

    function onOfflineReady() {
      setOfflineReady(true)
    }

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    function onInstalled() {
      setInstallPrompt(null)
      setShowIosHint(false)
    }

    window.addEventListener(PWA_NEED_REFRESH, onNeedRefresh)
    window.addEventListener(PWA_OFFLINE_READY, onOfflineReady)
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    window.addEventListener("appinstalled", onInstalled)

    return () => {
      window.removeEventListener(PWA_NEED_REFRESH, onNeedRefresh)
      window.removeEventListener(PWA_OFFLINE_READY, onOfflineReady)
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [mounted])

  if (!mounted) return null

  async function handleInstall() {
    if (installPrompt) {
      await installPrompt.prompt()
      await installPrompt.userChoice
      setInstallPrompt(null)
      return
    }

    if (isIosSafari() && !isStandalone()) {
      setShowIosHint(true)
    }
  }

  function dismissBanner() {
    setNeedRefresh(false)
    setOfflineReady(false)
    setShowIosHint(false)
  }

  const showInstall =
    !isStandalone() && (installPrompt !== null || isIosSafari())

  if (!needRefresh && !offlineReady && !showInstall && !showIosHint) {
    return null
  }

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 flex flex-col gap-2 px-4 pb-[env(safe-area-inset-bottom)]">
      {offlineReady && (
        <div className="flex items-center gap-3 rounded-md border border-border bg-background/95 p-3 backdrop-blur-sm">
          <WifiOff className="size-4 shrink-0 text-muted-foreground" />
          <p className="flex-1 text-xs text-muted-foreground">
            Lista para usar sin conexión.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={dismissBanner}
            aria-label="Cerrar"
          >
            <X />
          </Button>
        </div>
      )}

      {needRefresh && (
        <div className="flex items-center gap-3 rounded-md border border-border bg-background/95 p-3 backdrop-blur-sm">
          <RefreshCw className="size-4 shrink-0 text-muted-foreground" />
          <p className="flex-1 text-xs">Nueva versión disponible.</p>
          <Button
            type="button"
            size="xs"
            onClick={() => void applyServiceWorkerUpdate()}
          >
            actualizar
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={dismissBanner}
            aria-label="Cerrar"
          >
            <X />
          </Button>
        </div>
      )}

      {showInstall && !needRefresh && (
        <div className="flex items-center gap-3 rounded-md border border-border bg-background/95 p-3 backdrop-blur-sm">
          <Download className="size-4 shrink-0 text-muted-foreground" />
          <p className="flex-1 text-xs text-muted-foreground">
            {showIosHint
              ? "En Safari: Compartir → Añadir a pantalla de inicio."
              : "Instala la app en tu dispositivo."}
          </p>
          {!showIosHint && (
            <Button type="button" size="xs" onClick={() => void handleInstall()}>
              instalar
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={dismissBanner}
            aria-label="Cerrar"
          >
            <X />
          </Button>
        </div>
      )}
    </div>
  )
}
