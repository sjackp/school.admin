"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const validations_1 = require("../lib/validations");
const validate_1 = require("../middleware/validate");
const rateLimit_1 = require("../middleware/rateLimit");
const auth_1 = require("../middleware/auth");
const jwt_1 = require("../lib/jwt");
const db_1 = require("../lib/db");
const rbac_1 = require("../middleware/rbac");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post("/login", rateLimit_1.authRateLimiter, (0, validate_1.validateBody)(validations_1.loginSchema), async (req, res) => {
    const { username, password } = req.body;
    const user = await (0, auth_1.findAdminUserByUsername)(username);
    if (!user || !user.is_active) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
    }
    const valid = await (0, auth_1.verifyPassword)(password, user.password_hash);
    if (!valid) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
    }
    const token = (0, jwt_1.signJwt)({
        id: user.id,
        username: user.username,
        role: user.role,
    });
    await (0, db_1.query)(`UPDATE public.admin_users SET last_login = now() WHERE id = $1`, [user.id]);
    res.json({
        token,
        user: {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            role: user.role,
        },
    });
});
exports.authRouter.get("/me", (0, rbac_1.requireRole)(["admin", "editor", "viewer"]), (req, res) => {
    res.json({ user: req.user });
});
//# sourceMappingURL=auth.js.map