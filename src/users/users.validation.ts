import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    balance: z.number(),
    email: z.string().email(),
    depositAddress: z.string(),
    privateKey: z.string(),
  }),
});

export type CreateUserDto = z.infer<typeof createUserSchema>["body"];

export const userSchema = z.object({
  user_id: z.number(),
  balance: z.number(),
  email: z.string().email(),
  deposit_address: z.string(),
  private_key: z.string(),
  created_at: z.date(),
});

export type User = z.infer<typeof userSchema>;
