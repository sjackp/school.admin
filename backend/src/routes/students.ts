import { Router } from "express";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  createStudentSchema,
  updateStudentSchema,
  studentFilterSchema,
} from "../lib/validations";
import { requireRole } from "../middleware/rbac";
import { AuthRequest } from "../middleware/auth";
import { query } from "../lib/db";
import { writeAuditLog } from "../lib/audit";

export const studentsRouter = Router();

// Helper to build a broad search condition across many student/enrollment fields
function buildSearchWhere(paramIndex: number) {
  const p = `$${paramIndex}`;
  return `(
    s.full_name_ar ILIKE ${p}
    OR s.national_id ILIKE ${p}
    OR COALESCE(s.father_phone, '') ILIKE ${p}
    OR COALESCE(s.mother_phone, '') ILIKE ${p}
    OR COALESCE(s.address, '') ILIKE ${p}
    OR COALESCE(e.academic_year, '') ILIKE ${p}
    OR COALESCE(e.stage_ar, '') ILIKE ${p}
    OR COALESCE(e.grade_ar, '') ILIKE ${p}
    OR COALESCE(e.class_label, '') ILIKE ${p}
    OR COALESCE(e.student_code, '') ILIKE ${p}
    OR COALESCE(e.registration_number, '') ILIKE ${p}
  )`;
}

// Normalize search text (e.g., convert Arabic-Indic digits to ASCII)
function normalizeSearchText(value: string): string {
  const arabicDigits: Record<string, string> = {
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
  };

  return value.replace(/[٠-٩]/g, (d) => arabicDigits[d] ?? d);
}

// List students with filters
studentsRouter.get(
  "/",
  requireRole(["admin", "editor", "viewer"]),
  validateQuery(studentFilterSchema),
  async (req: AuthRequest, res) => {
    try {
      const { search, stage_ar, grade_ar, academic_year, gender, page, pageSize } =
        req.query as any;

      const where: string[] = [];
      const params: any[] = [];

      if (search && String(search).trim()) {
        const normalized = normalizeSearchText(String(search).trim());
        const pattern = `%${normalized}%`;
        params.push(pattern);
        where.push(buildSearchWhere(params.length));
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

      // Use DISTINCT ON to get one row per student (latest enrollment)
      const students = await query(
        `
        SELECT DISTINCT ON (s.national_id)
          s.*,
          e.academic_year,
          e.stage_ar,
          e.grade_ar,
          e.class_label
        FROM public.students s
        LEFT JOIN public.student_enrollments e
          ON e.student_national_id = s.national_id
        ${whereSql}
        ORDER BY s.national_id, e.academic_year DESC NULLS LAST
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `,
        params
      );

      res.json({ data: students.rows });
    } catch (err: any) {
      console.error("Error fetching students:", err);
      res.status(500).json({ error: "Internal server error", details: err.message });
    }
  }
);

// Create student
studentsRouter.post(
  "/",
  requireRole(["admin", "editor"]),
  validateBody(createStudentSchema),
  async (req: AuthRequest, res) => {
    const body = req.body as any;

    await query(
      `
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
    `,
      [
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
      ]
    );

    await writeAuditLog({
      adminUserId: req.user?.id ?? null,
      action: "create",
      tableName: "students",
      recordId: body.national_id,
      changes: body,
      req,
    });

    res.status(201).json({ success: true });
  }
);

// Get student by national_id
studentsRouter.get(
  "/:id",
  requireRole(["admin", "editor", "viewer"]),
  async (req, res) => {
    const { id } = req.params;
    const student = await query(`SELECT * FROM public.students WHERE national_id = $1`, [
      id,
    ]);
    if (!student.rows[0]) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    const enrollments = await query(
      `SELECT * FROM public.student_enrollments WHERE student_national_id = $1 ORDER BY academic_year DESC`,
      [id]
    );

    res.json({ student: student.rows[0], enrollments: enrollments.rows });
  }
);

// Update student
studentsRouter.put(
  "/:id",
  requireRole(["admin", "editor"]),
  validateBody(updateStudentSchema),
  async (req: AuthRequest, res) => {
    const { id } = req.params;
    const body = req.body as any;

    const existing = await query(`SELECT * FROM public.students WHERE national_id = $1`, [
      id,
    ]);
    if (!existing.rows[0]) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    await query(
      `
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
    `,
      [
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
      ]
    );

    await writeAuditLog({
      adminUserId: req.user?.id ?? null,
      action: "update",
      tableName: "students",
      recordId: String(id),
      changes: { before: existing.rows[0], after: body },
      req,
    });

    res.json({ success: true });
  }
);

// Delete student
studentsRouter.delete(
  "/:id",
  requireRole(["admin"]),
  async (req: AuthRequest, res) => {
    const { id } = req.params;
    const existing = await query(`SELECT * FROM public.students WHERE national_id = $1`, [
      id,
    ]);
    if (!existing.rows[0]) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    await query(`DELETE FROM public.students WHERE national_id = $1`, [id]);

    await writeAuditLog({
      adminUserId: req.user?.id ?? null,
      action: "delete",
      tableName: "students",
      recordId: String(id),
      changes: { before: existing.rows[0] },
      req,
    });

    res.json({ success: true });
  }
);


