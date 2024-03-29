import App from "app";
import HealthController from "health/health.controller";
import UserController from "users/users.controller";

const app = new App([new HealthController(), new UserController()]);
app.appListen();
