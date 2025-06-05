import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import Database from '@/lib/designPatterns/singletonPatterns/dbConnection';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
    try {
        const { email, code } = await req.json();

        const pool = await Database.getInstance();

        try {
            if (!email || !code) {
                return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
            }
            // 1. Find the user by email
            const userResult = await pool.request().input('email', sql.VarChar, email).query(`
                SELECT user_id, email, emailVerified, verification_code, code_expiration
                FROM users
                WHERE email = @email
            `);

            const user = userResult.recordset[0];

            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            // 2. Get the stored verification code and expiration from the database
            const compareCode = await bcrypt.compare(code, user.verification_code);
            console.log("compareCode is", compareCode);
            const codeExpiration = user.code_expiration;
            const emailVerified = user.emailVerified;
            

            // 3. Check if the email is already verified
            if (emailVerified) {
                return NextResponse.json({ message: 'Email already verified' }, { status: 200 });
            }

            // 4. Check if code is correct and not expired
            const now = new Date();
            if (compareCode  && codeExpiration && codeExpiration > now) {
                // 5. Mark email as verified and clear verification data
                const updateResult = await pool.request().input('email', sql.VarChar, email).query(`
                    UPDATE users
                    SET emailVerified = 1, verification_code = NULL, code_expiration = NULL
                    WHERE email = @email
                `);

                // Check if the update was successful
                if (updateResult.rowsAffected[0] === 0) {
                    return NextResponse.json({ error: 'Failed to update user verification status' }, { status: 500 });
                }

                return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 });
            } else {
                return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
            }
        } catch (error: any) {
            console.error("Database Query Error:", error);
            return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
        }
    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}