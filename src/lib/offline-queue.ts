import type {
  Category,
  Currency,
  MatchedRate,
  RegisterableTransactionType,
} from "@/domain/types"

const QUEUE_KEY = "organizacion:pending-mutations"

export interface PendingTransaction {
  id: string
  description: string
  originalAmountCents: number
  originalCurrency: Currency
  category: Category
  type?: RegisterableTransactionType
  matchedRate: MatchedRate
  debtId?: string
  freezeInBucketId?: string
  enqueuedAt: number
}

export interface PendingBucketOperation {
  id: string
  bucketId: string
  description: string
  originalAmountCents: number
  originalCurrency: Currency
  matchedRate: MatchedRate
  enqueuedAt: number
}

export interface PendingBucketTransfer extends PendingBucketOperation {
  toBucketId: string
}

export type PendingQueueItem =
  | ({ kind: "movement" } & PendingTransaction)
  | ({ kind: "allocate" } & PendingBucketOperation)
  | ({ kind: "release" } & PendingBucketOperation)
  | ({ kind: "transfer" } & PendingBucketTransfer)

function readQueue(): PendingQueueItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Array<
      PendingQueueItem | PendingTransaction
    >
    return parsed.map((item) =>
      "kind" in item ? item : { kind: "movement" as const, ...item },
    )
  } catch {
    return []
  }
}

function notifyQueueChange() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event("organizacion:queue-change"))
}

export function subscribeQueue(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {}
  const handler = () => onStoreChange()
  window.addEventListener("organizacion:queue-change", handler)
  window.addEventListener("storage", handler)
  return () => {
    window.removeEventListener("organizacion:queue-change", handler)
    window.removeEventListener("storage", handler)
  }
}

function writeQueue(queue: PendingQueueItem[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  notifyQueueChange()
}

export function getPendingQueue(): PendingQueueItem[] {
  return readQueue()
}

/** @deprecated use getPendingQueue */
export function getPendingTransactions(): PendingTransaction[] {
  return readQueue()
    .filter((item): item is PendingQueueItem & { kind: "movement" } =>
      item.kind === "movement",
    )
    .map(({ kind: _kind, ...item }) => item)
}

export function enqueueQueueItem(item: PendingQueueItem) {
  writeQueue([...readQueue(), item])
}

export function enqueueTransaction(item: PendingTransaction) {
  enqueueQueueItem({ kind: "movement", ...item })
}

export function enqueueBucketAllocate(item: PendingBucketOperation) {
  enqueueQueueItem({ kind: "allocate", ...item })
}

export function enqueueBucketRelease(item: PendingBucketOperation) {
  enqueueQueueItem({ kind: "release", ...item })
}

export function enqueueBucketTransfer(item: PendingBucketTransfer) {
  enqueueQueueItem({ kind: "transfer", ...item })
}

export function removePendingItem(id: string) {
  writeQueue(readQueue().filter((item) => item.id !== id))
}

/** @deprecated use removePendingItem */
export function removePendingTransaction(id: string) {
  removePendingItem(id)
}

export function pendingCount(): number {
  return readQueue().length
}
