/** Costo de vida mínimo mensual en centavos USD para el indicador de runway */
export const MINIMUM_MONTHLY_COST_CENTS = 450_00

/** Meta de deuda global (14 de julio) */
export const DEBT_TARGET_DATE = "2026-07-14"

/** Regla 60/20/20 */
export const BUDGET_RULE = {
  needs: 0.6,
  wants: 0.2,
  savings: 0.2,
} as const

export const CATEGORIES = [
  "needs",
  "wants",
  "savings",
  "health",
  "debt_payment",
] as const

export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_LABELS: Record<Category, string> = {
  needs: "Necesidades",
  wants: "Deseos",
  savings: "Ahorro",
  health: "Salud",
  debt_payment: "Abono deuda",
}
