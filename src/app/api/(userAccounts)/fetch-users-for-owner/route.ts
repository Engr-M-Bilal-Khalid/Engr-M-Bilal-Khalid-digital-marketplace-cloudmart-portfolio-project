import Database from "@/lib/designPatterns/singletonPatterns/dbConnection";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { roleId } = body;
    let result, query, pool;
    pool = await Database.getInstance();
    if (!roleId) {
        return NextResponse.json({ status: 400, message: "Invalid User Role!" });
    }
    try {
        pool = await Database.getInstance();
        query = `SELECT user_id, email, created_at, emailVerified, login_count, userName FROM users WHERE role_id = @roleId`;
        result = await pool.request().input('roleId', roleId).query(query);
        console.log(roleId);
        console.log(result.recordset)
        return NextResponse.json({ status: 200, result: result.recordset });
    } catch (error) {
        console.error("DB error:", error);
        return NextResponse.json({ status: 500, message: "Internal Server Error" });
    }
}