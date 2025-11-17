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
      // Clear existing properties and assign parsed values
      Object.keys(req.query).forEach(key => delete (req.query as any)[key]);
      Object.assign(req.query, parsed);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: err.flatten() });
        return;
      }
      next(err);
    }
  };


