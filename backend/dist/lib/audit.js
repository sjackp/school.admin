"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeAuditLog = writeAuditLog;
const db_1 = require("./db");
const logger_1 = require("../utils/logger");
async function writeAuditLog({ adminUserId, action, tableName, recordId, changes, req, }) {
    try {
        const ip = req?.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
            req?.socket.remoteAddress ||
            null;
        await (0, db_1.query)(`INSERT INTO public.audit_log (admin_user_id, action, table_name, record_id, changes, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`, [adminUserId, action, tableName, recordId, changes, ip]);
    }
    catch (err) {
        logger_1.logger.error({ err }, "Failed to write audit log");
    }
}
//# sourceMappingURL=audit.js.map