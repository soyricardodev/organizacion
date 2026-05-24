import {
  USD,
  VES,
  EUR,
  dinero,
  subtract,
  toDecimal,
  toSnapshot,
} from "dinero.js"
import type { Currency, MatchedRate } from "@/domain/types"

export type CurrencyCode = Currency
export type { MatchedRate }

export interface RateSnapshot {
  bcvRate: string
  euroBcvRate: string
  paraleloRate: string
}

const CURRENCY_MAP = {
  USD,
  VES,
  EUR,
} as const

export function moneyFromCents(cents: number, currency: CurrencyCode = "USD") {
  return dinero({ amount: cents, currency: CURRENCY_MAP[currency] })
}

export function formatUsd(cents: number): string {
  const d = moneyFromCents(cents, "USD")
  return `$${toDecimal(d)}`
}

export function formatUsdCompact(cents: number): string {
  const value = cents / 100
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
  return formatUsd(cents)
}

export function parseAmountToCents(input: string | number): number {
  const normalized =
    typeof input === "number" ? input : Number.parseFloat(input.replace(",", "."))
  if (Number.isNaN(normalized)) return 0
  return Math.round(normalized * 100)
}

export function rateToNumber(rate: string): number {
  return Number.parseFloat(rate)
}

/** Convierte un monto en moneda original a centavos USD usando la tasa indicada */
export function convertToUsdCents(
  amountCents: number,
  currency: CurrencyCode,
  rates: RateSnapshot,
  matchedRate: MatchedRate,
): number {
  if (currency === "USD") return amountCents

  const rateValue =
    matchedRate === "bcv"
      ? rateToNumber(rates.bcvRate)
      : matchedRate === "euro_bcv"
        ? rateToNumber(rates.euroBcvRate)
        : rateToNumber(rates.paraleloRate)

  if (rateValue <= 0) return 0

  const amountUnits = amountCents / 100
  const usdUnits = amountUnits / rateValue
  return Math.round(usdUnits * 100)
}

export function subtractCents(a: number, b: number): number {
  return toSnapshot(subtract(moneyFromCents(a), moneyFromCents(b))).amount
}

export function runwayMonths(
  emergencyCents: number,
  minimumMonthlyCostCents: number,
): { months: number; days: number } {
  if (minimumMonthlyCostCents <= 0) return { months: 0, days: 0 }
  const totalDays = Math.floor(
    (emergencyCents / minimumMonthlyCostCents) * 30,
  )
  const months = Math.floor(totalDays / 30)
  const days = totalDays % 30
  return { months, days }
}

export function debtProgressPercent(
  totalCents: number,
  remainingCents: number,
): number {
  if (totalCents <= 0) return 100
  const paid = subtractCents(totalCents, remainingCents)
  return Math.min(100, Math.round((paid / totalCents) * 100))
}

export function daysUntil(dateIso: string): number {
  const target = new Date(dateIso)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function weeklyProrate(
  targetCents: number,
  frozenCents: number,
): { current: number; target: number; percent: number } {
  const remaining = subtractCents(targetCents, frozenCents)
  const weeklyTarget = Math.ceil(targetCents / 10)
  const currentWeekProgress = Math.min(
    weeklyTarget,
    Math.max(0, weeklyTarget - remaining),
  )
  return {
    current: currentWeekProgress,
    target: weeklyTarget,
    percent:
      weeklyTarget > 0
        ? Math.round((currentWeekProgress / weeklyTarget) * 100)
        : 0,
  }
}
