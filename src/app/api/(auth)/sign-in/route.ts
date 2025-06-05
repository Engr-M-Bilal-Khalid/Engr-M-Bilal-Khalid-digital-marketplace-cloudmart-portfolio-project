import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import Database from '@/lib/designPatterns/singletonPatterns/dbConnection';
import SessionManager from '@/lib/designPatterns/singletonPatterns/sign-in-sessionManager'; // Import the SessionManager
import { cookies } from 'next/headers';
import sql from 'mssql';


// Define the schema for sign-in data validation
const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(8),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = signInSchema.parse(body);

        const pool = await Database.getInstance();

        // Retrieve user from the database by email
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT user_id, email, password, role_id, failed_login_attempts, login_count FROM users WHERE email = @email');

        const user = result.recordset[0];

        if (!user) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            // Increment login attempts on failed login
            await pool.request()
                .input('user_id', sql.Int, user.user_id)
                .query('UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE user_id = @user_id');

            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        // Reset login attempts on successful login
        await pool.request()
            .input('user_id', sql.Int, user.user_id)
            .query('UPDATE users SET failed_login_attempts = 0 WHERE user_id = @user_id');

        // Increment login_count on successful login
        await pool.request()
            .input('user_id', sql.Int, user.user_id)
            .query('UPDATE users SET login_count = login_count + 1 WHERE user_id = @user_id');

        // Get the role for the user
        const roleResult = await pool.request()
            .input('role_id', sql.Int, user.role_id)
            .query('SELECT role_name FROM user_roles WHERE role_id = @role_id');

        const roleName = roleResult.recordset[0]?.role_name;

        const userForResponse = {
            user_id: user.user_id,
            email: user.email,
            role: roleName,
            roleId: user.role_id
        };

        if (user.role_id === 3) {
            const statusChkOfSeller = await pool.request().input('userId', user.user_id).query('select status from sellers where user_id = @userId');
            console.log(statusChkOfSeller.recordset[0].status);
            if (statusChkOfSeller.recordset[0].status === 'not_verified') {
                return NextResponse.json({
                    message: 'Seller account is not verified. Please contact the admin for verification.',
                    status: 403,
                    result: statusChkOfSeller.recordset[0].status,
                })
            }
        }

        // Use SessionManager to create the session
        const sessionManager = SessionManager.getInstance();
        const sessionToken = await sessionManager.createSession(user.user_id);

        // Update last login timestamp in users table
        await pool.request()
            .input('user_id', sql.Int, user.user_id)
            .query('UPDATE users SET last_login_at = GETDATE() WHERE user_id = @user_id');

        const cookieValue = JSON.stringify({
            sessionToken: sessionToken,
            userId: user.user_id,
            userRole:roleName 
        });


        // 🍪 Set session-token cookie
        const cookieStore = await cookies();
        cookieStore.set({
            name: 'session-token',
            value: cookieValue,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });

        return NextResponse.json({ message: 'Login successful', user: userForResponse }, { status: 200 });

    } catch (error: any) {
        console.error('Sign In Error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: 'Validation error', errors: error.errors }, { status: 400 });
        }
        return NextResponse.json(
            { message: 'Internal server error', error: error.message || 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
