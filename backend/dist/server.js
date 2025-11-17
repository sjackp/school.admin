"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const path_1 = require("path");
(0, dotenv_1.config)({ path: (0, path_1.resolve)(__dirname, "../../.env") });
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
app.use("/public", public_1.publicRouter);
// Auth routes (login, me)
app.use("/auth", auth_1.authRouter);
// Protected routes
app.use(auth_2.authMiddleware);
app.use("/students", students_1.studentsRouter);
app.use("/enrollments", enrollments_1.enrollmentsRouter);
app.use("/submissions", submissions_1.submissionsRouter);
app.use("/reports", reports_1.reportsRouter);
app.use("/users", users_1.usersRouter);
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