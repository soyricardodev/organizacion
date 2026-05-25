import { applyTransaction } from "./apply-transaction"
import type { BucketOperationInput } from "./bucket-operation-schemas"

export async function releaseFromBucket(data: BucketOperationInput) {
  return applyTransaction({
    description: data.description,
    originalAmountCents: data.originalAmountCents,
    originalCurrency: data.originalCurrency,
    category: "savings",
    type: "bucket_release",
    matchedRate: data.matchedRate,
    bucketId: data.bucketId,
  })
}
