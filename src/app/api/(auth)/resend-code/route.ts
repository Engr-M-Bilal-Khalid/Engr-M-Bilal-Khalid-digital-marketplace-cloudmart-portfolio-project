import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import Database from '@/lib/designPatterns/singletonPatterns/dbConnection'; // Adjust the path if needed
import crypto from 'crypto'; // Import uuid for generating new verification codes

// Function to send email (replace with your actual email sending logic)
const sendEmail = async (email: string, code: string) => {
    //  Implement your email sending logic here.
    //  This is a placeholder.  You would typically use a library like Nodemailer or SendGrid.
    console.log(`Sending email to ${email} with code: ${code}`); // REMOVE THIS LINE
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate email sending delay
    // throw new Error("Failed to send email"); //Uncomment this line to test error
};

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const pool = await Database.getInstance();

        // 1. Find the user by email
        const userResult = await pool.request().input('email', sql.VarChar, email).query(`
            SELECT user_id, email, emailVerified
            FROM users
            WHERE email = @email
        `);

        const user = userResult.recordset[0];

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Check if the email is already verified
        if (user.emailVerified) {
            return NextResponse.json({ message: 'Email already verified' }, { status: 200 });
        }

        // 3. Generate a new verification code
        const newVerificationCode = crypto.randomInt(100000, 999999).toString();
        
    
        const codeExpiration = new Date(Date.now() + 1 * 60 * 1000);

        // 4. Update the user's record with the new code and expiration
        const updateResult = await pool.request()
            .input('email', sql.VarChar, email)
            .input('verification_code', sql.VarChar, newVerificationCode)
            .input('code_expiration', sql.DateTime, codeExpiration)
            .query(`
                UPDATE users
                SET verification_code = @verification_code, code_expiration = @code_expiration
                WHERE email = @email
            `);

        if (updateResult.rowsAffected[0] === 0) {
            return NextResponse.json({ error: 'Failed to update verification code' }, { status: 500 });
        }

        // 5. Send the email with the new verification code
        await sendEmail(email, newVerificationCode);

        return NextResponse.json({ message: 'Verification code resent successfully.  Check your email.' }, { status: 200 });

    } catch (error: any) {
        console.error("Resend Code API Error:", error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
