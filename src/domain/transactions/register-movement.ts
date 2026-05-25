import { db } from "@/db"
import type { RegisterMovementInput } from "@/domain/types"
import { shouldFreezeInBucket } from "@/domain/types"
import { getLatestRatesRow } from "@/domain/rates/get-latest-rates-row"
import { applyTransactionInTx } from "./apply-transaction"
import { resolveEffectiveType } from "./resolve-effective-type"

function toMainTransaction(data: RegisterMovementInput) {
  const { freezeInBucketId: _freeze, ...main } = data
  return {
    ...main,
    type: resolveEffectiveType(main),
  }
}

function isSavingsAllocation(data: RegisterMovementInput) {
  return (
    shouldFreezeInBucket(data) &&
    data.type === "expense" &&
    data.category === "savings"
  )
}

export async function registerMovement(data: RegisterMovementInput) {
  const ratesRow = await getLatestRatesRow()
  if (!ratesRow) {
    throw new Error("No hay tasas activas. Introduce las tasas manualmente.")
  }

  if (isSavingsAllocation(data) && data.freezeInBucketId) {
    return db.transaction(async (tx) =>
      applyTransactionInTx(
        tx,
        {
          description: data.description,
          originalAmountCents: data.originalAmountCents,
          originalCurrency: data.originalCurrency,
          category: "savings",
          type: "bucket_freeze",
          matchedRate: data.matchedRate,
          bucketId: data.freezeInBucketId,
        },
        ratesRow,
      ),
    )
  }

  const mainData = toMainTransaction(data)

  return db.transaction(async (tx) => {
    const main = await applyTransactionInTx(tx, mainData, ratesRow)

    if (shouldFreezeInBucket(data) && data.type === "income" && data.freezeInBucketId) {
      await applyTransactionInTx(
        tx,
        {
          description: `Apartado · ${data.description}`,
          originalAmountCents: data.originalAmountCents,
          originalCurrency: data.originalCurrency,
          category: "savings",
          type: "bucket_freeze",
          matchedRate: data.matchedRate,
          bucketId: data.freezeInBucketId,
        },
        ratesRow,
      )
    }

    return main
  })
}
