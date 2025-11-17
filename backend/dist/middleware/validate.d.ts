import type { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";
export declare const validateBody: (schema: ZodObject<any>) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateQuery: (schema: ZodObject<any>) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validate.d.ts.map