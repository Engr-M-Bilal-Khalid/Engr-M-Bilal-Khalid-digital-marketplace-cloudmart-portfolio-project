import Database from "@/lib/designPatterns/singletonPatterns/dbConnection";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { password, email } = body;
    let pool, result, query;
    query = `select email,password,role_id from users where email = @email and role_id = 1`;
    pool = await Database.getInstance();
    result = (await pool.request().input('email', email).query(query));
    console.log(result.recordset[0]);
    const userRecord = result.recordset[0];
    if (userRecord) {
        const passwordMatches = await bcrypt.compare(password, userRecord.password);
        if (passwordMatches) {
            return NextResponse.json(
                {
                    message:'Password verified successfully',
                    status: 200
                })
        }
        return NextResponse.json(
            {
                message: 'Invalid password',
                status: 400
            })
    }
    return NextResponse.json({
        message: 'User not found',
        status: 500
    })

}