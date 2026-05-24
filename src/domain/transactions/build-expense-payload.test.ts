import { describe, expect, it } from "vitest"
import { buildExpensePayload } from "@/domain/transactions/build-expense-payload"

describe("buildExpensePayload", () => {
  it("maps pending queue item to expense transaction input", () => {
    expect(
      buildExpensePayload({
        id: "optimistic-1",
        description: "harina",
        originalAmountCents: 45000,
        originalCurrency: "VES",
        category: "needs",
        matchedRate: "bcv",
        enqueuedAt: Date.now(),
      }),
    ).toEqual({
      description: "harina",
      originalAmountCents: 45000,
      originalCurrency: "VES",
      category: "needs",
      type: "expense",
      matchedRate: "bcv",
    })
  })
})
