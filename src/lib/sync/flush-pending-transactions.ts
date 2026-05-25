import {
  allocateToBucket,
  createTransaction,
  releaseFromBucket,
  transferBetweenBuckets,
} from "@/server/finance"
import {
  getPendingQueue,
  removePendingItem,
  type PendingQueueItem,
} from "@/lib/offline-queue"
import { buildTransactionPayload } from "@/domain/transactions/build-transaction-payload"

async function syncQueueItem(item: PendingQueueItem) {
  switch (item.kind) {
    case "movement":
      await createTransaction({ data: buildTransactionPayload(item) })
      break
    case "allocate": {
      const { kind: _kind, id: _id, enqueuedAt: _at, ...data } = item
      await allocateToBucket({ data })
      break
    }
    case "release": {
      const { kind: _kind, id: _id, enqueuedAt: _at, ...data } = item
      await releaseFromBucket({ data })
      break
    }
    case "transfer": {
      const { kind: _kind, id: _id, enqueuedAt: _at, ...data } = item
      await transferBetweenBuckets({ data })
      break
    }
  }
}

export async function flushPendingTransactions() {
  if (typeof navigator !== "undefined" && !navigator.onLine) return 0

  const pending = getPendingQueue()
  if (pending.length === 0) return 0

  let synced = 0

  for (const item of pending) {
    try {
      await syncQueueItem(item)
      removePendingItem(item.id)
      synced += 1
    } catch {
      break
    }
  }

  return synced
}
