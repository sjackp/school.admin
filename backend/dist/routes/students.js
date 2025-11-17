"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentsRouter = void 0;
const express_1 = require("express");
const validate_1 = require("../middleware/validate");
const validations_1 = require("../lib/validations");
const rbac_1 = require("../middleware/rbac");
const db_1 = require("../lib/db");
const audit_1 = require("../lib/audit");
exports.studentsRouter = (0, express_1.Router)();
// List students with filters
exports.studentsRouter.get("/", (0, rbac_1.requireRole)(["admin", "editor", "viewer"]), (0, validate_1.validateQuery)(validations_1.studentFilterSchema), async (req, res) => {
    const { search, stage_ar, grade_ar, academic_year, gender, page, pageSize } = req.query;
    const where = [];
    const params = [];
    if (search) {
        params.push(`%${search}%`);
        where.push("(s.full_name_ar ILIKE $" + params.length + " OR s.national_id ILIKE $" + params.length + ")");
    }
    if (gender) {
        params.push(gender);
        where.push("s.gender = $" + params.length);
    }
    if (stage_ar) {
        params.push(stage_ar);
        where.push("e.stage_ar = $" + params.length);
    }
    if (grade_ar) {
        params.push(grade_ar);
        where.push("e.grade_ar = $" + params.length);
    }
    if (academic_year) {
        params.push(academic_year);
        where.push("e.academic_year = $" + params.length);
    }
    const offset = (page - 1) * pageSize;
    params.push(pageSize, offset);
    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
    const students = await (0, db_1.query)(`
      SELECT
        s.*,
        e.academic_year,
        e.stage_ar,
        e.grade_ar,
        e.class_label
      FROM public.students s
      LEFT JOIN public.student_enrollments e
        ON e.student_national_id = s.national_id
      ${whereSql}
      ORDER BY s.full_name_ar
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);
    res.json({ data: students.rows });
});
// Create student
exports.studentsRouter.post("/", (0, rbac_1.requireRole)(["admin", "editor"]), (0, validate_1.validateBody)(validations_1.createStudentSchema), async (req, res) => {
    const body = req.body;
    await (0, db_1.query)(`
      INSERT INTO public.students (
        national_id,
        full_name_ar,
        gender,
        birth_date,
        birth_place,
        nationality,
        religion,
        father_name,
        father_job,
        father_phone,
        mother_name,
        mother_job,
        mother_phone,
        address
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
      )
    `, [
        body.national_id,
        body.full_name_ar,
        body.gender || null,
        body.birth_date || null,
        body.birth_place || null,
        body.nationality || null,
        body.religion || null,
        body.father_name || null,
        body.father_job || null,
        body.father_phone || null,
        body.mother_name || null,
        body.mother_job || null,
        body.mother_phone || null,
        body.address || null,
    ]);
    await (0, audit_1.writeAuditLog)({
        adminUserId: req.user?.id ?? null,
        action: "create",
        tableName: "students",
        recordId: body.national_id,
        changes: body,
        req,
    });
    res.status(201).json({ success: true });
});
// Get student by national_id
exports.studentsRouter.get("/:id", (0, rbac_1.requireRole)(["admin", "editor", "viewer"]), async (req, res) => {
    const { id } = req.params;
    const student = await (0, db_1.query)(`SELECT * FROM public.students WHERE national_id = $1`, [
        id,
    ]);
    if (!student.rows[0]) {
        res.status(404).json({ error: "Student not found" });
        return;
    }
    const enrollments = await (0, db_1.query)(`SELECT * FROM public.student_enrollments WHERE student_national_id = $1 ORDER BY academic_year DESC`, [id]);
    res.json({ student: student.rows[0], enrollments: enrollments.rows });
});
// Update student
exports.studentsRouter.put("/:id", (0, rbac_1.requireRole)(["admin", "editor"]), (0, validate_1.validateBody)(validations_1.updateStudentSchema), async (req, res) => {
    const { id } = req.params;
    const body = req.body;
    const existing = await (0, db_1.query)(`SELECT * FROM public.students WHERE national_id = $1`, [
        id,
    ]);
    if (!existing.rows[0]) {
        res.status(404).json({ error: "Student not found" });
        return;
    }
    await (0, db_1.query)(`
      UPDATE public.students SET
        full_name_ar = $1,
        gender = $2,
        birth_date = $3,
        birth_place = $4,
        nationality = $5,
        religion = $6,
        father_name = $7,
        father_job = $8,
        father_phone = $9,
        mother_name = $10,
        mother_job = $11,
        mother_phone = $12,
        address = $13
      WHERE national_id = $14
    `, [
        body.full_name_ar ?? existing.rows[0].full_name_ar,
        body.gender ?? existing.rows[0].gender,
        body.birth_date ?? existing.rows[0].birth_date,
        body.birth_place ?? existing.rows[0].birth_place,
        body.nationality ?? existing.rows[0].nationality,
        body.religion ?? existing.rows[0].religion,
        body.father_name ?? existing.rows[0].father_name,
        body.father_job ?? existing.rows[0].father_job,
        body.father_phone ?? existing.rows[0].father_phone,
        body.mother_name ?? existing.rows[0].mother_name,
        body.mother_job ?? existing.rows[0].mother_job,
        body.mother_phone ?? existing.rows[0].mother_phone,
        body.address ?? existing.rows[0].address,
        id,
    ]);
    await (0, audit_1.writeAuditLog)({
        adminUserId: req.user?.id ?? null,
        action: "update",
        tableName: "students",
        recordId: String(id),
        changes: { before: existing.rows[0], after: body },
        req,
    });
    res.json({ success: true });
});
// Delete student
exports.studentsRouter.delete("/:id", (0, rbac_1.requireRole)(["admin"]), async (req, res) => {
    const { id } = req.params;
    const existing = await (0, db_1.query)(`SELECT * FROM public.students WHERE national_id = $1`, [
        id,
    ]);
    if (!existing.rows[0]) {
        res.status(404).json({ error: "Student not found" });
        return;
    }
    await (0, db_1.query)(`DELETE FROM public.students WHERE national_id = $1`, [id]);
    await (0, audit_1.writeAuditLog)({
        adminUserId: req.user?.id ?? null,
        action: "delete",
        tableName: "students",
        recordId: String(id),
        changes: { before: existing.rows[0] },
        req,
    });
    res.json({ success: true });
});
//# sourceMappingURL=students.js.map