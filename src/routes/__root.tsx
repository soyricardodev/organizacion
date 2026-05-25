import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import type { QueryClient } from "@tanstack/react-query"

import appCss from "../styles.css?url"
import { QueryProvider } from "@/components/providers/query-provider"
import { PwaShell } from "@/components/pwa/pwa-shell"

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, viewport-fit=cover",
        },
        { title: "organización" },
        { name: "description", content: "Finanzas y LoveOps — economía venezolana" },
        { name: "theme-color", content: "#0a0a0a" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "black-translucent",
        },
        { name: "mobile-web-app-capable", content: "yes" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        { rel: "icon", href: "/icons/icon-192.png", type: "image/png" },
      ],
    }),
    component: RootComponent,
    notFoundComponent: () => (
      <main className="container mx-auto p-4 pt-16">
        <h1>404</h1>
        <p>La página solicitada no existe.</p>
      </main>
    ),
    shellComponent: RootDocument,
  },
)

function RootComponent() {
  const { queryClient } = Route.useRouteContext()
  return (
    <QueryProvider client={queryClient}>
      <Outlet />
      <PwaShell />
    </QueryProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-svh antialiased">
        {children}
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
