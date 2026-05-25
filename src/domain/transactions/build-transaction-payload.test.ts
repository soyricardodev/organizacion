import { describe, expect, it } from "vitest"
import { buildTransactionPayload } from "@/domain/transactions/build-transaction-payload"
import { resolveEffectiveType } from "@/domain/transactions/resolve-effective-type"

describe("buildTransactionPayload", () => {
  it("maps pending queue item to expense transaction input", () => {
    expect(
      buildTransactionPayload({
        id: "optimistic-1",
        description: "harina",
        originalAmountCents: 45000,
        originalCurrency: "VES",
        category: "needs",
        type: "expense",
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

  it("maps pending queue item to income transaction input", () => {
    expect(
      buildTransactionPayload({
        id: "optimistic-2",
        description: "salario mayo",
        originalAmountCents: 50000,
        originalCurrency: "USD",
        category: "savings",
        type: "income",
        matchedRate: "bcv",
        freezeInBucketId: "bucket-emergency",
        enqueuedAt: Date.now(),
      }),
    ).toEqual({
      description: "salario mayo",
      originalAmountCents: 50000,
      originalCurrency: "USD",
      category: "savings",
      type: "income",
      matchedRate: "bcv",
      freezeInBucketId: "bucket-emergency",
    })
  })

  it("includes debtId for debt payment queue items", () => {
    expect(
      buildTransactionPayload({
        id: "optimistic-3",
        description: "abono tarjeta",
        originalAmountCents: 5000,
        originalCurrency: "USD",
        category: "debt_payment",
        type: "expense",
        debtId: "debt-1",
        matchedRate: "bcv",
        enqueuedAt: Date.now(),
      }),
    ).toMatchObject({
      category: "debt_payment",
      type: "expense",
      debtId: "debt-1",
    })
  })

  it("defaults missing type to expense for legacy queue items", () => {
    expect(
      buildTransactionPayload({
        id: "legacy-1",
        description: "legacy",
        originalAmountCents: 100,
        originalCurrency: "USD",
        category: "needs",
        matchedRate: "bcv",
        enqueuedAt: Date.now(),
      }),
    ).toMatchObject({ type: "expense" })
  })
})

describe("resolveEffectiveType", () => {
  it("promotes expense + debt_payment + debtId to debt_payment", () => {
    expect(
      resolveEffectiveType({
        type: "expense",
        category: "debt_payment",
        debtId: "debt-1",
      }),
    ).toBe("debt_payment")
  })

  it("keeps plain expense as expense", () => {
    expect(
      resolveEffectiveType({
        type: "expense",
        category: "needs",
      }),
    ).toBe("expense")
  })
})
