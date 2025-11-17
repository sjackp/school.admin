"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicRouter = void 0;
const express_1 = require("express");
const validations_1 = require("../lib/validations");
const validate_1 = require("../middleware/validate");
const rateLimit_1 = require("../middleware/rateLimit");
const db_1 = require("../lib/db");
const PUBLIC_API_KEY = process.env.PUBLIC_API_KEY;
exports.publicRouter = (0, express_1.Router)();
exports.publicRouter.post("/enroll", rateLimit_1.publicEnrollRateLimiter, (0, validate_1.validateBody)(validations_1.publicEnrollmentSchema), async (req, res) => {
    if (!PUBLIC_API_KEY) {
        res.status(500).json({ error: "Public API key not configured" });
        return;
    }
    const apiKey = req.headers["x-api-key"];
    if (apiKey !== PUBLIC_API_KEY) {
        res.status(401).json({ error: "Invalid API key" });
        return;
    }
    const { student_name_ar, birth_date, gender, national_id, parent_name, parent_phone, parent_email, parent_relation, desired_stage, desired_grade, preferred_language, previous_school, special_needs, medical_conditions, notes, } = req.body;
    const submissionIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        null;
    const userAgent = req.headers["user-agent"] || null;
    await (0, db_1.query)(`INSERT INTO public.enrollment_submissions (
        student_name_ar,
        birth_date,
        gender,
        national_id,
        parent_name,
        parent_phone,
        parent_email,
        parent_relation,
        desired_stage,
        desired_grade,
        preferred_language,
        previous_school,
        special_needs,
        medical_conditions,
        notes,
        status,
        submission_ip,
        user_agent
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, 'pending', $17, $18
      )`, [
        student_name_ar,
        birth_date,
        gender,
        national_id,
        parent_name,
        parent_phone,
        parent_email,
        parent_relation,
        desired_stage,
        desired_grade,
        preferred_language,
        previous_school,
        special_needs,
        medical_conditions,
        notes,
        submissionIp,
        userAgent,
    ]);
    res.status(201).json({ success: true });
});
//# sourceMappingURL=public.js.map