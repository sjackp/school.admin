export interface JwtPayload {
    id: number;
    username: string;
    role: "admin" | "editor" | "viewer";
}
export declare function signJwt(payload: JwtPayload): string;
export declare function verifyJwt(token: string): JwtPayload;
//# sourceMappingURL=jwt.d.ts.map