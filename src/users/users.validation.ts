import { z } from "zod";

export const createUserRequestSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export type CreateUserRequestDto = z.infer<
  typeof createUserRequestSchema
>["body"];

export const withdrawRequestSchema = z.object({
  body: z.object({
    withdraw_address: z.string(),
    withdraw_amount: z.number(),
    user_email: z.string().email(),
  }),
});

export type WithdrawRequest = z.infer<typeof withdrawRequestSchema>["body"];

export const getWalletBalanceSchema = z.object({
  params: z.object({
    email: z.string().email(),
  }),
});
export type GetWalletBalanceRequest = z.infer<
  typeof getWalletBalanceSchema
>["params"];
