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
import {
  TRANSACTION_SUCCESS_STATUS,
  USDC_CONTRACT_ADDRESS,
  USDC_TOKEN_DECIMALS,
} from "./blockchain.utils";

class BlockchainService {
  private provider: AlchemyProvider;
  private prisma: PrismaClient;

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

    const isUSDCContract =
      transaction.logs[0].address === USDC_CONTRACT_ADDRESS;
    if (!isUSDCContract) return false;

    if (transaction.status !== TRANSACTION_SUCCESS_STATUS) return false;

    return true;
  };

  public parseToTransactionDto = (
    transaction: TransactionReceipt,
    type: TransactionType
  ) => {
    const logs = transaction.logs;

    const hexAmount = logs[0].data; // USDC amount stored in transaction (0x00000000000000000000000000000000000000000000000000000002540be400)
    // Parse amount with USDC decimals
    const bigNumberAmount = new Prisma.Decimal(
      formatUnits(hexAmount, USDC_TOKEN_DECIMALS)
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

  public checkIfTransactionsAlreadyStored = async (
    transactionHashes: string[]
  ) => {
    const existingTransactions = await this.prisma.transaction.findFirst({
      where: { transactionHash: { in: transactionHashes } },
    });

    return !!existingTransactions;
  };

  public userBlockchainDeposit = async (
    userId: number,
    transactions: Prisma.TransactionCreateInput[]
  ) => {
    // @dev No need for locks, since we are reading from immutable block
    return await this.prisma.$transaction(async (tx) => {
      // Accumulate deposit amount
      const depositAmount = transactions.reduce(
        (acc, tx) => acc.add(tx.amount as Prisma.Decimal),
        new Prisma.Decimal(0)
      );

      // Increment user balance
      const updatedUser = await tx.user.update({
        where: { userId },
        data: { balance: { increment: depositAmount } },
        select: { balance: true },
      });

      /**
       * @dev    Transactions use tx hash for preventing duplicates on a database level.
       *         Blockchain is a single source of truth.
       * @notice Hash is not unique across different blockchains!
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
