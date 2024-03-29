import { z } from "zod";
import { TransactionType } from "./blockchain.service";

export const scanBlockRequestSchema = z.object({
  body: z.object({
    blockNumber: z.number(),
    email: z.string(),
  }),
});
export type ScanBlockRequestDto = z.infer<
  typeof scanBlockRequestSchema
>["body"];

export const createTransactionSchema = z.object({
  amount: z.number(),
  wallet: z.string(),
  type: z.enum([TransactionType.DEPOSIT, TransactionType.WITHDRAW]),
  transaction_hash: z.string(),
  transaction_index: z.number(),
});
export type CreateTransactionDto = z.infer<typeof createTransactionSchema>;

export const transactionSchema = z.object({
  transaction_id: z.number(),
  amount: z.number(),
  wallet: z.string(),
  type: z.enum([TransactionType.DEPOSIT, TransactionType.WITHDRAW]),
  transaction_hash: z.string(),
  transaction_index: z.number(),
  created_at: z.date(),
});

export type Transaction = z.infer<typeof transactionSchema>;
