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
  PORT: (0, import_envalid.port)({ default: 5e3 })
});

// src/app.ts
var import_express = __toESM(require("express"));
var App = class {
  constructor(controllers) {
    this.app = (0, import_express.default)();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }
  initializeMiddlewares() {
    this.app.use(import_express.default.json());
  }
  initializeControllers(controllers) {
    controllers.forEach((controller) => {
      this.app.use("/api/v1", controller.router);
    });
  }
  appListen() {
    this.app.listen(env.PORT, () => {
      console.log(`App listening on the port ${env.PORT}`);
    });
  }
};
var app_default = App;

// src/health/health.controller.ts
var import_express2 = require("express");
var HealthController = class {
  constructor() {
    this.path = "/health";
    this.router = (0, import_express2.Router)();
    this.healthCheck = (_, response) => __async(this, null, function* () {
      return response.json({ message: "I'm alive!" });
    });
    this.initializeRoutes();
  }
  initializeRoutes() {
    this.router.get(this.path, this.healthCheck);
  }
};
var health_controller_default = HealthController;

// src/users/users.controller.ts
var import_express3 = require("express");

// src/exceptions/HttpException.ts
var HttpException = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.message = message;
  }
};
var HttpException_default = HttpException;

// src/exceptions/BadRequest.ts
var BadRequest = class extends HttpException_default {
  constructor(message) {
    super(400, message);
    this.message = message;
  }
};
var BadRequest_default = BadRequest;

// src/middleware/validation.middleware.ts
var import_zod = require("zod");
var validationMiddleware = (schema) => (req, _, next) => __async(void 0, null, function* () {
  try {
    yield schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params
    });
    return next();
  } catch (error) {
    if (error instanceof import_zod.ZodError) {
      return next(new BadRequest_default(error.issues[0].message));
    }
    return next(new BadRequest_default("Error in validation process."));
  }
});
var validation_middleware_default = validationMiddleware;

// src/users/users.validation.ts
var import_zod2 = require("zod");
var createUserSchema = import_zod2.z.object({
  body: import_zod2.z.object({
    balance: import_zod2.z.number(),
    email: import_zod2.z.string().email(),
    depositAddress: import_zod2.z.string(),
    privateKey: import_zod2.z.string()
  })
});
var userSchema = import_zod2.z.object({
  user_id: import_zod2.z.number(),
  balance: import_zod2.z.number(),
  email: import_zod2.z.string().email(),
  deposit_address: import_zod2.z.string(),
  private_key: import_zod2.z.string(),
  created_at: import_zod2.z.date()
});

// src/config/sql.ts
var import_postgres = __toESM(require("postgres"));
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

// src/users/users.queries.ts
var createUserQuery = (_0) => __async(void 0, [_0], function* ({
  balance,
  email,
  depositAddress,
  privateKey
}) {
  const userRows = yield sql_default`
      insert into users
        (balance, email, deposit_address, private_key)
      values
        (${balance}, ${email}, ${depositAddress}, ${privateKey})
      returning user_id, balance, email, deposit_address, private_key, created_at
    `;
  return userRows[0];
});
var getUsersQuery = () => __async(void 0, null, function* () {
  return yield sql_default`select * from users`;
});

// src/users/users.service.ts
var UserService = class {
  constructor() {
    this.getUsers = () => __async(this, null, function* () {
      const rawUsers = yield getUsersQuery();
      const users = Promise.all(
        rawUsers.map((rawUser) => userSchema.parseAsync(rawUser))
      );
      return users;
    });
    this.createUser = (userData) => __async(this, null, function* () {
      const createdUser = yield createUserQuery(userData);
      return createdUser;
    });
  }
};
var users_service_default = UserService;

// src/users/users.controller.ts
var UserController = class {
  constructor() {
    this.path = "/users";
    this.router = (0, import_express3.Router)();
    this.userService = new users_service_default();
    this.getUsers = (_, response, next) => __async(this, null, function* () {
      try {
        const users = yield this.userService.getUsers();
        return response.json(users);
      } catch (err) {
        next(err);
      }
    });
    this.createUser = (request, response, next) => __async(this, null, function* () {
      try {
        const userData = request.body;
        const createdUser = yield this.userService.createUser(userData);
        return response.json(createdUser);
      } catch (err) {
        next(err);
      }
    });
    this.initializeRoutes();
  }
  initializeRoutes() {
    this.router.get(this.path, this.getUsers);
    this.router.post(
      this.path,
      validation_middleware_default(createUserSchema),
      this.createUser
    );
  }
};
var users_controller_default = UserController;

// src/server.ts
var app = new app_default([new health_controller_default(), new users_controller_default()]);
app.appListen();
