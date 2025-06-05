import Database from "@/lib/designPatterns/singletonPatterns/dbConnection";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, userRole } = body;

        if (!userId || !userRole) {
            return NextResponse.json({
                status: 400,
                message: 'userId and userRole are required',
            });
        }

        const query = `
            UPDATE Users 
            SET 
                emailVerified = 1,
                verification_code = NULL,
                code_expiration = NULL,
                code_timestamp = NULL
            OUTPUT INSERTED.user_id, INSERTED.email, INSERTED.emailVerified
            WHERE user_id = @userId
        `;

        const pool = await Database.getInstance();
        const result = await pool.request()
            .input('userId', userId)
            .query(query);

        if (result.recordset.length === 0) {
            return NextResponse.json({
                status: 404,
                message: 'User not found',
            });
        }

        // If role is seller, update seller's status
        if (userRole === 'seller') {
            const sellerQuery = `UPDATE sellers SET status = 'verified' WHERE user_id = @userId`;
            await pool.request().input('userId', userId).query(sellerQuery);

            return NextResponse.json({
                status: 201,
                message: 'Seller account verified successfully',
                result: result.recordset[0],
            });
        }

        return NextResponse.json({
            status: 200,
            message: 'Account verified successfully',
            result: result.recordset[0],
        });

    } catch (error: any) {
        console.error("Verification error:", error);
        return NextResponse.json({
            status: 500,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
}
