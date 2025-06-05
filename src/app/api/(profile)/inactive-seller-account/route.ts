import Database from "@/lib/designPatterns/singletonPatterns/dbConnection";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    const body = await req.json();
    const {userId} = body;
    let query,pool,result;
    query = `update sellers set status = 'not_verified' output inserted.status where user_id = @userId`;
    pool = await Database.getInstance();
    result = await pool.request().input('userId',userId).query(query);
    console.log(result.recordset[0]);
    return NextResponse.json({
        message:'Your account is successfully deactivate !',
        status:200,
        result:result.recordset[0]
    })
}