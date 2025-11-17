"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsRouter = void 0;
const express_1 = require("express");
const rbac_1 = require("../middleware/rbac");
const db_1 = require("../lib/db");
exports.reportsRouter = (0, express_1.Router)();
// Basic stats report for dashboard
exports.reportsRouter.get("/overview", (0, rbac_1.requireRole)(["admin", "editor", "viewer"]), async (_req, res) => {
    const totalByStage = await (0, db_1.query)(`
      SELECT e.stage_ar, COUNT(*)::int as count
      FROM public.student_enrollments e
      GROUP BY e.stage_ar
    `);
    const genderDistribution = await (0, db_1.query)(`
      SELECT s.gender, COUNT(*)::int as count
      FROM public.students s
      GROUP BY s.gender
    `);
    const pendingSubmissions = await (0, db_1.query)(`SELECT COUNT(*)::int AS count FROM public.enrollment_submissions WHERE status = 'pending'`);
    res.json({
        totalByStage: totalByStage.rows,
        genderDistribution: genderDistribution.rows,
        pendingSubmissions: pendingSubmissions.rows[0]?.count ?? 0,
    });
});
//# sourceMappingURL=reports.js.map