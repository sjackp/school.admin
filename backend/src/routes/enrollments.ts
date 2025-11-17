import { Router } from "express";
import { validateBody } from "../middleware/validate";
import { createEnrollmentSchema, updateEnrollmentSchema } from "../lib/validations";
import { requireRole } from "../middleware/rbac";
import { AuthRequest } from "../middleware/auth";
import { query } from "../lib/db";
import { writeAuditLog } from "../lib/audit";

export const enrollmentsRouter = Router();

// List enrollments (basic, can be extended with filters)
enrollmentsRouter.get(
  "/",
  requireRole(["admin", "editor", "viewer"]),
  async (_req, res) => {
    const result = await query(
      `SELECT * FROM public.student_enrollments ORDER BY academic_year DESC, stage_ar, grade_ar`
    );
    res.json({ data: result.rows });
  }
);

// Create enrollment
enrollmentsRouter.post(
  "/",
  requireRole(["admin", "editor"]),
  validateBody(createEnrollmentSchema),
  async (req: AuthRequest, res) => {
    const body = req.body as any;

    const result = await query(
      `
      INSERT INTO public.student_enrollments (
        student_national_id,
        academic_year,
        stage_ar,
        grade_ar,
        class_label,
        school_name_ar,
        school_affiliation,
        governorate,
        directorate,
        school_serial,
        seq_in_grade,
        student_code,
        registration_number,
        foreign_language_ar,
        enrollment_status_ar,
        integration_status_ar,
        age_october_days,
        age_october_months,
        age_october_years
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19
      )
      RETURNING *
    `,
      [
        body.student_national_id,
        body.academic_year,
        body.stage_ar,
        body.grade_ar,
        body.class_label || null,
        body.school_name_ar || null,
        body.school_affiliation || null,
        body.governorate || null,
        body.directorate || null,
        body.school_serial || null,
        body.seq_in_grade ?? null,
        body.student_code || null,
        body.registration_number || null,
        body.foreign_language_ar || null,
        body.enrollment_status_ar || null,
        body.integration_status_ar || null,
        body.age_october_days ?? null,
        body.age_october_months ?? null,
        body.age_october_years ?? null,
      ]
    );

    const enrollment = result.rows[0];

    await writeAuditLog({
      adminUserId: req.user?.id ?? null,
      action: "create",
      tableName: "student_enrollments",
      recordId: String(enrollment.id),
      changes: body,
      req,
    });

    res.status(201).json({ data: enrollment });
  }
);


