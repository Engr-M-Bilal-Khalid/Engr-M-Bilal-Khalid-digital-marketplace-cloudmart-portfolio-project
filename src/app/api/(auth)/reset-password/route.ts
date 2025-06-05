import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import sql from 'mssql';
import bcrypt from 'bcrypt';
import Database from '@/lib/designPatterns/singletonPatterns/dbConnection';

// Schema for reset password request
const resetPasswordSchema = z.object({
    token: z.string().min(64), //  Expect the full hashed token (length of sha256 hash)
    newPassword: z.string().min(8).max(8).regex(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token, newPassword } = resetPasswordSchema.parse(body);

    

        console.log('Token:', token);

        const pool = await Database.getInstance();

        // 1. Find the user by the reset token
        const result = await pool.request()
            .input('token', sql.VarChar, token)
            .query(`
                SELECT user_id, email, reset_password_token_expiration
                FROM users
                WHERE reset_password_token = @token
            `);

        const user = result.recordset[0];

        if (!user) {
            return NextResponse.json({ message: 'Invalid or expired reset token.' }, { status: 400 });
        }

        // 2. Check if the token has expired
        const now = new Date();
        if (user.reset_password_token_expiration < now) {
            //  Clear the expired token
             await pool.request()
                .input('userId', sql.Int, user.user_id)
                .query(`
                    UPDATE users
                    SET reset_password_token = NULL, reset_password_token_expiration = NULL
                    WHERE user_id = @userId
                `);
            return NextResponse.json({ message: 'Reset token has expired.' }, { status: 400 });
        }

        // 3. Hash the new password
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // 4. Update the user's password in the database, and clear the reset token
        const updateResult = await pool.request()
            .input('userId', sql.Int, user.user_id)
            .input('newPassword', sql.VarChar, hashedNewPassword)
            .query(`
                UPDATE users
                SET password = @newPassword, reset_password_token = NULL, reset_password_token_expiration = NULL
                WHERE user_id = @userId
            `);

        if (updateResult.rowsAffected[0] === 0) {
            return NextResponse.json({ message: 'Failed to update password.' }, { status: 500 }); //should this be 500?
        }

        // 5. Optionally, send a success email to the user
        // (You can add your email sending logic here)

        return NextResponse.json({ message: 'Password reset successfully.' }, { status: 200 });

    } catch (error: any) {
        console.error('Reset Password Error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: 'Validation error', errors: error.errors }, { status: 400 });
        }
        return NextResponse.json(
            { message: 'Internal server error', error: error.message || 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
