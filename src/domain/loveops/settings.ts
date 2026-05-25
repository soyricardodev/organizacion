import { eq } from "drizzle-orm"
import { db } from "@/db"
import { loveSettings } from "@/db/schema"
import type { SaveLoveSettingsInput } from "@/domain/loveops/types"

const SETTINGS_ID = "default"

function defaultPartnerName() {
  return process.env.LOVE_PARTNER_NAME?.trim() || "Natalia"
}

export async function getLoveSettings() {
  const [row] = await db
    .select()
    .from(loveSettings)
    .where(eq(loveSettings.id, SETTINGS_ID))
    .limit(1)

  if (row) return row

  const now = new Date()
  const partnerName = defaultPartnerName()
  await db.insert(loveSettings).values({
    id: SETTINGS_ID,
    partnerName,
    notificationsEnabled: true,
    updatedAt: now,
  })

  return {
    id: SETTINGS_ID,
    partnerName,
    notificationsEnabled: true,
    updatedAt: now,
  }
}

export async function saveLoveSettings(data: SaveLoveSettingsInput) {
  const now = new Date()
  await db
    .insert(loveSettings)
    .values({
      id: SETTINGS_ID,
      partnerName: data.partnerName.trim(),
      notificationsEnabled: data.notificationsEnabled,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: loveSettings.id,
      set: {
        partnerName: data.partnerName.trim(),
        notificationsEnabled: data.notificationsEnabled,
        updatedAt: now,
      },
    })

  return getLoveSettings()
}
