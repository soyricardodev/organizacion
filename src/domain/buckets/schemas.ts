import { z } from "zod"

export const updateDebtSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1).max(200),
    totalCents: z.number().int().positive(),
    remainingCents: z.number().int().nonnegative(),
    targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    priority: z.number().int().min(0).max(99),
  })
  .superRefine((data, ctx) => {
    if (data.remainingCents > data.totalCents) {
      ctx.addIssue({
        code: "custom",
        message: "El saldo restante no puede superar el total.",
        path: ["remainingCents"],
      })
    }
  })

export type UpdateDebtInput = z.infer<typeof updateDebtSchema>

export const updateBucketSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  targetCents: z.number().int().positive(),
  weeklyTargetCents: z.number().int().positive(),
})

export type UpdateBucketInput = z.infer<typeof updateBucketSchema>
