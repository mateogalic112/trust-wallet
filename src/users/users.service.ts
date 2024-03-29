import { createUserQuery, getUsersQuery } from "./users.queries";
import { CreateUserDto, userSchema } from "./users.validation";

class UserService {
  public getUsers = async () => {
    const rawUsers = await getUsersQuery();
    const users = Promise.all(
      rawUsers.map((rawUser) => userSchema.parseAsync(rawUser))
    );
    return users;
  };

  public createUser = async (userData: CreateUserDto) => {
    const createdUser = await createUserQuery(userData);
    return createdUser;
  };
}

export default UserService;
