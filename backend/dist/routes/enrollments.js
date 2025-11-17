"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollmentsRouter = void 0;
const express_1 = require("express");
const validate_1 = require("../middleware/validate");
const validations_1 = require("../lib/validations");
const rbac_1 = require("../middleware/rbac");
const db_1 = require("../lib/db");
const audit_1 = require("../lib/audit");
exports.enrollmentsRouter = (0, express_1.Router)();
// List enrollments (basic, can be extended with filters)
exports.enrollmentsRouter.get("/", (0, rbac_1.requireRole)(["admin", "editor", "viewer"]), async (_req, res) => {
    const result = await (0, db_1.query)(`SELECT * FROM public.student_enrollments ORDER BY academic_year DESC, stage_ar, grade_ar`);
    res.json({ data: result.rows });
});
// Create enrollment
exports.enrollmentsRouter.post("/", (0, rbac_1.requireRole)(["admin", "editor"]), (0, validate_1.validateBody)(validations_1.createEnrollmentSchema), async (req, res) => {
    const body = req.body;
    const result = await (0, db_1.query)(`
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
    `, [
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
    ]);
    const enrollment = result.rows[0];
    await (0, audit_1.writeAuditLog)({
        adminUserId: req.user?.id ?? null,
        action: "create",
        tableName: "student_enrollments",
        recordId: String(enrollment.id),
        changes: body,
        req,
    });
    res.status(201).json({ data: enrollment });
});
//# sourceMappingURL=enrollments.js.map