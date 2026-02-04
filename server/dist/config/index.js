"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = exports.connectDB = void 0;
// Configuration barrel export
var database_js_1 = require("./database.js");
Object.defineProperty(exports, "connectDB", { enumerable: true, get: function () { return database_js_1.connectDB; } });
var redis_js_1 = require("./redis.js");
Object.defineProperty(exports, "redis", { enumerable: true, get: function () { return redis_js_1.redis; } });
//# sourceMappingURL=index.js.map