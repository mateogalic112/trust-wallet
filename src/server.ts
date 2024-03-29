import App from "app";
import BlockchainController from "blockchain/blockchain.controller";
import BlockchainService from "blockchain/blockchain.service";
import HealthController from "health/health.controller";
import UserController from "users/users.controller";
import UserService from "users/users.service";

const app = new App([
  new HealthController(),
  new UserController(new UserService()),
  new BlockchainController(new BlockchainService(), new UserService()),
]);
app.appListen();
