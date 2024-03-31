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
  SEPOLIA_API_KEY: (0, import_envalid.str)()
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

// src/blockchain/blockchain.validation.ts
var import_zod = require("zod");
var scanBlockRequestSchema = import_zod.z.object({
  body: import_zod.z.object({
    blockNumber: import_zod.z.number(),
    email: import_zod.z.string()
  })
});

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
var import_client = require("@prisma/client");
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
            foundUser.depositAddress,
            tx
          )
        );
        if (!userDepositTransactions.length) {
          return response.json({
            transactions: 0,
            userBalance: foundUser.balance
          });
        }
        const depositTransactionDTOs = userDepositTransactions.map(
          (tx) => this.blockchainService.parseToTransactionDto(
            tx,
            import_client.TransactionType.DEPOSIT
          )
        );
        const { userBalance, transactions } = yield this.blockchainService.userBlockchainDeposit(
          foundUser.userId,
          depositTransactionDTOs
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

// src/blockchain/blockchain.service.ts
var import_ethers = require("ethers");

// src/exceptions/NotFound.ts
var NotFoundException = class extends HttpException_default {
  constructor(message) {
    super(404, message);
    this.message = message;
  }
};
var NotFound_default = NotFoundException;

// src/blockchain/blockchain.service.ts
var import_client3 = require("@prisma/client");

// src/services/prisma.service.ts
var import_client2 = require("@prisma/client");
var PrismaService = class _PrismaService {
  constructor() {
  }
  static getPrisma() {
    if (!_PrismaService.prisma) {
      _PrismaService.prisma = new import_client2.PrismaClient();
    }
    return _PrismaService.prisma;
  }
};
var prisma_service_default = PrismaService;

// src/blockchain/blockchain.utils.ts
var USDC_CONTRACT_ADDRESS = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";
var USDC_TOKEN_DECIMALS = 6;
var TRANSACTION_SUCCESS_STATUS = 1;

// src/blockchain/blockchain.service.ts
var BlockchainService = class {
  constructor() {
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
      const isUSDCContract = transaction.logs[0].address === USDC_CONTRACT_ADDRESS;
      if (!isUSDCContract)
        return false;
      if (transaction.status !== TRANSACTION_SUCCESS_STATUS)
        return false;
      return true;
    };
    this.parseToTransactionDto = (transaction, type) => {
      const logs = transaction.logs;
      const hexAmount = logs[0].data;
      const bigNumberAmount = new import_client3.Prisma.Decimal(
        (0, import_ethers.formatUnits)(hexAmount, USDC_TOKEN_DECIMALS)
      );
      return {
        amount: bigNumberAmount,
        wallet: transaction.from,
        type,
        blockNumber: transaction.blockNumber,
        transactionHash: transaction.hash,
        transactionIndex: transaction.index
      };
    };
    this.userBlockchainDeposit = (userId, transactions) => __async(this, null, function* () {
      return yield this.prisma.$transaction((tx) => __async(this, null, function* () {
        const depositAmount = transactions.reduce(
          (acc, tx2) => acc.add(tx2.amount),
          new import_client3.Prisma.Decimal(0)
        );
        const updatedUser = yield tx.user.update({
          where: { userId },
          data: { balance: { increment: depositAmount } },
          select: { balance: true }
        });
        const transactionCount = yield tx.transaction.createMany({
          data: transactions
        });
        return {
          transactions: transactionCount.count,
          userBalance: updatedUser.balance
        };
      }));
    });
    this.provider = new import_ethers.ethers.AlchemyProvider("sepolia", env.SEPOLIA_API_KEY);
    this.prisma = prisma_service_default.getPrisma();
  }
};
var blockchain_service_default = BlockchainService;

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
var withdrawRequestSchema = import_zod3.z.object({
  body: import_zod3.z.object({
    withdraw_address: import_zod3.z.string(),
    withdraw_amount: import_zod3.z.string(),
    user_email: import_zod3.z.string().email()
  })
});
var getWalletBalanceSchema = import_zod3.z.object({
  params: import_zod3.z.object({
    email: import_zod3.z.string().email()
  })
});

