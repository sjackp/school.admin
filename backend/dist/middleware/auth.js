"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.verifyPassword = verifyPassword;
exports.findAdminUserByUsername = findAdminUserByUsername;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_1 = require("../lib/jwt");
const db_1 = require("../lib/db");
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const token = authHeader.slice("Bearer ".length);
    try {
        const payload = (0, jwt_1.verifyJwt)(token);
        req.user = {
            id: payload.id,
            username: payload.username,
            role: payload.role,
        };
        next();
    }
    catch {
        res.status(401).json({ error: "Invalid token" });
    }
}
async function verifyPassword(password, hash) {
    return bcryptjs_1.default.compare(password, hash);
}
async function findAdminUserByUsername(username) {
    const result = await (0, db_1.query)(`SELECT * FROM public.admin_users WHERE username = $1`, [username]);
    return result.rows[0] || null;
}
//# sourceMappingURL=auth.js.map