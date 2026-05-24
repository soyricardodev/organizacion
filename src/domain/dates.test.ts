import { describe, expect, it } from "vitest"
import { monthRange, currentWeekKey } from "@/domain/dates"

describe("monthRange", () => {
  it("returns start and end for a month", () => {
    const { start, end } = monthRange("2026-05")
    expect(start.getFullYear()).toBe(2026)
    expect(start.getMonth()).toBe(4)
    expect(end.getMonth()).toBe(5)
    expect(end.getDate()).toBe(1)
  })

  it("handles december rollover", () => {
    const { start, end } = monthRange("2026-12")
    expect(start.getMonth()).toBe(11)
    expect(end.getFullYear()).toBe(2027)
    expect(end.getMonth()).toBe(0)
  })
})

describe("currentWeekKey", () => {
  it("returns yyyy-MM-dd format", () => {
    expect(currentWeekKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
