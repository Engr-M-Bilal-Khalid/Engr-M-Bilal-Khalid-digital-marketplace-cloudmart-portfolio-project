import Database from "@/lib/designPatterns/singletonPatterns/dbConnection";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { productId, value } = body;
    let pool, result, query;
    pool = await Database.getInstance();
    try {
        if (value === 'approved' || value === 'rejected') {
            query = `UPDATE products SET status = @value OUTPUT inserted.status WHERE product_id = @productId`;
            result = await pool.request().input('value', value).input('productId', productId).query(query);
            console.log(result.recordset[0].status);
            const updatedStatus = result.recordset[0].status.toUpperCase();
            return NextResponse.json(
                {
                    message: `Status : ${updatedStatus}`,
                    result: result.rowsAffected,
                },
                { status: 200 }
            )
        }
    } catch (error) {
        return NextResponse.json(
            {
                message: error instanceof Error ? error.message : 'An unexpected error occurred',
                result: result,
                status: 501
            }
        )
    }
}