import { createFileRoute, redirect } from "@tanstack/react-router"
import { defaultDashboardSearch } from "@/lib/search-params"

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({
      to: "/dashboard",
      search: defaultDashboardSearch,
    })
  },
})
