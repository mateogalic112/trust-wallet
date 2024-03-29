import { env } from "config/env";
import {
  AlchemyProvider,
  TransactionReceipt,
  ethers,
  formatUnits,
} from "ethers";
import NotFoundException from "exceptions/NotFound";
import { CreateTransactionDto } from "./blockchain.validation";

export enum TransactionType {
  DEPOSIT = "DEPOSIT",
  WITHDRAW = "WITHDRAW",
}

class BlockchainService {
  private provider: AlchemyProvider;
  private USDC_CONTRACT_ADDRESS = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";
  private USDC_DECIMALS = 6;
  private TRANSACTION_SUCCESS_STATUS = 1;

  constructor() {
    this.provider = new ethers.AlchemyProvider("sepolia", env.SEPOLIA_API_KEY);
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

    const logs = transaction.logs;

    const isUSDCTransfer = logs[0].address === this.USDC_CONTRACT_ADDRESS;
    if (!isUSDCTransfer) return false;

    if (transaction.status !== this.TRANSACTION_SUCCESS_STATUS) return false;

    return true;
  };

  public parseToTransactionDto = (
    transaction: TransactionReceipt,
    type: TransactionType
  ): CreateTransactionDto => {
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
      transaction_hash: transaction.hash,
      transaction_index: transaction.index,
    };
  };
}

export default BlockchainService;
