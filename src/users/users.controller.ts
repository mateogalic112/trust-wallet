import { NextFunction, Router, Request, Response } from "express";
import validationMiddleware from "middleware/validation.middleware";
import {
  CreateUserRequestDto,
  createUserRequestSchema,
} from "./users.validation";
import UserService from "./users.service";

class UserController {
  public path = "/users";
  public router = Router();

  public userService = new UserService();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(this.path, this.getUsers);

    this.router.post(
      this.path,
      validationMiddleware(createUserRequestSchema),
      this.createUser
    );
  }

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
