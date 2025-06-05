import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import sql from 'mssql';
import bcrypt from 'bcrypt';
import Database from '@/lib/designPatterns/singletonPatterns/dbConnection';
import { RoleFactory } from '@/lib/designPatterns/factoryPattern/RoleFactory';
import { Resend } from 'resend';
import crypto from 'crypto';


const resend = new Resend(process.env.RESEND_API_KEY);

const signUpSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8).max(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8}$/),
    confirmPassword: z.string(),
    role: z.enum(['customer', 'seller', 'admin']),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

// Function to generate a random verification code
const generateVerificationCode = () => {
    return crypto.randomInt(100000, 999999).toString();
};

const hashVerificationCode = async (code: string) => {
    const saltRounds = 10; // You can adjust rounds for more/less security
    const hashedCode = await bcrypt.hash(code, saltRounds);
    return hashedCode;
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, password, role } = signUpSchema.parse(body);

        const pool = await Database.getInstance();

        // Check for existing email
        const emailCheckResult = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT email FROM users WHERE email = @email');

        if (emailCheckResult.recordset.length > 0) {
            return NextResponse.json({ message: 'Email address is already taken.' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Get role ID
        const roleResult = await pool.request()
            .input('roleName', sql.VarChar, role)
            .query('SELECT role_id FROM user_roles WHERE role_name = @roleName');

        if (roleResult.recordset.length === 0) {
            return NextResponse.json({ message: 'Role not found.' }, { status: 400 });
        }
        const role_id = roleResult.recordset[0].role_id;
        console.log("Role ID:", role_id);

        // Generate Verification Code
        const code = generateVerificationCode();
        const verificationCode = await hashVerificationCode(code);
        const codeTimestamp = new Date();
        const codeExpiration = new Date(codeTimestamp.getTime() + 60 * 1000); // 1 minute expiration


        // Insert user
        const insertUserResult = await pool.request()
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, hashedPassword)
            .input('role_id', sql.Int, role_id)
            .input('created_at', sql.DateTime, new Date())
            .input('verificationCode', sql.VarChar, verificationCode) // Store verification code
            .input('codeTimestamp', sql.DateTime, codeTimestamp)
            .input('codeExpiration', sql.DateTime, codeExpiration)
            .input('userName', sql.VarChar, name) // Store code expiration
            .query('INSERT INTO users (email, password, role_id, created_at, verification_code, code_timestamp, code_expiration, userName) OUTPUT INSERTED.user_id, INSERTED.email, INSERTED.role_id VALUES(@email, @password, @role_id, @created_at, @verificationCode, @codeTimestamp, @codeExpiration, @userName)');

        const user_id = insertUserResult.recordset[0].user_id;
        const insertedEmail = insertUserResult.recordset[0].email;
        const insertedRoleId = insertUserResult.recordset[0].role_id;

        const stripeAccountIdPlaceHolder = 'placeholder'



        // Insert into role-specific table
        const userRoleInstance = RoleFactory.createRole(role);
        console.log(user_id, " and ", role_id)
        await userRoleInstance.insertRoleSpecificData(pool, user_id);

        if (role_id === 3) {
            const additionalQueryResult = await pool.request()
                .input('userId', sql.Int, user_id)
                .input('stripeAccountIdPlaceHolder', stripeAccountIdPlaceHolder)
                .query('UPDATE SELLERS SET stripe_account_id = @stripeAccountIdPlaceHolder where user_id = @userId'); // Replace with your actual query
            console.log("Additional Query Result for role 3:", additionalQueryResult.recordset);
            // You can process the results of this query as needed
        }

        // Send the verification email
        try {
            const emailResult = await resend.emails.send({
                from: 'Cloudmart <onboarding@resend.dev>', // Use your verified email.
                to: [email],
                subject: 'Verify Your Email Address',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
                    <h2 style="color: #333;">Welcome to Cloudmart A Digital Marketplace!</h2>
                        <p style="font-size: 16px; color: #555;">
                                    To complete your sign-up, please use the verification code below:
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="display: inline-block; font-size: 24px; font-weight: bold; padding: 10px 20px; background-color: #4f46e5; color: white; border-radius: 8px;">
                            ${code}
                            </span>
                        </div>
                        <p style="font-size: 14px; color: #777;">
                            This code will expire in 10 minutes. If you didn’t request this, please ignore this email.
                        </p>
                        <p style="font-size: 14px; color: #777;">Thanks,<br>The Digital Marketplace Team</p>
                </div>
  `,
            });
            console.log("Email sent", emailResult);

        } catch (error: any) {
            console.error('Error sending verification email:', error);
            //  IMPORTANT:  Consider whether to fail the *entire* signup, or just log the error and let the user proceed.  If you fail the signup, you'll need to handle deleting the user you just created.
            return NextResponse.json({ error: 'Failed to send verification email.  Account created, but please request a new verification code.' }, { status: 500 }); //  Modified error message
        }

        // Send success response
        return NextResponse.json(
            { message: 'User created successfully. Verification email sent', user: { email: insertedEmail, role_id: insertedRoleId, user_id: user_id } }, // Include user_id
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Sign Up Error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: 'Validation error', errors: error.errors }, { status: 400 });
        }
        return NextResponse.json(
            { message: 'Internal server error', error: error.message || 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}

