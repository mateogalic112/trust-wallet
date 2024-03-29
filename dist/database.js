"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/config/sql.ts
var import_postgres = __toESM(require("postgres"));

// src/config/env.ts
var import_dotenv = require("dotenv");
var import_envalid = require("envalid");
(0, import_dotenv.config)();
var env = (0, import_envalid.cleanEnv)(process.env, {
  POSTGRES_USER: (0, import_envalid.str)(),
  POSTGRES_PASSWORD: (0, import_envalid.str)(),
  POSTGRES_HOST: (0, import_envalid.str)(),
  POSTGRES_PORT: (0, import_envalid.port)({ default: 5432 }),
  POSTGRES_DB: (0, import_envalid.str)(),
  DATABASE_URL: (0, import_envalid.str)(),
  PORT: (0, import_envalid.port)({ default: 5e3 }),
  SEPOLIA_API_KEY: (0, import_envalid.str)(),
  SEPOLIA_API_URL: (0, import_envalid.str)()
});

// src/config/sql.ts
var sql = (0, import_postgres.default)(env.DATABASE_URL, {
  host: env.POSTGRES_HOST,
  // Postgres ip address[s] or domain name[s]
  port: env.POSTGRES_PORT,
  // Postgres server port[s]
  database: env.POSTGRES_DB,
  // Name of database to connect to
  username: env.POSTGRES_USER,
  // Username of database user
  password: env.POSTGRES_PASSWORD
  // Password of database user
});
var sql_default = sql;

// src/config/database.ts
var databaseInit = () => __async(exports, null, function* () {
  yield sql_default`DROP TABLE IF EXISTS transactions`;
  yield sql_default`
    CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY, 
        balance INTEGER DEFAULT 0, 
        email VARCHAR(255) UNIQUE NOT NULL, 
        deposit_address VARCHAR(255) NOT NULL, 
        private_key TEXT NOT NULL, 
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`;
  yield sql_default`
    CREATE TABLE IF NOT EXISTS transactions (
        transaction_id SERIAL PRIMARY KEY, 
        amount INTEGER NOT NULL, 
        wallet VARCHAR(255) NOT NULL,
        type VARCHAR(255) NOT NULL,
        transaction_hash VARCHAR(255),
        transaction_index INTEGER,
        deposited BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`;
});
databaseInit().then(() => {
  console.log("Tables created or already in place!");
  process.exit();
}).catch((error) => {
  console.error("Error creating tables:", error);
  process.exit(1);
});
