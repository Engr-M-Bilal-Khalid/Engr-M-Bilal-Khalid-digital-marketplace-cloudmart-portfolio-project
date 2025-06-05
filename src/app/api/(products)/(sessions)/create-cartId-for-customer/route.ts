import Database from "@/lib/designPatterns/singletonPatterns/dbConnection";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { customerId } = body;
    let pool, request, response, result, query;
    try {
        query = 'INSERT INTO carts (customer_id) OUTPUT INSERTED.cart_id VALUES (@customerId)';
        pool = await Database.getInstance();
        result = await pool.request().input('customerId', customerId).query(query);
        console.log(result);
        return NextResponse.json({
            status: 200,
            message: 'Inserted customerId in carts table !',
            cartId: result.recordset[0].cart_id
        })
    } catch (error) {
        return NextResponse.json({
            status: 500,
            message: `Internal server error : ${error}`,
        })
    }
}