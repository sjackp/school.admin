import { Pool, type QueryResultRow } from "pg";
export declare const pool: Pool;
export declare function query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<{
    rows: T[];
}>;
//# sourceMappingURL=db.d.ts.map