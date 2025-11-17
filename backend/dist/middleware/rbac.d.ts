import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./auth";
export declare function requireRole(roles: Array<"admin" | "editor" | "viewer">): (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=rbac.d.ts.map