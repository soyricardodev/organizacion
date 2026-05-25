const LAST_NOTIFY_KEY = "organizacion:loveops:last-notify"

export type LoveopsNotifyPermission =
  | "unsupported"
  | "denied"
  | "default"
  | "granted"

export function canSendLoveopsNotification() {
  if (typeof window === "undefined") return false
  const last = localStorage.getItem(LAST_NOTIFY_KEY)
  const today = new Date().toISOString().slice(0, 10)
  return last !== today
}

export function markLoveopsNotificationSent() {
  if (typeof window === "undefined") return
  localStorage.setItem(LAST_NOTIFY_KEY, new Date().toISOString().slice(0, 10))
}

export function getLoveopsNotifyPermission(): LoveopsNotifyPermission {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported"
  }
  return Notification.permission as LoveopsNotifyPermission
}

export async function getLoveopsServiceWorkerRegistration() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null
  }
  try {
    return await navigator.serviceWorker.ready
  } catch {
    return null
  }
}

export async function requestNotificationPermission(): Promise<LoveopsNotifyPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported"
  }
  if (Notification.permission === "granted") return "granted"
  if (Notification.permission === "denied") return "denied"
  const result = await Notification.requestPermission()
  return result as LoveopsNotifyPermission
}

interface LoveopsReminderPayload {
  title: string
  body: string
  url?: string
}

async function showViaServiceWorker(
  registration: ServiceWorkerRegistration,
  payload: LoveopsReminderPayload,
) {
  const message = {
    type: "LOVEOPS_REMINDER" as const,
    title: payload.title,
    body: payload.body,
    url: payload.url ?? "/loveops",
  }

  if (registration.active) {
    registration.active.postMessage(message)
    return
  }

  await registration.showNotification(payload.title, {
    body: payload.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: "loveops-reminder",
    data: { url: payload.url ?? "/loveops" },
  })
}

export async function notifyLoveopsReminder(
  title: string,
  body: string,
  url = "/loveops",
) {
  if (typeof window === "undefined" || !("Notification" in window)) return false
  if (Notification.permission !== "granted") return false
  if (!canSendLoveopsNotification()) return false

  const payload = { title, body, url }
  const registration = await getLoveopsServiceWorkerRegistration()

  if (registration) {
    await showViaServiceWorker(registration, payload)
    markLoveopsNotificationSent()
    return true
  }

  new Notification(title, {
    body,
    icon: "/icons/icon-192.png",
    tag: "loveops-reminder",
  })
  markLoveopsNotificationSent()
  return true
}

export async function sendTestLoveopsNotification(body: string) {
  return notifyLoveopsReminder("LoveOps", body, "/loveops")
}

export function loveopsPermissionLabel(permission: LoveopsNotifyPermission) {
  switch (permission) {
    case "granted":
      return "Permiso concedido — push vía service worker"
    case "denied":
      return "Bloqueado en el navegador"
    case "default":
      return "Sin permiso aún"
    case "unsupported":
      return "No soportado en este navegador"
  }
}
