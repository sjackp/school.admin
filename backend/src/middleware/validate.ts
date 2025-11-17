import type { NextFunction, Request, Response } from "express";
import { ZodError, ZodObject } from "zod";

export const validateBody =
  (schema: ZodObject<any>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: err.flatten() });
        return;
      }
      next(err);
    }
  };

export const validateQuery =
  (schema: ZodObject<any>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.query);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req.query as any) = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: err.flatten() });
        return;
      }
      next(err);
    }
  };


