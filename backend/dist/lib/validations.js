"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEnrollmentSchema = exports.createEnrollmentSchema = exports.updateStudentSchema = exports.createStudentSchema = exports.studentFilterSchema = exports.publicEnrollmentSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1),
    password: zod_1.z.string().min(6),
});
exports.publicEnrollmentSchema = zod_1.z.object({
    student_name_ar: zod_1.z.string().min(1),
    birth_date: zod_1.z.string(), // ISO date, convert server-side
    gender: zod_1.z.string().min(1),
    national_id: zod_1.z.string().optional(),
    parent_name: zod_1.z.string().min(1),
    parent_phone: zod_1.z.string().min(5),
    parent_email: zod_1.z.string().email().optional(),
    parent_relation: zod_1.z.string().optional(),
    desired_stage: zod_1.z.string().min(1),
    desired_grade: zod_1.z.string().min(1),
    preferred_language: zod_1.z.string().optional(),
    previous_school: zod_1.z.string().optional(),
    special_needs: zod_1.z.string().optional(),
    medical_conditions: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.studentFilterSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    stage_ar: zod_1.z.string().optional(),
    grade_ar: zod_1.z.string().optional(),
    academic_year: zod_1.z.string().optional(),
    gender: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(50),
});
exports.createStudentSchema = zod_1.z.object({
    national_id: zod_1.z.string().min(1),
    full_name_ar: zod_1.z.string().min(1),
    gender: zod_1.z.string().optional(),
    birth_date: zod_1.z.string().optional(),
    birth_place: zod_1.z.string().optional(),
    nationality: zod_1.z.string().optional(),
    religion: zod_1.z.string().optional(),
    father_name: zod_1.z.string().optional(),
    father_job: zod_1.z.string().optional(),
    father_phone: zod_1.z.string().optional(),
    mother_name: zod_1.z.string().optional(),
    mother_job: zod_1.z.string().optional(),
    mother_phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
});
exports.updateStudentSchema = exports.createStudentSchema.partial().extend({
    national_id: zod_1.z.string().min(1),
});
exports.createEnrollmentSchema = zod_1.z.object({
    student_national_id: zod_1.z.string().min(1),
    academic_year: zod_1.z.string().min(1),
    stage_ar: zod_1.z.string().min(1),
    grade_ar: zod_1.z.string().min(1),
    class_label: zod_1.z.string().optional(),
    school_name_ar: zod_1.z.string().optional(),
    school_affiliation: zod_1.z.string().optional(),
    governorate: zod_1.z.string().optional(),
    directorate: zod_1.z.string().optional(),
    school_serial: zod_1.z.string().optional(),
    seq_in_grade: zod_1.z.number().optional(),
    student_code: zod_1.z.string().optional(),
    registration_number: zod_1.z.string().optional(),
    foreign_language_ar: zod_1.z.string().optional(),
    enrollment_status_ar: zod_1.z.string().optional(),
    integration_status_ar: zod_1.z.string().optional(),
    age_october_days: zod_1.z.number().optional(),
    age_october_months: zod_1.z.number().optional(),
    age_october_years: zod_1.z.number().optional(),
});
exports.updateEnrollmentSchema = exports.createEnrollmentSchema.extend({
    id: zod_1.z.number().int().positive(),
});
//# sourceMappingURL=validations.js.map