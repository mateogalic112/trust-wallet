import { config } from "dotenv";
import { cleanEnv, email, port, url, str, testOnly } from "envalid";

config();

const testOnlyStringValue = { devDefault: testOnly("myTestValue") };

export const env = cleanEnv(process.env, {
  POSTGRES_USER: str(testOnlyStringValue),
  POSTGRES_PASSWORD: str(testOnlyStringValue),
  POSTGRES_HOST: str(testOnlyStringValue),
  POSTGRES_PORT: port({ devDefault: testOnly(5000) }),
  POSTGRES_DB: str(testOnlyStringValue),

  DATABASE_URL: str(testOnlyStringValue),

  PORT: port({ default: 5000, devDefault: testOnly(5000) }),
});
