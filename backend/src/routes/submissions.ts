import { Router } from "express";
import { requireRole } from "../middleware/rbac";
import { AuthRequest } from "../middleware/auth";
import { query } from "../lib/db";
import { writeAuditLog } from "../lib/audit";

export const submissionsRouter = Router();

// List pending or filtered submissions
submissionsRouter.get(
  "/",
  requireRole(["admin", "editor", "viewer"]),
  async (req, res) => {
    const { status } = req.query as { status?: string };
    const where = status ? "WHERE status = $1" : "";
    const params = status ? [status] : [];

    const result = await query(
      `SELECT * FROM public.enrollment_submissions ${where} ORDER BY submitted_at DESC`,
      params
    );

    res.json({ data: result.rows });
  }
);

// Update submission status / basic fields
submissionsRouter.put(
  "/:id",
  requireRole(["admin", "editor"]),
  async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { status, notes } = req.body as { status?: string; notes?: string };

    const existing = await query(
      `SELECT * FROM public.enrollment_submissions WHERE id = $1`,
      [id]
    );
    if (!existing.rows[0]) {
      res.status(404).json({ error: "Submission not found" });
      return;
    }

    await query(
      `
      UPDATE public.enrollment_submissions
      SET status = COALESCE($1, status),
          notes = COALESCE($2, notes),
          reviewed_at = now(),
          reviewed_by = COALESCE($3, reviewed_by),
          updated_at = now()
      WHERE id = $4
    `,
      [status ?? null, notes ?? null, req.user?.username ?? null, id]
    );

    await writeAuditLog({
      adminUserId: req.user?.id ?? null,
      action: "update",
      tableName: "enrollment_submissions",
      recordId: String(id),
      changes: { before: existing.rows[0], status, notes },
      req,
    });

    res.json({ success: true });
  }
);


