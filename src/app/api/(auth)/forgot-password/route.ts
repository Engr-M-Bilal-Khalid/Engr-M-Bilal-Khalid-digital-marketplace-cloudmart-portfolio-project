import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import sql from 'mssql';
import bcrypt from 'bcrypt';
import Database from '@/lib/designPatterns/singletonPatterns/dbConnection';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

// Schema for forgot password request
const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

// Function to generate a unique password reset token
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex'); // Generate a 64-character hex token
};


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email } = forgotPasswordSchema.parse(body);

        const pool = await Database.getInstance();

        // Check if the email exists in the database
        const emailCheckResult = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT email FROM users WHERE email = @email');

        if (emailCheckResult.recordset.length === 0) {
            return NextResponse.json({ message: 'Email address not found.' }, { status: 404 });
        }

        // Generate password reset token
        const resetToken = generateResetToken();
        const tokenTimestamp = new Date();
        const tokenExpiration = new Date(tokenTimestamp.getTime() + 60 * 60 * 1000); // 1-hour expiration

        // Store the reset token in the database
        const updateResetTokenResult = await pool.request()
            .input('email', sql.VarChar, email)
            .input('resetToken', sql.VarChar, resetToken)
            .input('tokenTimestamp', sql.DateTime, tokenTimestamp)
            .input('tokenExpiration', sql.DateTime, tokenExpiration)
            .query(`
                UPDATE users
                SET reset_password_token = @resetToken, reset_password_token_timestamp = @tokenTimestamp, reset_password_token_expiration = @tokenExpiration
                WHERE email = @email
            `);

        if (updateResetTokenResult.rowsAffected[0] === 0) {
            return NextResponse.json({ message: 'Failed to update reset token.' }, { status: 500 });
        }

        // Construct the reset link.  Include the token in the URL.
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;  //  Use environment variable

        // Send the password reset email with the link
        try {
            const emailResult = await resend.emails.send({
                from: 'Digital Marketplace <onboarding@resend.dev>', // Use your verified email.
                to: [email],
                subject: 'Password Reset Request',
                html: `<p>Please click the following link to reset your password:</p>
                       <p><a href="${resetLink}">${resetLink}</a></p>
                       <p>This link will expire in 1 hour.</p>`,
            });
            console.log("Email sent", emailResult);
        } catch (error: any) {
            console.error('Error sending password reset email:', error);
            return NextResponse.json({ error: 'Failed to send password reset email.' }, { status: 500 });
        }

        // Send success response
        return NextResponse.json({ message: 'Password reset email sent successfully.' }, { status: 200 });
    } catch (error: any) {
        console.error('Forgot Password Error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: 'Validation error', errors: error.errors }, { status: 400 });
        }
        return NextResponse.json(
            { message: 'Internal server error', error: error.message || 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}

