import { CreateUserRequestDto, WithdrawRequest } from "./users.validation";
import { ethers } from "ethers";
import PrismaService from "services/prisma.service";
import { PrismaClient, TransactionType } from "@prisma/client";
import BadRequestException from "exceptions/BadRequest";
import NotFoundException from "exceptions/NotFound";
import { createHash } from "crypto";

class UserService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = PrismaService.getPrisma();
  }

  public findUserByEmail = async (email: string) => {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new NotFoundException("User not found");

    return user;
  };

  public createUser = async (requestData: CreateUserRequestDto) => {
    const wallet = ethers.Wallet.createRandom();

    return await this.prisma.user.create({
      data: {
        balance: 0,
        depositAddress: wallet.address,
        privateKey: wallet.privateKey,
        email: requestData.email,
      },
    });
  };

  public withdraw = async (requestData: WithdrawRequest) => {
    return await this.prisma.$transaction(async (tx) => {
      const { withdraw_amount, user_email, withdraw_address } = requestData;

      // Locks single row for update
      await tx.$executeRaw`SELECT * FROM users WHERE email = ${user_email} FOR UPDATE`;

      const updatedUser = await tx.user.update({
        where: { email: user_email },
        data: { balance: { decrement: withdraw_amount } },
        select: { balance: true },
      });

      if (updatedUser.balance < 0) {
        throw new BadRequestException("Insufficient funds");
      }

      // @dev Hash collision with blockchain transactions is possible, but very unlikely
      const hash = createHash("sha256");
      hash.update(`${user_email}-${withdraw_address}-${Date.now()}`);
      const transactionHash = `0x${hash.digest("hex")}`;

      const newTransaction = await tx.transaction.create({
        data: {
          amount: withdraw_amount,
          type: TransactionType.WITHDRAW,
          wallet: withdraw_address,
          transactionHash,
          transactionIndex: 0,
          blockNumber: 0,
        },
      });

      return {
        userBalance: updatedUser.balance,
        transaction: newTransaction,
      };
    });
  };

  public getWalletBalance = async (email: string) => {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { depositAddress: true, balance: true },
    });

    if (!user) throw new NotFoundException("User not found");

    /**
     * @dev Since deposits are coming only from blockchain,
     *      we can sort them by block number and transaction index.
     */
    const latestDeposit = await this.prisma.transaction.findFirst({
      where: { wallet: user.depositAddress, type: TransactionType.DEPOSIT },
      orderBy: [{ blockNumber: "desc" }, { transactionIndex: "desc" }],
    });

    const transactions = await this.prisma.transaction.findMany({
      where: { wallet: user.depositAddress },
    });

    return {
      latestDeposit,
      walletAddress: user.depositAddress,
      transactions,
      balance: user.balance,
    };
  };
}

export default UserService;
