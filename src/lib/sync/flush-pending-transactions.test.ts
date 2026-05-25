import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/server/finance", () => ({
  createTransaction: vi.fn(),
}))

vi.mock("@/lib/offline-queue", () => ({
  getPendingQueue: vi.fn(),
  removePendingItem: vi.fn(),
  getPendingTransactions: vi.fn(),
  removePendingTransaction: vi.fn(),
}))

import { createTransaction } from "@/server/finance"
import {
  getPendingQueue,
  removePendingItem,
} from "@/lib/offline-queue"
import { flushPendingTransactions } from "@/lib/sync/flush-pending-transactions"

describe("flushPendingTransactions", () => {
  beforeEach(() => {
    vi.mocked(createTransaction).mockReset()
    vi.mocked(getPendingQueue).mockReset()
    vi.mocked(removePendingItem).mockReset()
    Object.defineProperty(globalThis, "navigator", {
      value: { onLine: true },
      configurable: true,
    })
  })

  it("syncs pending items and removes them from queue", async () => {
    vi.mocked(getPendingQueue).mockReturnValue([
      {
        kind: "movement",
        id: "optimistic-1",
        description: "harina",
        originalAmountCents: 45000,
        originalCurrency: "VES",
        category: "needs",
        type: "expense",
        matchedRate: "bcv",
        enqueuedAt: Date.now(),
      },
    ])
    vi.mocked(createTransaction).mockResolvedValue({ id: "real-1" } as never)

    const synced = await flushPendingTransactions()

    expect(synced).toBe(1)
    expect(createTransaction).toHaveBeenCalledWith({
      data: {
        description: "harina",
        originalAmountCents: 45000,
        originalCurrency: "VES",
        category: "needs",
        type: "expense",
        matchedRate: "bcv",
      },
    })
    expect(removePendingItem).toHaveBeenCalledWith("optimistic-1")
  })

  it("stops on first failure", async () => {
    vi.mocked(getPendingQueue).mockReturnValue([
      {
        kind: "movement",
        id: "1",
        description: "a",
        originalAmountCents: 100,
        originalCurrency: "USD",
        category: "needs",
        matchedRate: "bcv",
        enqueuedAt: Date.now(),
      },
      {
        kind: "movement",
        id: "2",
        description: "b",
        originalAmountCents: 200,
        originalCurrency: "USD",
        category: "needs",
        matchedRate: "bcv",
        enqueuedAt: Date.now(),
      },
    ])
    vi.mocked(createTransaction).mockRejectedValue(new Error("offline"))

    const synced = await flushPendingTransactions()

    expect(synced).toBe(0)
    expect(removePendingItem).not.toHaveBeenCalled()
  })
})
