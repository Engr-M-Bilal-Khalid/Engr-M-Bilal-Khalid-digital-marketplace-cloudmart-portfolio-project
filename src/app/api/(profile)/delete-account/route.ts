import Database from "@/lib/designPatterns/singletonPatterns/dbConnection";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId } = body;
        const pool = await Database.getInstance();
        const result = await pool.request()
            .input('userId', userId) // This line specifies the userId
            .execute('DeleteCust');
        return NextResponse.json({
            message: 'Account deleted successfully', status: 200
        })
    } catch (error: any) {
        console.error("Error in deleting account:", error);
        return NextResponse.json({
            message: 'An error occured', status: 500
        })
    }
}