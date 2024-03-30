import { email } from "envalid";
import { NextFunction, Router, Request, Response } from "express";
import validationMiddleware from "middleware/validation.middleware";
import {
  CreateUserRequestDto,
  WithdrawRequest,
  createUserRequestSchema,
  getWalletBalanceSchema,
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
    this.router.get(
      `${this.path}/:email/wallet-balance`,
      validationMiddleware(getWalletBalanceSchema),
      this.getWalletBalance
    );

    this.router.post(
      this.path,
      validationMiddleware(createUserRequestSchema),
      this.createUser
    );

    this.router.post(
      `${this.path}/withdraw`,
      validationMiddleware(withdrawRequestSchema),
      this.withdraw
    );
  }

  private getWalletBalance = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const email = request.params.email;
    try {
      const walletBalance = await this.userService.getWalletBalance(email);
      return response.json(walletBalance);
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

  private withdraw = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const requestData: WithdrawRequest = request.body;
    try {
      const result = await this.userService.withdraw(requestData);
      return response.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export default UserController;
