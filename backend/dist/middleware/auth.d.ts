import type { NextFunction, Request, Response } from "express";
export interface AuthRequest extends Request {
    user?: {
        id: number;
        username: string;
        role: "admin" | "editor" | "viewer";
    };
}
export declare function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void;
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
export declare function findAdminUserByUsername(username: string): Promise<{
    id: number;
    username: string;
    password_hash: string;
    full_name: string;
    role: "admin" | "editor" | "viewer";
    is_active: boolean;
} | null>;
//# sourceMappingURL=auth.d.ts.map