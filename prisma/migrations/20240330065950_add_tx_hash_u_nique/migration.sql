/*
  Warnings:

  - A unique constraint covering the columns `[transaction_hash]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `block_number` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "block_number" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "transactions_transaction_hash_key" ON "transactions"("transaction_hash");
