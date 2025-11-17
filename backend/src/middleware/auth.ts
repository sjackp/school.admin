import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { verifyJwt } from "../lib/jwt";
import { query } from "../lib/db";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: "admin" | "editor" | "viewer";
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = verifyJwt(token);
    req.user = {
      id: payload.id,
      username: payload.username,
      role: payload.role,
    };
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function findAdminUserByUsername(username: string) {
  const result = await query<{
    id: number;
    username: string;
    password_hash: string;
    full_name: string;
    role: "admin" | "editor" | "viewer";
    is_active: boolean;
  }>(`SELECT * FROM public.admin_users WHERE username = $1`, [username]);

  return result.rows[0] || null;
}


