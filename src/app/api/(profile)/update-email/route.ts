import Database from "@/lib/designPatterns/singletonPatterns/dbConnection";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, email } = body;
        const pool = await Database.getInstance();
        const query = 'update users set email = @email where user_id = @userId'
        const result = await pool.request().input('email', email).input('userId', userId).query(query);
        return NextResponse.json({
            message: 'Email updated successfully', status: 200
        })
    } catch (error:any) {
         console.error("Error updating email:", error); 
        return NextResponse.json({
            message: 'An error occured', status: 500
        })
    }
}