import { describe, expect, it } from "vitest"
import { updateDebtSchema, updateBucketSchema } from "@/domain/buckets/schemas"

describe("bucket schemas", () => {
  it("rejects remaining greater than total", () => {
    const result = updateDebtSchema.safeParse({
      id: "debt-1",
      name: "Tarjeta",
      totalCents: 10000,
      remainingCents: 15000,
      targetDate: "2026-07-14",
      priority: 1,
    })
    expect(result.success).toBe(false)
  })

  it("accepts valid debt update", () => {
    const result = updateDebtSchema.safeParse({
      id: "debt-1",
      name: "Tarjeta",
      totalCents: 18000,
      remainingCents: 12000,
      targetDate: "2026-07-14",
      priority: 1,
    })
    expect(result.success).toBe(true)
  })

  it("accepts valid bucket update", () => {
    const result = updateBucketSchema.safeParse({
      id: "bucket-1",
      name: "Emergencia",
      targetCents: 200000,
      weeklyTargetCents: 10000,
    })
    expect(result.success).toBe(true)
  })
})
