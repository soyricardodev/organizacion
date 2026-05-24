import { desc, eq, and, gte, lt } from "drizzle-orm"
import { db } from "@/db"
import {
  exchangeRates,
  transactions,
  buckets,
  debts,
  insights,
} from "@/db/schema"
import {
  fetchRatesFromApi,
  apiResponseToRates,
  manualRatesToActive,
  isRatesStale,
  type ActiveRates,
} from "@/lib/rates"
import {
  convertToUsdCents,
  type CurrencyCode,
  type MatchedRate,
  runwayMonths,
  debtProgressPercent,
  daysUntil,
} from "@/lib/money"
import { MINIMUM_MONTHLY_COST_CENTS, DEBT_TARGET_DATE } from "@/lib/constants"

function newId() {
  return crypto.randomUUID()
}

async function getLatestRatesRow() {
  const [row] = await db
    .select()
    .from(exchangeRates)
    .orderBy(desc(exchangeRates.fetchedAt))
    .limit(1)
  return row ?? null
}

export async function getActiveRatesImpl(): Promise<ActiveRates> {
  const existing = await getLatestRatesRow()
  const apiData = await fetchRatesFromApi()

  if (apiData) {
    const formatted = {
      bcvRate: apiResponseToRates(apiData, "").bcvRate,
      euroBcvRate: apiResponseToRates(apiData, "").euroBcvRate,
      paraleloRate: apiResponseToRates(apiData, "").paraleloRate,
    }

    const unchanged =
      existing &&
      existing.bcvRate === formatted.bcvRate &&
      existing.euroBcvRate === formatted.euroBcvRate &&
      existing.paraleloRate === formatted.paraleloRate &&
      !isRatesStale(existing.fetchedAt)

    if (unchanged) {
      return {
        id: existing.id,
        bcvRate: existing.bcvRate,
        euroBcvRate: existing.euroBcvRate,
        paraleloRate: existing.paraleloRate,
        source: existing.source,
        fetchedAt: existing.fetchedAt,
        stale: false,
        fetchFailed: false,
      }
    }

    const id = newId()
    await db.insert(exchangeRates).values({
      id,
      bcvRate: formatted.bcvRate,
      euroBcvRate: formatted.euroBcvRate,
      paraleloRate: formatted.paraleloRate,
      source: "api",
      fetchedAt: new Date(),
    })
    return {
      id,
      ...formatted,
      source: "api",
      fetchedAt: new Date(),
      stale: false,
      fetchFailed: false,
    }
  }

  if (existing) {
    return {
      id: existing.id,
      bcvRate: existing.bcvRate,
      euroBcvRate: existing.euroBcvRate,
      paraleloRate: existing.paraleloRate,
      source: existing.source,
      fetchedAt: existing.fetchedAt,
      stale: isRatesStale(existing.fetchedAt),
      fetchFailed: true,
    }
  }

  return {
    id: "",
    bcvRate: "0.0000",
    euroBcvRate: "0.0000",
    paraleloRate: "0.0000",
    source: "manual",
    fetchedAt: new Date(0),
    stale: true,
    fetchFailed: true,
  }
}

export async function saveManualRatesImpl(data: {
  bcvRate: string
  euroBcvRate: string
  paraleloRate: string
}) {
  const id = newId()
  const rates = manualRatesToActive(data, id)
  await db.insert(exchangeRates).values({
    id,
    bcvRate: rates.bcvRate,
    euroBcvRate: rates.euroBcvRate,
    paraleloRate: rates.paraleloRate,
    source: "manual",
    fetchedAt: rates.fetchedAt,
  })
  return {
    ...rates,
    stale: false,
    fetchFailed: false,
  } satisfies ActiveRates
}

export async function getTransactionsImpl(data: {
  month: string
  category: "all" | "needs" | "wants" | "savings" | "health" | "debt_payment"
}) {
  const start = new Date(`${data.month}-01T00:00:00`)
  const end = new Date(start)
  end.setMonth(end.getMonth() + 1)

  const conditions = [
    gte(transactions.createdAt, start),
    lt(transactions.createdAt, end),
  ]

  if (data.category !== "all") {
    conditions.push(eq(transactions.category, data.category))
  }

  return db
    .select()
    .from(transactions)
    .where(and(...conditions))
    .orderBy(desc(transactions.createdAt))
}

