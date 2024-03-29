import NotFoundException from "exceptions/NotFound";
import {
  createUserQuery,
  findUserByEmailQuery,
  getUsersQuery,
} from "./users.queries";
import {
  CreateUserDto,
  CreateUserRequestDto,
  userSchema,
} from "./users.validation";
import { ethers } from "ethers";
import {
  CreateTransactionDto,
  Transaction,
} from "blockchain/blockchain.validation";
import sql from "config/sql";
import { TransactionType } from "blockchain/blockchain.service";

class UserService {
  public getUsers = async () => {
    const rawUsers = await getUsersQuery();
    const users = await Promise.all(
      rawUsers.map((rawUser) => userSchema.parseAsync(rawUser))
    );
    return users;
  };

  public findUserByEmail = async (email: string) => {
    const rawUser = await findUserByEmailQuery(email);
    if (!rawUser) throw new NotFoundException("User not found");
    return userSchema.parse(rawUser);
  };

  public createUser = async (requestData: CreateUserRequestDto) => {
    const wallet = ethers.Wallet.createRandom();

    const userData: CreateUserDto = {
      balance: 0,
      depositAddress: wallet.address,
      privateKey: wallet.privateKey,
      email: requestData.email,
    };
    return await createUserQuery(userData);
  };

  public userBlockchainDeposit = async (
    email: string,
    transactions: CreateTransactionDto[]
  ) => {
    return sql.begin(async (sql) => {
      const transactionRows: Transaction[] = [];

      // Prevent writing to the transactions table while reading
      const userRows =
        await sql`SELECT user_id, balance FROM users WHERE email = ${email} FOR UPDATE`;

      if (userRows.length === 0) {
        throw new NotFoundException("User not found");
      }

      for (const tx of transactions) {
        const existingTx =
          await sql`SELECT 1 FROM transactions WHERE transaction_hash = ${tx.transaction_hash} AND type = ${TransactionType.DEPOSIT}`;

        if (existingTx.length > 0) {
          continue;
        }

        await sql`UPDATE users SET balance = balance + ${tx.amount} WHERE user_id = ${userRows[0].user_id}`;
        const [txRow] = await sql`INSERT INTO transactions ${sql(
          tx
        )} RETURNING *`;

        transactionRows.push(txRow as Transaction);
      }

      const resultBalance =
        await sql`SELECT balance FROM users WHERE email = ${email}`;

      const userEndBalance = resultBalance[0].balance;

      return { transactions: transactionRows, userBalance: userEndBalance };
    });
  };
}

export default UserService;
