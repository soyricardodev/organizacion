import { z } from "zod"
import {
  currencySchema,
  matchedRateSchema,
} from "@/domain/types"

export const bucketOperationSchema = z.object({
  bucketId: z.string().min(1),
  description: z.string().min(1).max(500),
  originalAmountCents: z.number().int().positive(),
  originalCurrency: currencySchema,
  matchedRate: matchedRateSchema,
})

export type BucketOperationInput = z.infer<typeof bucketOperationSchema>

export const bucketTransferSchema = bucketOperationSchema
  .extend({
    toBucketId: z.string().min(1),
  })
  .superRefine((data, ctx) => {
    if (data.bucketId === data.toBucketId) {
      ctx.addIssue({
        code: "custom",
        message: "Elige un bucket distinto.",
        path: ["toBucketId"],
      })
    }
  })

export type BucketTransferInput = z.infer<typeof bucketTransferSchema>
