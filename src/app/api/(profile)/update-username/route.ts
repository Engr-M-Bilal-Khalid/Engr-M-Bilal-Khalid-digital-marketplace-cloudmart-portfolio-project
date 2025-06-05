import Database from "@/lib/designPatterns/singletonPatterns/dbConnection";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, userName } = body;
        const pool = await Database.getInstance();
        const query = 'update users set userName = @userName where user_id = @userId'
        const result = await pool.request().input('userName', userName).input('userId', userId).query(query);
        return NextResponse.json({
            message: 'UserName updated successfully', status: 200
        })
    } catch (error:any) {
         console.error("Error updating userName:", error); 
        return NextResponse.json({
            message: 'An error occured', status: 500
        })
    }
}