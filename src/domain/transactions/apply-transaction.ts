import { eq } from "drizzle-orm"
import { db } from "@/db"
import { transactions } from "@/db/schema"
import { convertToUsdCents } from "@/lib/money"
import type { TransactionInput } from "@/domain/types"
import { getLatestRatesRow } from "@/domain/rates/get-latest-rates-row"
import {
  applyBucketFreezeEffect,
  applyBucketReleaseEffect,
  applyDebtPaymentEffect,
} from "./effects"

type DbTx = Parameters<Parameters<typeof db.transaction>[0]>[0]
type RatesRow = NonNullable<Awaited<ReturnType<typeof getLatestRatesRow>>>

function newId() {
  return crypto.randomUUID()
}

export async function applyTransactionInTx(
  tx: DbTx,
  data: TransactionInput,
  ratesRow: RatesRow,
) {
  const rateSnapshot = {
    bcvRate: ratesRow.bcvRate,
    euroBcvRate: ratesRow.euroBcvRate,
    paraleloRate: ratesRow.paraleloRate,
  }

  const usdCents = convertToUsdCents(
    data.originalAmountCents,
    data.originalCurrency,
    rateSnapshot,
    data.matchedRate,
  )

  const id = newId()
  const now = new Date()

  await tx.insert(transactions).values({
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
    await applyDebtPaymentEffect(tx, data.debtId, usdCents)
  }

  if (data.type === "bucket_freeze" && data.bucketId) {
    await applyBucketFreezeEffect(tx, data.bucketId, usdCents)
  }

  if (data.type === "bucket_release" && data.bucketId) {
    await applyBucketReleaseEffect(tx, data.bucketId, usdCents)
  }

  const [created] = await tx
    .select()
    .from(transactions)
    .where(eq(transactions.id, id))
    .limit(1)

  return created
}

export async function applyTransaction(data: TransactionInput) {
  const ratesRow = await getLatestRatesRow()
  if (!ratesRow) {
    throw new Error("No hay tasas activas. Introduce las tasas manualmente.")
  }

  return db.transaction(async (tx) => applyTransactionInTx(tx, data, ratesRow))
}
