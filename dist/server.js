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
  PORT: (0, import_envalid.port)({ default: 5e3 }),
  SEPOLIA_API_KEY: (0, import_envalid.str)(),
  SEPOLIA_API_URL: (0, import_envalid.str)()
});

// src/app.ts
var import_express = __toESM(require("express"));

// src/middleware/error.middleware.ts
function errorMiddleware(error, request, response, next) {
  const status = error.status || 500;
  const message = error.message || "Something went wrong";
  response.status(status).json({
    status,
    message
  });
}
var error_middleware_default = errorMiddleware;

// src/app.ts
var App = class {
  constructor(controllers) {
    this.app = (0, import_express.default)();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }
  initializeMiddlewares() {
    this.app.use(import_express.default.json());
  }
  initializeControllers(controllers) {
    controllers.forEach((controller) => {
      this.app.use("/api/v1", controller.router);
    });
  }
  initializeErrorHandling() {
    this.app.use(error_middleware_default);
  }
  appListen() {
    this.app.listen(env.PORT, () => {
      console.log(`App listening on the port ${env.PORT}`);
    });
  }
};
var app_default = App;

// src/blockchain/blockchain.controller.ts
var import_express2 = require("express");

// src/blockchain/blockchain.service.ts
var import_ethers = require("ethers");

// src/exceptions/HttpException.ts
var HttpException = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.message = message;
  }
};
var HttpException_default = HttpException;

// src/exceptions/NotFound.ts
var NotFoundException = class extends HttpException_default {
  constructor(message) {
    super(404, message);
    this.message = message;
  }
};
var NotFound_default = NotFoundException;

// src/blockchain/blockchain.service.ts
var BlockchainService = class {
  constructor() {
    this.USDC_CONTRACT_ADDRESS = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";
    this.USDC_DECIMALS = 6;
    this.TRANSACTION_SUCCESS_STATUS = 1;
    this.getBlockTransactionHashes = (blockNumber) => __async(this, null, function* () {
      const block = yield this.provider.getBlock(blockNumber);
      if (!block) {
        throw new NotFound_default("Block not found");
      }
      return block.transactions;
    });
    this.getTransactionData = (transactionHash) => __async(this, null, function* () {
      const transaction = yield this.provider.getTransactionReceipt(
        transactionHash
      );
      if (!transaction) {
        throw new NotFound_default("Transaction not found");
      }
      return transaction;
    });
    this.checkValidTransaction = (userWalletAddress, transaction) => {
      if (transaction.from !== userWalletAddress)
        return false;
      const isUSDCTransfer = transaction.logs[0].address === this.USDC_CONTRACT_ADDRESS;
      if (!isUSDCTransfer)
        return false;
      if (transaction.status !== this.TRANSACTION_SUCCESS_STATUS)
        return false;
      return true;
    };
    this.parseToTransactionDto = (transaction, type) => {
      const logs = transaction.logs;
      const hexAmount = logs[0].data;
      const bigNumberAmount = parseInt(
        (0, import_ethers.formatUnits)(hexAmount, this.USDC_DECIMALS),
        10
      );
      return {
        amount: bigNumberAmount,
        wallet: transaction.from,
        type,
        transaction_hash: transaction.hash,
        transaction_index: transaction.index
      };
    };
    this.provider = new import_ethers.ethers.AlchemyProvider("sepolia", env.SEPOLIA_API_KEY);
  }
};
var blockchain_service_default = BlockchainService;

// src/blockchain/blockchain.validation.ts
var import_zod = require("zod");
var scanBlockRequestSchema = import_zod.z.object({
  body: import_zod.z.object({
    blockNumber: import_zod.z.number(),
    email: import_zod.z.string()
  })
});
var createTransactionSchema = import_zod.z.object({
  amount: import_zod.z.number(),
  wallet: import_zod.z.string(),
  type: import_zod.z.enum(["DEPOSIT" /* DEPOSIT */, "WITHDRAW" /* WITHDRAW */]),
  transaction_hash: import_zod.z.string(),
  transaction_index: import_zod.z.number()
});
var transactionSchema = import_zod.z.object({
  transaction_id: import_zod.z.number(),
  amount: import_zod.z.number(),
  wallet: import_zod.z.string(),
  type: import_zod.z.enum(["DEPOSIT" /* DEPOSIT */, "WITHDRAW" /* WITHDRAW */]),
  transaction_hash: import_zod.z.string(),
  transaction_index: import_zod.z.number(),
  created_at: import_zod.z.date()
});

