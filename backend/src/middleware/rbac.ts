import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./auth";

export function requireRole(roles: Array<"admin" | "editor" | "viewer">) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}


