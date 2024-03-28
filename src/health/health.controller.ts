import { Request, Response, Router } from "express";

class HealthController {
  public path = "/health";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(this.path, this.healthCheck);
  }

  private healthCheck = async (_: Request, response: Response) => {
    return response.json({ message: "I'm alive!" });
  };
}

export default HealthController;
