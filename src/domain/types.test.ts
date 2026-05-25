import { describe, expect, it } from "vitest"
import {
  CATEGORIES,
  CURRENCIES,
  MATCHED_RATES,
  TRANSACTION_TYPES,
  categorySchema,
  currencySchema,
  matchedRateSchema,
  shouldFreezeInBucket,
  transactionTypeSchema,
} from "@/domain/types"

describe("domain type enums", () => {
  it("category schema accepts all categories", () => {
    for (const category of CATEGORIES) {
      expect(categorySchema.safeParse(category).success).toBe(true)
    }
  })

  it("currency schema accepts all currencies", () => {
    for (const currency of CURRENCIES) {
      expect(currencySchema.safeParse(currency).success).toBe(true)
    }
  })

  it("matched rate schema accepts all rates", () => {
    for (const rate of MATCHED_RATES) {
      expect(matchedRateSchema.safeParse(rate).success).toBe(true)
    }
  })

  it("transaction type schema accepts all transaction types", () => {
    for (const type of TRANSACTION_TYPES) {
      expect(transactionTypeSchema.safeParse(type).success).toBe(true)
    }
  })
})

describe("shouldFreezeInBucket", () => {
  it("allows freeze on income", () => {
    expect(
      shouldFreezeInBucket({
        type: "income",
        category: "savings",
        freezeInBucketId: "bucket-1",
      }),
    ).toBe(true)
  })

  it("allows freeze on savings expense", () => {
    expect(
      shouldFreezeInBucket({
        type: "expense",
        category: "savings",
        freezeInBucketId: "bucket-1",
      }),
    ).toBe(true)
  })

  it("rejects freeze on non-savings expense", () => {
    expect(
      shouldFreezeInBucket({
        type: "expense",
        category: "needs",
        freezeInBucketId: "bucket-1",
      }),
    ).toBe(false)
  })
})
