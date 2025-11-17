"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const rbac_1 = require("../middleware/rbac");
const db_1 = require("../lib/db");
const audit_1 = require("../lib/audit");
exports.usersRouter = (0, express_1.Router)();
// List admin users
exports.usersRouter.get("/", (0, rbac_1.requireRole)(["admin"]), async (_req, res) => {
    const result = await (0, db_1.query)(`SELECT id, username, full_name, role, is_active, last_login, created_at FROM public.admin_users ORDER BY id`);
    res.json({ data: result.rows });
});
// Create admin user
exports.usersRouter.post("/", (0, rbac_1.requireRole)(["admin"]), async (req, res) => {
    const { username, password, full_name, role } = req.body;
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const result = await (0, db_1.query)(`
      INSERT INTO public.admin_users (username, password_hash, full_name, role)
      VALUES ($1,$2,$3,$4)
      RETURNING id, username, full_name, role, is_active, created_at
    `, [username, passwordHash, full_name, role]);
    const user = result.rows[0];
    await (0, audit_1.writeAuditLog)({
        adminUserId: req.user?.id ?? null,
        action: "create",
        tableName: "admin_users",
        recordId: String(user.id),
        changes: { username, full_name, role },
        req,
    });
    res.status(201).json({ data: user });
});
//# sourceMappingURL=users.js.map