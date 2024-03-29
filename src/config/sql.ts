import postgres from "postgres";
import { env } from "./env";

const sql = postgres(env.DATABASE_URL, {
  host: env.POSTGRES_HOST, // Postgres ip address[s] or domain name[s]
  port: env.POSTGRES_PORT, // Postgres server port[s]
  database: env.POSTGRES_DB, // Name of database to connect to
  username: env.POSTGRES_USER, // Username of database user
  password: env.POSTGRES_PASSWORD, // Password of database user
});

export default sql;