// src/exceptions/BadRequest.ts
var BadRequestException = class extends HttpException_default {
  constructor(message) {
    super(400, message);
    this.message = message;
  }
};
var BadRequest_default = BadRequestException;

// src/middleware/validation.middleware.ts
var import_zod2 = require("zod");
var validationMiddleware = (schema) => (req, _, next) => __async(void 0, null, function* () {
  try {
    yield schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params
    });
    return next();
  } catch (error) {
    if (error instanceof import_zod2.ZodError) {
      return next(new BadRequest_default(error.issues[0].message));
    }
    return next(new BadRequest_default("Error in validation process."));
  }
});
var validation_middleware_default = validationMiddleware;

// src/blockchain/blockchain.controller.ts
var BlockchainController = class {
  constructor(blockchainService, userService) {
    this.blockchainService = blockchainService;
    this.userService = userService;
    this.path = "/blockchain";
    this.router = (0, import_express2.Router)();
    this.scanBlock = (request, response, next) => __async(this, null, function* () {
      const { email, blockNumber } = request.body;
      try {
        const foundUser = yield this.userService.findUserByEmail(email);
        const blockTxHashes = yield this.blockchainService.getBlockTransactionHashes(blockNumber);
        const blockTransactions = yield Promise.all(
          blockTxHashes.map(
            (txHash) => __async(this, null, function* () {
              return this.blockchainService.getTransactionData(txHash);
            })
          )
        );
        const userDepositTransactions = blockTransactions.filter(
          (tx) => this.blockchainService.checkValidTransaction(
            foundUser.deposit_address,
            tx
          )
        );
        if (!userDepositTransactions.length) {
          return response.json({
            transactions: [],
            userBalance: foundUser.balance
          });
        }
        const { userBalance, transactions } = yield this.userService.userBlockchainDeposit(
          email,
          userDepositTransactions.map(
            (tx) => this.blockchainService.parseToTransactionDto(
              tx,
              "DEPOSIT" /* DEPOSIT */
            )
          )
        );
        return response.json({
          transactions,
          userBalance
        });
      } catch (err) {
        next(err);
      }
    });
    this.initializeRoutes();
  }
  initializeRoutes() {
    this.router.post(
      `${this.path}/scan-block`,
      validation_middleware_default(scanBlockRequestSchema),
      this.scanBlock
    );
  }
};
var blockchain_controller_default = BlockchainController;