// src/users/users.controller.ts
var UserController = class {
  constructor(userService) {
    this.userService = userService;
    this.path = "/users";
    this.router = (0, import_express4.Router)();
    this.getWalletBalance = (request, response, next) => __async(this, null, function* () {
      const email = request.params.email;
      try {
        const walletBalance = yield this.userService.getWalletBalance(email);
        return response.json(walletBalance);
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
    this.withdraw = (request, response, next) => __async(this, null, function* () {
      const requestData = request.body;
      try {
        const result = yield this.userService.withdraw(requestData);
        return response.json(result);
      } catch (err) {
        next(err);
      }
    });
    this.initializeRoutes();
  }
  initializeRoutes() {
    this.router.get(
      `${this.path}/:email/wallet-balance`,
      validation_middleware_default(getWalletBalanceSchema),
      this.getWalletBalance
    );
    this.router.post(
      this.path,
      validation_middleware_default(createUserRequestSchema),
      this.createUser
    );
    this.router.post(
      `${this.path}/withdraw`,
      validation_middleware_default(withdrawRequestSchema),
      this.withdraw
    );
  }
};
var users_controller_default = UserController;

// src/users/users.service.ts
var import_ethers2 = require("ethers");
var import_client4 = require("@prisma/client");
var import_crypto = require("crypto");
var UserService = class {
  constructor() {
    this.findUserByEmail = (email) => __async(this, null, function* () {
      const user = yield this.prisma.user.findUnique({
        where: { email }
      });
      if (!user)
        throw new NotFound_default("User not found");
      return user;
    });
    this.createUser = (requestData) => __async(this, null, function* () {
      const wallet = import_ethers2.ethers.Wallet.createRandom();
      return yield this.prisma.user.create({
        data: {
          depositAddress: wallet.address,
          privateKey: wallet.privateKey,
          email: requestData.email
        }
      });
    });
    this.withdraw = (requestData) => __async(this, null, function* () {
      return yield this.prisma.$transaction((tx) => __async(this, null, function* () {
        const { withdraw_amount, user_email, withdraw_address } = requestData;
        yield tx.$executeRaw`SELECT * FROM users WHERE email = ${user_email} FOR UPDATE`;
        yield this.findUserByEmail(user_email);
        const bigNumberAmount = new import_client4.Prisma.Decimal(
          (0, import_ethers2.formatUnits)(withdraw_amount, USDC_TOKEN_DECIMALS)
        );
        const updatedUser = yield tx.user.update({
          where: { email: user_email },
          data: { balance: { decrement: bigNumberAmount } },
          select: { balance: true }
        });
        if (updatedUser.balance.lessThan(0)) {
          throw new BadRequest_default("Insufficient funds");
        }
        const hash = (0, import_crypto.createHash)("sha256");
        hash.update(
          `${user_email}-${withdraw_address}-${withdraw_amount}-${Date.now()}`
        );
        const transactionHash = `0x${hash.digest("hex")}`;
        const newTransaction = yield tx.transaction.create({
          data: {
            amount: withdraw_amount,
            type: import_client4.TransactionType.WITHDRAW,
            wallet: withdraw_address,
            transactionHash,
            transactionIndex: 0,
            blockNumber: 0
          }
        });
        return {
          userBalance: updatedUser.balance,
          transaction: newTransaction
        };
      }));
    });
    this.getWalletBalance = (email) => __async(this, null, function* () {
      const user = yield this.findUserByEmail(email);
      const latestDeposit = yield this.prisma.transaction.findFirst({
        where: { wallet: user.depositAddress, type: import_client4.TransactionType.DEPOSIT },
        orderBy: [{ blockNumber: "desc" }, { transactionIndex: "desc" }]
      });
      const transactions = yield this.prisma.transaction.findMany({
        where: { wallet: user.depositAddress }
      });
      return {
        latestDeposit,
        walletAddress: user.depositAddress,
        transactions,
        balance: user.balance
      };
    });
    this.prisma = prisma_service_default.getPrisma();
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
