import { useState } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister"
import type { QueryClient } from "@tanstack/react-query"
import { OfflineSync } from "@/components/dashboard/offline-sync"

interface QueryProviderProps {
  client: QueryClient
  children: React.ReactNode
}

export function QueryProvider({ client, children }: QueryProviderProps) {
  const [persister] = useState(() => {
    if (typeof window === "undefined") return null
    return createAsyncStoragePersister({
      storage: window.localStorage,
      key: "organizacion-query-cache",
    })
  })

  if (!persister) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
  }

  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{
        persister,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => query.state.status === "success",
        },
      }}
    >
      {children}
      <OfflineSync />
    </PersistQueryClientProvider>
  )
}
