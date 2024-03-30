import { env } from "config/env";
import {
  AlchemyProvider,
  TransactionReceipt,
  ethers,
  formatUnits,
} from "ethers";
import NotFoundException from "exceptions/NotFound";
import { Prisma, PrismaClient, TransactionType } from "@prisma/client";
import PrismaService from "services/prisma.service";

class BlockchainService {
  private provider: AlchemyProvider;
  private prisma: PrismaClient;

  private USDC_CONTRACT_ADDRESS = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";
  private USDC_DECIMALS = 6;
  private TRANSACTION_SUCCESS_STATUS = 1;

  constructor() {
    this.provider = new ethers.AlchemyProvider("sepolia", env.SEPOLIA_API_KEY);
    this.prisma = PrismaService.getPrisma();
  }

  public getBlockTransactionHashes = async (blockNumber: number) => {
    const block = await this.provider.getBlock(blockNumber);
    if (!block) {
      throw new NotFoundException("Block not found");
    }
    return block.transactions;
  };

  public getTransactionData = async (transactionHash: string) => {
    const transaction = await this.provider.getTransactionReceipt(
      transactionHash
    );
    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }
    return transaction;
  };

  public checkValidTransaction = (
    userWalletAddress: string,
    transaction: TransactionReceipt
  ) => {
    if (transaction.from !== userWalletAddress) return false;

    const isUSDCTransfer =
      transaction.logs[0].address === this.USDC_CONTRACT_ADDRESS;
    if (!isUSDCTransfer) return false;

    if (transaction.status !== this.TRANSACTION_SUCCESS_STATUS) return false;

    return true;
  };

  public parseToTransactionDto = (
    transaction: TransactionReceipt,
    type: TransactionType
  ) => {
    const logs = transaction.logs;

    const hexAmount = logs[0].data;
    const bigNumberAmount = parseInt(
      formatUnits(hexAmount, this.USDC_DECIMALS),
      10
    );

    return {
      amount: bigNumberAmount,
      wallet: transaction.from,
      type,
      blockNumber: transaction.blockNumber,
      transactionHash: transaction.hash,
      transactionIndex: transaction.index,
    };
  };

  public userBlockchainDeposit = async (
    userId: number,
    transactions: Prisma.TransactionCreateInput[]
  ) => {
    return await this.prisma.$transaction(async (tx) => {
      // Accumulate deposit amount
      const depositAmount = transactions.reduce(
        (acc, tx) => acc + tx.amount,
        0
      );

      // Increment user balance
      const updatedUser = await tx.user.update({
        where: { userId },
        data: { balance: { increment: depositAmount } },
        select: { balance: true },
      });

      /**
       * Create multiple transactions in a single query.
       * Transactions use tx hash for idempotency key on database level. Cannot be used across contracts.
       * Q - If it is possible to create transactions any other way, then adding extra field like `deposited` should be considered.
       */
      const transactionCount = await tx.transaction.createMany({
        data: transactions,
      });

      return {
        transactions: transactionCount.count,
        userBalance: updatedUser.balance,
      };
    });
  };
}

export default BlockchainService;
