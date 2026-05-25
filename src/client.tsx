import { StartClient } from "@tanstack/react-start/client"
import { StrictMode } from "react"
import { hydrateRoot } from "react-dom/client"
import { registerSW } from "virtual:pwa-register"
import {
  dispatchPwaNeedRefresh,
  dispatchPwaOfflineReady,
} from "@/lib/pwa/events"
import { setUpdateServiceWorker } from "@/lib/pwa/update-sw"

if ("serviceWorker" in navigator) {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh: dispatchPwaNeedRefresh,
    onOfflineReady: dispatchPwaOfflineReady,
  })
  setUpdateServiceWorker(updateSW)
}

hydrateRoot(
  document,
  <StrictMode>
    <StartClient />
  </StrictMode>,
)
