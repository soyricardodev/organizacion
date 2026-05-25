import { applyTransaction } from "./apply-transaction"
import type { BucketOperationInput } from "./bucket-operation-schemas"

export async function allocateToBucket(data: BucketOperationInput) {
  return applyTransaction({
    description: data.description,
    originalAmountCents: data.originalAmountCents,
    originalCurrency: data.originalCurrency,
    category: "savings",
    type: "bucket_freeze",
    matchedRate: data.matchedRate,
    bucketId: data.bucketId,
  })
}
