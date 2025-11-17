import type { Request } from "express";
import { query } from "./db";
import { logger } from "../utils/logger";

interface AuditParams {
  adminUserId: number | null;
  action: string;
  tableName: string;
  recordId: string;
  changes: Record<string, unknown> | null;
  req?: Request;
}

export async function writeAuditLog({
  adminUserId,
  action,
  tableName,
  recordId,
  changes,
  req,
}: AuditParams) {
  try {
    const ip =
      (req?.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req?.socket.remoteAddress ||
      null;

    await query(
      `INSERT INTO public.audit_log (admin_user_id, action, table_name, record_id, changes, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [adminUserId, action, tableName, recordId, changes, ip]
    );
  } catch (err) {
    logger.error({ err }, "Failed to write audit log");
  }
}


