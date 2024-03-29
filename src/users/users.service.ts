import { createUserQuery, getUsersQuery } from "./users.queries";
import {
  CreateUserDto,
  CreateUserRequestDto,
  userSchema,
} from "./users.validation";
import { ethers } from "ethers";

class UserService {
  public getUsers = async () => {
    const rawUsers = await getUsersQuery();
    const users = await Promise.all(
      rawUsers.map((rawUser) => userSchema.parseAsync(rawUser))
    );
    return users;
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
}

export default UserService;
