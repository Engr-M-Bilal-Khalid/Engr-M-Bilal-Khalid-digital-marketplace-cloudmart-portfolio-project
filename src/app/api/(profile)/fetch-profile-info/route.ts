import Database from "@/lib/designPatterns/singletonPatterns/dbConnection";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const fetchprofileInfoSchema = z.object({
    userRole: z.string(),
    userId: z.number().int(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, userRole } = fetchprofileInfoSchema.parse(body);
        const pool = await Database.getInstance();
        const query = 'select * from users where user_id = @userId'
        const result = await pool.request().input('userId', userId).query(query);
        if (result.recordset && result.recordset.length > 0) {
            const userProfile = {
                userId:result.recordset[0].user_id,
                userName: result.recordset[0].userName,
                email: result.recordset[0].email,
                password: result.recordset[0].password,
                lastLoginAt:result.recordset[0].last_login_at,
                failedLoginAttempt:result.recordset[0].failed_login_attempts,
                loginCount:result.recordset[0].login_count,
                emailVerified:result.recordset[0].emailVerified,
            };
         return NextResponse.json(
                {
                    message: 'Profile Info fetch successfully',
                    result: userProfile,
                    status: 200
                }
            )
        }
        } catch (error) {
            return NextResponse.json(
                { message: 'Internal server error', error: 'An unexpected error occurred' },
                { status: 500 }
            );
        }
    }