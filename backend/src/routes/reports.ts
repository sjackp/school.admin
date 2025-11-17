import { Router } from "express";
import { requireRole } from "../middleware/rbac";
import { query } from "../lib/db";

export const reportsRouter = Router();

// Basic stats report for dashboard
reportsRouter.get(
  "/overview",
  requireRole(["admin", "editor", "viewer"]),
  async (_req, res) => {
    const totalByStage = await query(
      `
      SELECT e.stage_ar, COUNT(*)::int as count
      FROM public.student_enrollments e
      GROUP BY e.stage_ar
    `
    );

    const genderDistribution = await query(
      `
      SELECT s.gender, COUNT(*)::int as count
      FROM public.students s
      GROUP BY s.gender
    `
    );

    const pendingSubmissions = await query(
      `SELECT COUNT(*)::int AS count FROM public.enrollment_submissions WHERE status = 'pending'`
    );

    res.json({
      totalByStage: totalByStage.rows,
      genderDistribution: genderDistribution.rows,
      pendingSubmissions: pendingSubmissions.rows[0]?.count ?? 0,
    });
  }
);


