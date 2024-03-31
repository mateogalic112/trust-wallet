import { Router, NextFunction, Request, Response } from "express";
import BlockchainService from "./blockchain.service";
import UserService from "users/users.service";
import {
  ScanBlockRequestDto,
  scanBlockRequestSchema,
} from "./blockchain.validation";
import validationMiddleware from "middleware/validation.middleware";
import { TransactionType } from "@prisma/client";

class BlockchainController {
  public path = "/blockchain";
  public router = Router();

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly userService: UserService
  ) {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(
      `${this.path}/scan-block`,
      validationMiddleware(scanBlockRequestSchema),
      this.scanBlock
    );
  }

  private scanBlock = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { email, blockNumber }: ScanBlockRequestDto = request.body;

    try {
      // Find user that initiated block scan
      const foundUser = await this.userService.findUserByEmail(email);

      // Get all transaction hashed from the block
      const blockTxHashes =
        await this.blockchainService.getBlockTransactionHashes(blockNumber);

      // Parse hashes to get transaction data
      const blockTransactions = await Promise.all(
        blockTxHashes.map(async (txHash) =>
          this.blockchainService.getTransactionData(txHash)
        )
      );

      // Filter out transactions that are not valid
      const userDepositTransactions = blockTransactions.filter((tx) =>
        this.blockchainService.checkValidTransaction(
          foundUser.depositAddress,
          tx
        )
      );

      // If no valid transactions found, return user balance
      if (!userDepositTransactions.length) {
        return response.json({
          transactions: 0,
          userBalance: foundUser.balance,
        });
      }

      // Parse transactions to DTOs
      const depositTransactionDTOs = userDepositTransactions.map((tx) =>
        this.blockchainService.parseToTransactionDto(
          tx,
          TransactionType.DEPOSIT
        )
      );

      // Update user balance
      const { userBalance, transactions } =
        await this.blockchainService.userBlockchainDeposit(
          foundUser.userId,
          depositTransactionDTOs
        );

      return response.json({
        transactions,
        userBalance,
      });
    } catch (err) {
      next(err);
    }
  };
}

export default BlockchainController;
