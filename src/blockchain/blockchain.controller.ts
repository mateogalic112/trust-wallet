import { Router, NextFunction, Request, Response } from "express";
import BlockchainService, { TransactionType } from "./blockchain.service";
import UserService from "users/users.service";
import {
  ScanBlockRequestDto,
  scanBlockRequestSchema,
} from "./blockchain.validation";
import validationMiddleware from "middleware/validation.middleware";

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
          foundUser.deposit_address,
          tx
        )
      );

      if (!userDepositTransactions.length) {
        return response.json({
          transactions: [],
          userBalance: foundUser.balance,
        });
      }

      // Update user balance
      const { userBalance, transactions } =
        await this.userService.userBlockchainDeposit(
          email,
          userDepositTransactions.map((tx) =>
            this.blockchainService.parseToTransactionDto(
              tx,
              TransactionType.DEPOSIT
            )
          )
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