// src/health/health.controller.ts
var import_express3 = require("express");
var HealthController = class {
  constructor() {
    this.path = "/health";
    this.router = (0, import_express3.Router)();
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
var import_express4 = require("express");

// src/users/users.validation.ts
var import_zod3 = require("zod");
var createUserRequestSchema = import_zod3.z.object({
  body: import_zod3.z.object({
    email: import_zod3.z.string().email()
  })
});
var createUserSchema = import_zod3.z.object({
  balance: import_zod3.z.number(),
  email: import_zod3.z.string().email(),
  depositAddress: import_zod3.z.string(),
  privateKey: import_zod3.z.string()
});
var userSchema = import_zod3.z.object({
  user_id: import_zod3.z.number(),
  balance: import_zod3.z.number(),
  email: import_zod3.z.string().email(),
  deposit_address: import_zod3.z.string(),
  private_key: import_zod3.z.string(),
  created_at: import_zod3.z.date()
});
var withdrawRequestSchema = import_zod3.z.object({
  body: import_zod3.z.object({
    withdraw_address: import_zod3.z.string(),
    withdraw_amount: import_zod3.z.number(),
    user_email: import_zod3.z.string().email()
  })
});

// src/users/users.controller.ts
var UserController = class {
  constructor(userService) {
    this.userService = userService;
    this.path = "/users";
    this.router = (0, import_express4.Router)();
    this.withdraw = (request, response, next) => __async(this, null, function* () {
      const requestData = request.body;
      try {
        const successfulWithdrawal = yield this.userService.withdraw(requestData);
        return response.json({ successfulWithdrawal });
      } catch (err) {
        next(err);
      }
    });
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
        const requestData = request.body;
        const createdUser = yield this.userService.createUser(requestData);
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
      `${this.path}/withdraw`,
      validation_middleware_default(withdrawRequestSchema),
      this.withdraw
    );
    this.router.post(
      this.path,
      validation_middleware_default(createUserRequestSchema),
      this.createUser
    );
  }
};
var users_controller_default = UserController;

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
      INSERT INTO users
        (balance, email, deposit_address, private_key)
      VALUES
        (${balance}, ${email}, ${depositAddress}, ${privateKey})
      RETURNING *
    `;
  return userRows[0];
});
var findUserByEmailQuery = (email) => __async(void 0, null, function* () {
  const userRows = yield sql_default`SELECT * FROM users WHERE email = ${email}`;
  return userRows[0];
});
var getUsersQuery = () => __async(void 0, null, function* () {
  return yield sql_default`SELECT * FROM users`;
});

// src/users/users.service.ts
var import_ethers2 = require("ethers");
var UserService = class {
  constructor() {
    this.getUsers = () => __async(this, null, function* () {
      const rawUsers = yield getUsersQuery();
      const users = yield Promise.all(
        rawUsers.map((rawUser) => userSchema.parseAsync(rawUser))
      );
      return users;
    });
    this.withdraw = (requestData) => __async(this, null, function* () {
      const { withdraw_amount, user_email } = requestData;
      return sql_default.begin((sql2) => __async(this, null, function* () {
        const userRows = yield sql2`SELECT user_id, balance, deposit_address FROM users WHERE email = ${user_email} FOR UPDATE`;
        if (userRows.length === 0) {
          throw new NotFound_default("User not found");
        }
        const userRow = userRows[0];
        if (userRow.balance < withdraw_amount) {
          throw new BadRequest_default("Insufficient balance");
        }
        yield sql2`UPDATE users SET balance = balance - ${withdraw_amount} WHERE user_id = ${userRow.user_id}`;
        yield sql2`INSERT INTO transactions (wallet, amount, type) VALUES (${userRow.deposit_address}, ${withdraw_amount}, ${"WITHDRAW" /* WITHDRAW */})`;
        return { userBalance: userRow.balance - withdraw_amount };
      }));
    });
    this.findUserByEmail = (email) => __async(this, null, function* () {
      const rawUser = yield findUserByEmailQuery(email);
      if (!rawUser)
        throw new NotFound_default("User not found");
      return userSchema.parse(rawUser);
    });
    this.createUser = (requestData) => __async(this, null, function* () {
      const wallet = import_ethers2.ethers.Wallet.createRandom();
      const userData = {
        balance: 0,
        depositAddress: wallet.address,
        privateKey: wallet.privateKey,
        email: requestData.email
      };
      return yield createUserQuery(userData);
    });
    this.userBlockchainDeposit = (email, transactions) => __async(this, null, function* () {
      return sql_default.begin((sql2) => __async(this, null, function* () {
        const transactionRows = [];
        const userRows = yield sql2`SELECT user_id, balance FROM users WHERE email = ${email} FOR UPDATE`;
        if (userRows.length === 0) {
          throw new NotFound_default("User not found");
        }
        for (const tx of transactions) {
          const existingTx = yield sql2`SELECT 1 FROM transactions WHERE transaction_hash = ${tx.transaction_hash} AND type = ${"DEPOSIT" /* DEPOSIT */}`;
          if (existingTx.length > 0) {
            continue;
          }
          yield sql2`UPDATE users SET balance = balance + ${tx.amount} WHERE user_id = ${userRows[0].user_id}`;
          const [txRow] = yield sql2`INSERT INTO transactions ${sql2(
            tx
          )} RETURNING *`;
          transactionRows.push(txRow);
        }
        const resultBalance = yield sql2`SELECT balance FROM users WHERE email = ${email}`;
        const userEndBalance = resultBalance[0].balance;
        return { transactions: transactionRows, userBalance: userEndBalance };
      }));
    });
  }
};
var users_service_default = UserService;

// src/server.ts
var app = new app_default([
  new health_controller_default(),
  new users_controller_default(new users_service_default()),
  new blockchain_controller_default(new blockchain_service_default(), new users_service_default())
]);
app.appListen();
