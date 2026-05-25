const LAST_NOTIFY_KEY = "organizacion:loveops:last-notify"

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

export async function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported" as const
  }
  if (Notification.permission === "granted") return "granted" as const
  if (Notification.permission === "denied") return "denied" as const
  const result = await Notification.requestPermission()
  return result
}

export function notifyLoveopsReminder(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return false
  if (Notification.permission !== "granted") return false
  if (!canSendLoveopsNotification()) return false

  new Notification(title, {
    body,
    icon: "/icons/icon-192.png",
    tag: "loveops-reminder",
  })
  markLoveopsNotificationSent()
  return true
}
