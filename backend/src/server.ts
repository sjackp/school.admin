import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../../.env") });

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { logger } from "./utils/logger";
import { authRouter } from "./routes/auth";
import { publicRouter } from "./routes/public";
import { studentsRouter } from "./routes/students";
import { enrollmentsRouter } from "./routes/enrollments";
import { submissionsRouter } from "./routes/submissions";
import { reportsRouter } from "./routes/reports";
import { usersRouter } from "./routes/users";
import { authMiddleware } from "./middleware/auth";

const app = express();

const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

app.use(
  cors({
    origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN.split(","),
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Public routes
app.use("/public", publicRouter);

// Auth routes (login, me)
app.use("/auth", authRouter);

// Protected routes
app.use(authMiddleware);
app.use("/students", studentsRouter);
app.use("/enrollments", enrollmentsRouter);
app.use("/submissions", submissionsRouter);
app.use("/reports", reportsRouter);
app.use("/users", usersRouter);

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(
  (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error({ err }, "Unhandled error");
    res.status(500).json({ error: "Internal server error" });
  }
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Backend server listening on port ${PORT}`);
});


