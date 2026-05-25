import "dotenv/config"
import { db } from "./index"
import {
  buckets,
  debts,
  exchangeRates,
  loveActivities,
  loveHomeProjects,
  loveSettings,
} from "./schema"
import {
  buildHomeProjectSeedRows,
  buildLoveActivitySeedRows,
} from "@/domain/loveops/seed-data"

/**
 * Estado inicial "desde cero": sin ahorros congelados, sin movimientos.
 * Las deudas y metas de buckets se conservan como referencia; edítalas en db:studio.
 */
async function seed() {
  const now = new Date()

  await db.insert(exchangeRates).values({
    id: crypto.randomUUID(),
    bcvRate: "36.5000",
    euroBcvRate: "39.2000",
    paraleloRate: "58.7500",
    source: "manual",
    fetchedAt: now,
  })

  await db.insert(buckets).values([
    {
      id: crypto.randomUUID(),
      slug: "health",
      name: "Fondo Médico",
      targetCents: 800_00,
      frozenCents: 0,
      weeklyTargetCents: 80_00,
      color: "chart-2",
      icon: "heart-pulse",
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      slug: "emergency",
      name: "Maletas de Emergencia",
      targetCents: 2000_00,
      frozenCents: 0,
      weeklyTargetCents: 100_00,
      color: "chart-3",
      icon: "shield",
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      slug: "anniversary",
      name: "Aniversario",
      targetCents: 400_00,
      frozenCents: 0,
      weeklyTargetCents: 40_00,
      color: "chart-1",
      icon: "heart",
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      slug: "child_plan",
      name: "Plan El Niño",
      targetCents: 1200_00,
      frozenCents: 0,
      weeklyTargetCents: 60_00,
      color: "chart-4",
      icon: "baby",
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      slug: "surprise_gifts",
      name: "Regalos sorpresa",
      targetCents: 200_00,
      frozenCents: 0,
      weeklyTargetCents: 10_00,
      color: "chart-5",
      icon: "gift",
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      slug: "date_night",
      name: "Citas y salidas",
      targetCents: 600_00,
      frozenCents: 0,
      weeklyTargetCents: 30_00,
      color: "chart-1",
      icon: "sparkles",
      createdAt: now,
    },
  ])

  await db.insert(debts).values([
    {
      id: crypto.randomUUID(),
      name: "Tarjeta Junio",
      totalCents: 180_00,
      remainingCents: 120_00,
      targetDate: "2026-07-14",
      priority: 1,
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: "Préstamo Julio",
      totalCents: 250_00,
      remainingCents: 250_00,
      targetDate: "2026-07-14",
      priority: 2,
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: "Tratamiento Rosario",
      totalCents: 90_00,
      remainingCents: 45_00,
      targetDate: "2026-06-30",
      priority: 0,
      createdAt: now,
    },
  ])

  await db.insert(loveActivities).values(buildLoveActivitySeedRows(now))
  await db.insert(loveHomeProjects).values(buildHomeProjectSeedRows(now))

  await db.insert(loveSettings).values({
    id: "default",
    partnerName: process.env.LOVE_PARTNER_NAME?.trim() || "Natalia",
    notificationsEnabled: true,
    updatedAt: now,
  })

  console.log(
    "Seed completado (estado inicial: ahorros en 0, sin movimientos, LoveOps cargado).",
  )
}

seed().catch(console.error)