export async function createTransactionImpl(data: {
  description: string
  originalAmountCents: number
  originalCurrency: "VES" | "USD" | "EUR"
  category: "needs" | "wants" | "savings" | "health" | "debt_payment"
  type:
    | "expense"
    | "income"
    | "transfer"
    | "bucket_freeze"
    | "bucket_release"
    | "debt_payment"
  matchedRate: "bcv" | "euro_bcv" | "paralelo"
  bucketId?: string
  debtId?: string
}) {
  const ratesRow = await getLatestRatesRow()
  if (!ratesRow) {
    throw new Error("No hay tasas activas. Introduce las tasas manualmente.")
  }

  const rateSnapshot = {
    bcvRate: ratesRow.bcvRate,
    euroBcvRate: ratesRow.euroBcvRate,
    paraleloRate: ratesRow.paraleloRate,
  }

  const usdCents = convertToUsdCents(
    data.originalAmountCents,
    data.originalCurrency as CurrencyCode,
    rateSnapshot,
    data.matchedRate as MatchedRate,
  )

  const id = newId()
  const now = new Date()

  await db.insert(transactions).values({
    id,
    description: data.description,
    originalAmountCents: data.originalAmountCents,
    originalCurrency: data.originalCurrency,
    usdCents,
    category: data.category,
    type: data.type,
    bucketId: data.bucketId ?? null,
    debtId: data.debtId ?? null,
    matchedRate: data.matchedRate,
    bcvRate: ratesRow.bcvRate,
    euroBcvRate: ratesRow.euroBcvRate,
    paraleloRate: ratesRow.paraleloRate,
    createdAt: now,
  })

  if (data.type === "debt_payment" && data.debtId) {
    const [debt] = await db
      .select()
      .from(debts)
      .where(eq(debts.id, data.debtId))
      .limit(1)

    if (debt) {
      const newRemaining = Math.max(0, debt.remainingCents - usdCents)
      await db
        .update(debts)
        .set({ remainingCents: newRemaining })
        .where(eq(debts.id, data.debtId))
    }
  }

  if (data.type === "bucket_freeze" && data.bucketId) {
    const [bucket] = await db
      .select()
      .from(buckets)
      .where(eq(buckets.id, data.bucketId))
      .limit(1)

    if (bucket) {
      await db
        .update(buckets)
        .set({ frozenCents: bucket.frozenCents + usdCents })
        .where(eq(buckets.id, data.bucketId))
    }
  }

  const [created] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, id))
    .limit(1)

  return created
}

export async function getBucketsImpl() {
  return db.select().from(buckets).orderBy(buckets.name)
}

export async function getDebtsImpl() {
  const rows = await db.select().from(debts).orderBy(debts.priority)
  return rows.map((debt) => ({
    ...debt,
    progressPercent: debtProgressPercent(debt.totalCents, debt.remainingCents),
    daysRemaining: daysUntil(debt.targetDate),
    dailyRequiredCents:
      daysUntil(debt.targetDate) > 0
        ? Math.ceil(debt.remainingCents / daysUntil(debt.targetDate))
        : debt.remainingCents,
  }))
}

export async function getDashboardSummaryImpl(data: { month: string }) {
  const start = new Date(`${data.month}-01T00:00:00`)
  const end = new Date(start)
  end.setMonth(end.getMonth() + 1)

  const monthTransactions = await db
    .select()
    .from(transactions)
    .where(
      and(
        gte(transactions.createdAt, start),
        lt(transactions.createdAt, end),
        eq(transactions.type, "expense"),
      ),
    )

  const spendingByCategory = monthTransactions.reduce(
    (acc, tx) => {
      acc[tx.category] = (acc[tx.category] ?? 0) + tx.usdCents
      return acc
    },
    {} as Record<string, number>,
  )

  const totalSpent = monthTransactions.reduce((sum, tx) => sum + tx.usdCents, 0)

  const bucketRows = await db.select().from(buckets)
  const emergency = bucketRows.find((b) => b.slug === "emergency")
  const runway = runwayMonths(
    emergency?.frozenCents ?? 0,
    MINIMUM_MONTHLY_COST_CENTS,
  )

  const debtRows = await db.select().from(debts)
  const totalDebtRemaining = debtRows.reduce(
    (sum, d) => sum + d.remainingCents,
    0,
  )
  const totalDebtOriginal = debtRows.reduce((sum, d) => sum + d.totalCents, 0)

  return {
    spendingByCategory,
    totalSpent,
    runway,
    emergencyCents: emergency?.frozenCents ?? 0,
    minimumMonthlyCostCents: MINIMUM_MONTHLY_COST_CENTS,
    debtTargetDate: DEBT_TARGET_DATE,
    totalDebtRemaining,
    totalDebtOriginal,
    debtProgressPercent: debtProgressPercent(
      totalDebtOriginal,
      totalDebtRemaining,
    ),
    daysToDebtTarget: daysUntil(DEBT_TARGET_DATE),
  }
}

export async function getLatestInsightImpl(data: { weekStart: string }) {
  const [row] = await db
    .select()
    .from(insights)
    .where(eq(insights.weekStart, data.weekStart))
    .orderBy(desc(insights.createdAt))
    .limit(1)
  return row ?? null
}

export async function freezeToBucketImpl(data: {
  bucketId: string
  usdCents: number
  description: string
}) {
  const ratesRow = await getLatestRatesRow()
  if (!ratesRow) {
    throw new Error("No hay tasas activas. Introduce las tasas manualmente.")
  }

  const id = newId()
  const now = new Date()

  await db.insert(transactions).values({
    id,
    description: data.description,
    originalAmountCents: data.usdCents,
    originalCurrency: "USD",
    usdCents: data.usdCents,
    category: "savings",
    type: "bucket_freeze",
    bucketId: data.bucketId,
    debtId: null,
    matchedRate: "bcv",
    bcvRate: ratesRow.bcvRate,
    euroBcvRate: ratesRow.euroBcvRate,
    paraleloRate: ratesRow.paraleloRate,
    createdAt: now,
  })

  const [bucket] = await db
    .select()
    .from(buckets)
    .where(eq(buckets.id, data.bucketId))
    .limit(1)

  if (bucket) {
    await db
      .update(buckets)
      .set({ frozenCents: bucket.frozenCents + data.usdCents })
      .where(eq(buckets.id, data.bucketId))
  }

  const [created] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, id))
    .limit(1)

  return created
}
