const QUEUE_KEY = "organizacion:pending-mutations"

export interface PendingTransaction {
  id: string
  description: string
  originalAmountCents: number
  originalCurrency: "VES" | "USD" | "EUR"
  category: "needs" | "wants" | "savings" | "health" | "debt_payment"
  matchedRate: "bcv" | "euro_bcv" | "paralelo"
  enqueuedAt: number
}

function readQueue(): PendingTransaction[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as PendingTransaction[]
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

function writeQueue(queue: PendingTransaction[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  notifyQueueChange()
}

export function getPendingTransactions(): PendingTransaction[] {
  return readQueue()
}

export function enqueueTransaction(item: PendingTransaction) {
  writeQueue([...readQueue(), item])
}

export function removePendingTransaction(id: string) {
  writeQueue(readQueue().filter((item) => item.id !== id))
}

export function pendingCount(): number {
  return readQueue().length
}
