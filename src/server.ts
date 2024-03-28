import App from "app";
import HealthController from "health/health.controller";

const app = new App([new HealthController()]);
app.appListen();
