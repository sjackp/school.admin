import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
});

export const publicEnrollmentSchema = z.object({
  student_name_ar: z.string().min(1),
  birth_date: z.string(), // ISO date, convert server-side
  gender: z.string().min(1),
  national_id: z.string().optional(),
  parent_name: z.string().min(1),
  parent_phone: z.string().min(5),
  parent_email: z.string().email().optional(),
  parent_relation: z.string().optional(),
  desired_stage: z.string().min(1),
  desired_grade: z.string().min(1),
  preferred_language: z.string().optional(),
  previous_school: z.string().optional(),
  special_needs: z.string().optional(),
  medical_conditions: z.string().optional(),
  notes: z.string().optional(),
});

export const studentFilterSchema = z.object({
  search: z.string().optional(),
  stage_ar: z.string().optional(),
  grade_ar: z.string().optional(),
  academic_year: z.string().optional(),
  gender: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(1000).default(50),
});

export const createStudentSchema = z.object({
  national_id: z.string().min(1),
  full_name_ar: z.string().min(1),
  gender: z.string().optional(),
  birth_date: z.string().optional(),
  birth_place: z.string().optional(),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  father_name: z.string().optional(),
  father_job: z.string().optional(),
  father_phone: z.string().optional(),
  mother_name: z.string().optional(),
  mother_job: z.string().optional(),
  mother_phone: z.string().optional(),
  address: z.string().optional(),
});

export const updateStudentSchema = createStudentSchema.partial().extend({
  national_id: z.string().min(1),
});

export const createEnrollmentSchema = z.object({
  student_national_id: z.string().min(1),
  academic_year: z.string().min(1),
  stage_ar: z.string().min(1),
  grade_ar: z.string().min(1),
  class_label: z.string().optional(),
  school_name_ar: z.string().optional(),
  school_affiliation: z.string().optional(),
  governorate: z.string().optional(),
  directorate: z.string().optional(),
  school_serial: z.string().optional(),
  seq_in_grade: z.number().optional(),
  student_code: z.string().optional(),
  registration_number: z.string().optional(),
  foreign_language_ar: z.string().optional(),
  enrollment_status_ar: z.string().optional(),
  integration_status_ar: z.string().optional(),
  age_october_days: z.number().optional(),
  age_october_months: z.number().optional(),
  age_october_years: z.number().optional(),
});

export const updateEnrollmentSchema = createEnrollmentSchema.extend({
  id: z.number().int().positive(),
});


