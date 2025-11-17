import { Router } from "express";
import bcrypt from "bcryptjs";
import { requireRole } from "../middleware/rbac";
import { AuthRequest } from "../middleware/auth";
import { query } from "../lib/db";
import { writeAuditLog } from "../lib/audit";

export const usersRouter = Router();

// List admin users
usersRouter.get(
  "/",
  requireRole(["admin"]),
  async (_req, res) => {
    const result = await query(
      `SELECT id, username, full_name, role, is_active, last_login, created_at FROM public.admin_users ORDER BY id`
    );
    res.json({ data: result.rows });
  }
);

// Create admin user
usersRouter.post(
  "/",
  requireRole(["admin"]),
  async (req: AuthRequest, res) => {
    const { username, password, full_name, role } = req.body as {
      username: string;
      password: string;
      full_name: string;
      role: "admin" | "editor" | "viewer";
    };

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      `
      INSERT INTO public.admin_users (username, password_hash, full_name, role)
      VALUES ($1,$2,$3,$4)
      RETURNING id, username, full_name, role, is_active, created_at
    `,
      [username, passwordHash, full_name, role]
    );

    const user = result.rows[0];

    await writeAuditLog({
      adminUserId: req.user?.id ?? null,
      action: "create",
      tableName: "admin_users",
      recordId: String(user.id),
      changes: { username, full_name, role },
      req,
    });

    res.status(201).json({ data: user });
  }
);


