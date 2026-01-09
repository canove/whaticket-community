"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappConfig = exports.redisConfig = exports.jwtConfig = exports.databaseConfig = exports.appConfig = void 0;
var app_config_1 = require("./app.config");
Object.defineProperty(exports, "appConfig", { enumerable: true, get: function () { return __importDefault(app_config_1).default; } });
var database_config_1 = require("./database.config");
Object.defineProperty(exports, "databaseConfig", { enumerable: true, get: function () { return __importDefault(database_config_1).default; } });
var jwt_config_1 = require("./jwt.config");
Object.defineProperty(exports, "jwtConfig", { enumerable: true, get: function () { return __importDefault(jwt_config_1).default; } });
var redis_config_1 = require("./redis.config");
Object.defineProperty(exports, "redisConfig", { enumerable: true, get: function () { return __importDefault(redis_config_1).default; } });
var whatsapp_config_1 = require("./whatsapp.config");
Object.defineProperty(exports, "whatsappConfig", { enumerable: true, get: function () { return __importDefault(whatsapp_config_1).default; } });
//# sourceMappingURL=index.js.map