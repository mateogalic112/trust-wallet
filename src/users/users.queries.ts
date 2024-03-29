import sql from "config/sql";
import { CreateUserDto } from "./users.validation";

export const createUserQuery = async ({
  balance,
  email,
  depositAddress,
  privateKey,
}: CreateUserDto) => {
  const userRows = await sql`
      INSERT INTO users
        (balance, email, deposit_address, private_key)
      VALUES
        (${balance}, ${email}, ${depositAddress}, ${privateKey})
      RETURNING *
    `;
  return userRows[0];
};

export const findUserByEmailQuery = async (email: string) => {
  const userRows = await sql`SELECT * FROM users WHERE email = ${email}`;
  return userRows[0];
};

export const getUsersQuery = async () => await sql`SELECT * FROM users`;
