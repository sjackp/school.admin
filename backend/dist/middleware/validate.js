"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateBody = void 0;
const zod_1 = require("zod");
const validateBody = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ error: "Validation error", details: err.flatten() });
            return;
        }
        next(err);
    }
};
exports.validateBody = validateBody;
const validateQuery = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse(req.query);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req.query = parsed;
        next();
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ error: "Validation error", details: err.flatten() });
            return;
        }
        next(err);
    }
};
exports.validateQuery = validateQuery;
//# sourceMappingURL=validate.js.map