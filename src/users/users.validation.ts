import { z } from "zod";

export const createUserRequestSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export type CreateUserRequestDto = z.infer<
  typeof createUserRequestSchema
>["body"];

export const createUserSchema = z.object({
  balance: z.number(),
  email: z.string().email(),
  depositAddress: z.string(),
  privateKey: z.string(),
});
export type CreateUserDto = z.infer<typeof createUserSchema>;

export const userSchema = z.object({
  user_id: z.number(),
  balance: z.number(),
  email: z.string().email(),
  deposit_address: z.string(),
  private_key: z.string(),
  created_at: z.date(),
});

export type User = z.infer<typeof userSchema>;

export const withdrawRequestSchema = z.object({
  body: z.object({
    withdraw_address: z.string(),
    withdraw_amount: z.number(),
    user_email: z.string().email(),
  }),
});

export type WithdrawRequest = z.infer<typeof withdrawRequestSchema>["body"];
