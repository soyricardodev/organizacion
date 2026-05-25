export const PWA_NEED_REFRESH = "organizacion:pwa-need-refresh"
export const PWA_OFFLINE_READY = "organizacion:pwa-offline-ready"

export function dispatchPwaNeedRefresh() {
  window.dispatchEvent(new Event(PWA_NEED_REFRESH))
}

export function dispatchPwaOfflineReady() {
  window.dispatchEvent(new Event(PWA_OFFLINE_READY))
}
