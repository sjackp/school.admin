"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submissionsRouter = void 0;
const express_1 = require("express");
const rbac_1 = require("../middleware/rbac");
const db_1 = require("../lib/db");
const audit_1 = require("../lib/audit");
exports.submissionsRouter = (0, express_1.Router)();
// List pending or filtered submissions
exports.submissionsRouter.get("/", (0, rbac_1.requireRole)(["admin", "editor", "viewer"]), async (req, res) => {
    const { status } = req.query;
    const where = status ? "WHERE status = $1" : "";
    const params = status ? [status] : [];
    const result = await (0, db_1.query)(`SELECT * FROM public.enrollment_submissions ${where} ORDER BY submitted_at DESC`, params);
    res.json({ data: result.rows });
});
// Update submission status / basic fields
exports.submissionsRouter.put("/:id", (0, rbac_1.requireRole)(["admin", "editor"]), async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    const existing = await (0, db_1.query)(`SELECT * FROM public.enrollment_submissions WHERE id = $1`, [id]);
    if (!existing.rows[0]) {
        res.status(404).json({ error: "Submission not found" });
        return;
    }
    await (0, db_1.query)(`
      UPDATE public.enrollment_submissions
      SET status = COALESCE($1, status),
          notes = COALESCE($2, notes),
          reviewed_at = now(),
          reviewed_by = COALESCE($3, reviewed_by),
          updated_at = now()
      WHERE id = $4
    `, [status ?? null, notes ?? null, req.user?.username ?? null, id]);
    await (0, audit_1.writeAuditLog)({
        adminUserId: req.user?.id ?? null,
        action: "update",
        tableName: "enrollment_submissions",
        recordId: String(id),
        changes: { before: existing.rows[0], status, notes },
        req,
    });
    res.json({ success: true });
});
//# sourceMappingURL=submissions.js.map