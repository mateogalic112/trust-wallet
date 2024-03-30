import { z } from "zod";

export const scanBlockRequestSchema = z.object({
  body: z.object({
    blockNumber: z.number(),
    email: z.string(),
  }),
});
export type ScanBlockRequestDto = z.infer<
  typeof scanBlockRequestSchema
>["body"];
