import Database from "@/lib/designPatterns/singletonPatterns/dbConnection";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    const body = await req.json();
    const {cartId,userId} = body;
    console.log(cartId,userId);
    const query1 = "select customer_id from customers  where user_id = @userId";
    const pool = await Database.getInstance();
    const result = await pool.request().input('userId',userId).query(query1);
    console.log(result.recordset[0].customer_id);
    const customerId = result.recordset[0].customer_id;
    const query2 = "UPDATE carts SET customer_id = @customerId, session_id = NULL WHERE cart_id = @cartId";
    const result2 = await pool.request().input('customerId',customerId).input('cartId',cartId).query(query2);
    console.log(result2)
    return NextResponse.json({
        status:200,
        cartId:cartId
    })
}