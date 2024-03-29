import { env } from "config/env";
import express from "express";
import Controller from "interfaces/controller.interface";
import errorMiddleware from "middleware/error.middleware";

class App {
  private app: express.Application;

  constructor(controllers: Controller[]) {
    this.app = express();

    this.initializeMiddlewares();
    this.initializeControllers(controllers);

    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    this.app.use(express.json());
  }

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach((controller) => {
      this.app.use("/api/v1", controller.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  public appListen() {
    this.app.listen(env.PORT, () => {
      console.log(`App listening on the port ${env.PORT}`);
    });
  }
}

export default App;
