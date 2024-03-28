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
var testOnlyStringValue = { devDefault: (0, import_envalid.testOnly)("myTestValue") };
var env = (0, import_envalid.cleanEnv)(process.env, {
  POSTGRES_USER: (0, import_envalid.str)(testOnlyStringValue),
  POSTGRES_PASSWORD: (0, import_envalid.str)(testOnlyStringValue),
  POSTGRES_HOST: (0, import_envalid.str)(testOnlyStringValue),
  POSTGRES_PORT: (0, import_envalid.port)({ devDefault: (0, import_envalid.testOnly)(5e3) }),
  POSTGRES_DB: (0, import_envalid.str)(testOnlyStringValue),
  DATABASE_URL: (0, import_envalid.str)(testOnlyStringValue),
  PORT: (0, import_envalid.port)({ default: 5e3, devDefault: (0, import_envalid.testOnly)(5e3) })
});

// src/app.ts
var import_express = __toESM(require("express"));
var App = class {
  constructor(controllers) {
    this.app = (0, import_express.default)();
    this.initializeControllers(controllers);
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

// src/server.ts
var app = new app_default([new health_controller_default()]);
app.appListen();
