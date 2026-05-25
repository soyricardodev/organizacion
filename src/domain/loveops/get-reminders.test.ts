import { describe, expect, it } from "vitest"
import { buildLoveReminders } from "@/domain/loveops/get-reminders"
import type { EnrichedLoveActivity } from "@/domain/loveops/get-activities"

function activity(
  partial: Partial<EnrichedLoveActivity> & Pick<EnrichedLoveActivity, "id" | "title">,
): EnrichedLoveActivity {
  return {
    category: "ritual",
    tags: [],
    costEstimation: "zero",
    weatherPreference: "any",
    frequencyDaysTarget: 4,
    lastExecutedAt: null,
    notes: null,
    active: true,
    daysSinceLast: null,
    daysOverdue: 4,
    isDue: true,
    ...partial,
  }
}

describe("buildLoveReminders", () => {
  it("creates physical touch reminder when overdue", () => {
    const reminders = buildLoveReminders([
      activity({
        id: "1",
        title: "Masajes",
        tags: ["physical_touch"],
        daysSinceLast: 8,
        daysOverdue: 4,
      }),
    ], "Natalia")

    expect(reminders.some((r) => r.id === "physical-touch")).toBe(true)
  })

  it("returns empty when nothing is due", () => {
    const reminders = buildLoveReminders([
      activity({
        id: "1",
        title: "Ok",
        isDue: false,
        daysOverdue: 0,
      }),
    ], "Natalia")

    expect(reminders).toHaveLength(0)
  })
})
