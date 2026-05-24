import "dotenv/config"
import { db } from "./index"
import { buckets, debts, exchangeRates } from "./schema"

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
      frozenCents: 120_00,
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
      frozenCents: 650_00,
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
      frozenCents: 40_00,
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
      frozenCents: 200_00,
      weeklyTargetCents: 60_00,
      color: "chart-4",
      icon: "baby",
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

  console.log("Seed completado.")
}

seed().catch(console.error)
