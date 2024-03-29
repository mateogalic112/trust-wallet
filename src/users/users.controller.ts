import { NextFunction, Router, Request, Response } from "express";
import validationMiddleware from "middleware/validation.middleware";
import {
  CreateUserRequestDto,
  WithdrawRequest,
  createUserRequestSchema,
  withdrawRequestSchema,
} from "./users.validation";
import UserService from "./users.service";

class UserController {
  public path = "/users";
  public router = Router();

  constructor(private readonly userService: UserService) {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(this.path, this.getUsers);

    this.router.post(
      `${this.path}/withdraw`,
      validationMiddleware(withdrawRequestSchema),
      this.withdraw
    );

    this.router.post(
      this.path,
      validationMiddleware(createUserRequestSchema),
      this.createUser
    );
  }

  private withdraw = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const requestData: WithdrawRequest = request.body;
    try {
      const successfulWithdrawal = await this.userService.withdraw(requestData);
      return response.json({ successfulWithdrawal });
    } catch (err) {
      next(err);
    }
  };

  private getUsers = async (
    _: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const users = await this.userService.getUsers();
      return response.json(users);
    } catch (err) {
      next(err);
    }
  };

  private createUser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const requestData: CreateUserRequestDto = request.body;
      const createdUser = await this.userService.createUser(requestData);
      return response.json(createdUser);
    } catch (err) {
      next(err);
    }
  };
}

export default UserController;
