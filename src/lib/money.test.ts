import { describe, expect, it } from "vitest"
import {
  convertToUsdCents,
  debtProgressPercent,
  parseAmountToCents,
  runwayMonths,
} from "@/lib/money"

describe("convertToUsdCents", () => {
  it("returns same amount for USD", () => {
    expect(convertToUsdCents(5000, "USD", rates(), "bcv")).toBe(5000)
  })

  it("converts VES using bcv rate", () => {
    expect(convertToUsdCents(45000, "VES", rates(), "bcv")).toBe(1000)
  })

  it("returns 0 when rate is invalid", () => {
    expect(
      convertToUsdCents(45000, "VES", { ...rates(), bcvRate: "0.0000" }, "bcv"),
    ).toBe(0)
  })
})

describe("parseAmountToCents", () => {
  it("parses decimal strings", () => {
    expect(parseAmountToCents("450,50")).toBe(45050)
  })
})

describe("runwayMonths", () => {
  it("computes months and days from emergency fund", () => {
    expect(runwayMonths(45000, 45000)).toEqual({ months: 1, days: 0 })
  })
})

describe("debtProgressPercent", () => {
  it("returns 100 when fully paid", () => {
    expect(debtProgressPercent(10000, 0)).toBe(100)
  })

  it("returns 50 when half remaining", () => {
    expect(debtProgressPercent(10000, 5000)).toBe(50)
  })
})

function rates() {
  return {
    bcvRate: "45.0000",
    euroBcvRate: "50.0000",
    paraleloRate: "55.0000",
  }
}
