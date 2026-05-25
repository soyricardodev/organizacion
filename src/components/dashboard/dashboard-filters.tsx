import { addMonths, format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CATEGORY_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { FilterCategory } from "@/domain/types"

const FILTER_ITEMS: { value: FilterCategory; label: string }[] = [
  { value: "all", label: "todos" },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value: value as FilterCategory,
    label: label.toLowerCase(),
  })),
]

interface DashboardFiltersProps {
  month: string
  category: FilterCategory
  showCategoryFilter: boolean
  onMonthChange: (month: string) => void
  onCategoryChange: (category: FilterCategory) => void
}

export function DashboardFilters({
  month,
  category,
  showCategoryFilter,
  onMonthChange,
  onCategoryChange,
}: DashboardFiltersProps) {
  const monthDate = parseISO(`${month}-01`)
  const monthLabel = format(monthDate, "MMM yyyy", { locale: es })

  function shiftMonth(delta: number) {
    onMonthChange(format(addMonths(monthDate, delta), "yyyy-MM"))
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => shiftMonth(-1)}
          aria-label="Mes anterior"
        >
          <ChevronLeft />
        </Button>
        <span className="text-[10px] uppercase tracking-widest tabular-nums">
          {monthLabel}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => shiftMonth(1)}
          aria-label="Mes siguiente"
        >
          <ChevronRight />
        </Button>
      </div>

      {showCategoryFilter && (
        <div className="flex flex-wrap gap-1">
          {FILTER_ITEMS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onCategoryChange(item.value)}
              className={cn(
                "rounded-md px-2 py-1 text-[10px] uppercase tracking-widest transition-colors",
                category === item.value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
