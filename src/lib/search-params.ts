import { format } from "date-fns"
import { z } from "zod"
import { filterCategorySchema } from "@/domain/types"

export const dashboardSearchSchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .default(format(new Date(), "yyyy-MM")),
  category: filterCategorySchema.default("all"),
  view: z.enum(["overview", "transactions", "add"]).default("overview"),
})

export type DashboardSearch = z.infer<typeof dashboardSearchSchema>

export const defaultDashboardSearch: DashboardSearch = {
  month: format(new Date(), "yyyy-MM"),
  category: "all",
  view: "overview",
}
