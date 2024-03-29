import sql from "config/sql";
import { CreateUserDto } from "./users.validation";

export const createUserQuery = async ({
  balance,
  email,
  depositAddress,
  privateKey,
}: CreateUserDto) => {
  const userRows = await sql`
      insert into users
        (balance, email, deposit_address, private_key)
      values
        (${balance}, ${email}, ${depositAddress}, ${privateKey})
      returning user_id, balance, email, deposit_address, private_key, created_at
    `;
  return userRows[0];
};

export const getUsersQuery = async () => await sql`select * from users`;
