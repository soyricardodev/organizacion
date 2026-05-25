self.addEventListener("message", (event) => {
  const data = event.data
  if (!data || data.type !== "LOVEOPS_REMINDER") return

  event.waitUntil(
    self.registration.showNotification(data.title || "LoveOps", {
      body: data.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: "loveops-reminder",
      data: { url: data.url || "/loveops" },
    }),
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || "/loveops"
  const absoluteUrl = new URL(targetUrl, self.location.origin).href

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if (client.url.startsWith(self.location.origin) && "focus" in client) {
            return client.focus()
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(absoluteUrl)
        }
      }),
  )
})

self.addEventListener("push", (event) => {
  if (!event.data) return

  let payload = { title: "LoveOps", body: "", url: "/loveops" }
  try {
    payload = { ...payload, ...event.data.json() }
  } catch {
    payload.body = event.data.text()
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: payload.url || "/loveops" },
    }),
  )
})
