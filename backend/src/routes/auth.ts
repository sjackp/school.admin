import { Router } from "express";
import { loginSchema } from "../lib/validations";
import { validateBody } from "../middleware/validate";
import { authRateLimiter } from "../middleware/rateLimit";
import { findAdminUserByUsername, verifyPassword, AuthRequest } from "../middleware/auth";
import { signJwt } from "../lib/jwt";
import { query } from "../lib/db";
import { requireRole } from "../middleware/rbac";

export const authRouter = Router();

authRouter.post(
  "/login",
  authRateLimiter,
  validateBody(loginSchema),
  async (req, res) => {
    const { username, password } = req.body as { username: string; password: string };

    const user = await findAdminUserByUsername(username);

    if (!user || !user.is_active) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signJwt({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    await query(
      `UPDATE public.admin_users SET last_login = now() WHERE id = $1`,
      [user.id]
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
      },
    });
  }
);

authRouter.get("/me", requireRole(["admin", "editor", "viewer"]), (req: AuthRequest, res) => {
  res.json({ user: req.user });
});


