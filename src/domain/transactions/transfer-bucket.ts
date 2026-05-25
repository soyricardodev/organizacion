import { db } from "@/db"
import { getLatestRatesRow } from "@/domain/rates/get-latest-rates-row"
import { applyTransactionInTx } from "./apply-transaction"
import type { BucketTransferInput } from "./bucket-operation-schemas"

export async function transferBetweenBuckets(data: BucketTransferInput) {
  const ratesRow = await getLatestRatesRow()
  if (!ratesRow) {
    throw new Error("No hay tasas activas. Introduce las tasas manualmente.")
  }

  return db.transaction(async (tx) => {
    await applyTransactionInTx(
      tx,
      {
        description: `Transfer · ${data.description}`,
        originalAmountCents: data.originalAmountCents,
        originalCurrency: data.originalCurrency,
        category: "savings",
        type: "bucket_release",
        matchedRate: data.matchedRate,
        bucketId: data.bucketId,
      },
      ratesRow,
    )

    return applyTransactionInTx(
      tx,
      {
        description: `Transfer · ${data.description}`,
        originalAmountCents: data.originalAmountCents,
        originalCurrency: data.originalCurrency,
        category: "savings",
        type: "bucket_freeze",
        matchedRate: data.matchedRate,
        bucketId: data.toBucketId,
      },
      ratesRow,
    )
  })
}
