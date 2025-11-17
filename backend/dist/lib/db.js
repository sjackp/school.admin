"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.query = query;
const pg_1 = require("pg");
const logger_1 = require("../utils/logger");
if (!process.env.DATABASE_URL) {
    logger_1.logger.error("DATABASE_URL is not set");
    throw new Error("DATABASE_URL is required");
}
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});
exports.pool.on("error", (err) => {
    logger_1.logger.error({ err }, "Unexpected error on idle PostgreSQL client");
});
async function query(text, params) {
    const start = Date.now();
    const res = await exports.pool.query(text, params);
    const duration = Date.now() - start;
    logger_1.logger.debug({ text, duration, rows: res.rowCount }, "executed query");
    return res;
}
//# sourceMappingURL=db.js.map