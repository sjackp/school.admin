import type { Request } from "express";
interface AuditParams {
    adminUserId: number | null;
    action: string;
    tableName: string;
    recordId: string;
    changes: Record<string, unknown> | null;
    req?: Request;
}
export declare function writeAuditLog({ adminUserId, action, tableName, recordId, changes, req, }: AuditParams): Promise<void>;
export {};
//# sourceMappingURL=audit.d.ts.map