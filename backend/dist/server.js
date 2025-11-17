"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const logger_1 = require("./utils/logger");
const auth_1 = require("./routes/auth");
const public_1 = require("./routes/public");
const students_1 = require("./routes/students");
const enrollments_1 = require("./routes/enrollments");
const submissions_1 = require("./routes/submissions");
const reports_1 = require("./routes/reports");
const users_1 = require("./routes/users");
const auth_2 = require("./middleware/auth");
const app = (0, express_1.default)();
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
app.use((0, cors_1.default)({
    origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN.split(","),
    credentials: true,
}));
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
// Health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
// Public routes
app.use("/api/public", public_1.publicRouter);
// Auth routes (login, me)
app.use("/api/auth", auth_1.authRouter);
// Protected routes
app.use("/api", auth_2.authMiddleware);
app.use("/api/students", students_1.studentsRouter);
app.use("/api/enrollments", enrollments_1.enrollmentsRouter);
app.use("/api/submissions", submissions_1.submissionsRouter);
app.use("/api/reports", reports_1.reportsRouter);
app.use("/api/users", users_1.usersRouter);
// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, _next) => {
    logger_1.logger.error({ err }, "Unhandled error");
    res.status(500).json({ error: "Internal server error" });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger_1.logger.info(`Backend server listening on port ${PORT}`);
});
//# sourceMappingURL=server.js.map