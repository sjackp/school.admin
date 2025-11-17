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
        // Clear existing properties and assign parsed values
        Object.keys(req.query).forEach(key => delete req.query[key]);
        Object.assign(req.query, parsed);
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