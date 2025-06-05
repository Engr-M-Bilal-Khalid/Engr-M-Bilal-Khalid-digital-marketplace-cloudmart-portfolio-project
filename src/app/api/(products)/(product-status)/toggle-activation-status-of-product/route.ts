import Database from "@/lib/designPatterns/singletonPatterns/dbConnection";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    let { productId, value } = body;
    let pool, result;
    pool = await Database.getInstance();
    value = value.toLowerCase();
    if (value === 'active') { 
        result = await pool.request().input('productId', productId).query("UPDATE products SET activation_status = 'active' Output inserted.product_id, inserted.status WHERE product_id = @productId");
        return NextResponse.json({
            status: 201,
            message: "The product status has been successfully changed from inactive to active!",
        })
    }
    else if (value === 'inactive') {
        result = await pool.request().input('productId', productId).query("UPDATE products SET activation_status = 'inactive' Output inserted.product_id, inserted.status WHERE product_id = @productId");
        return NextResponse.json({
            status: 200,
            message: "The product status has been successfully changed from active to inactive!",
        })
    }
    else {
        return NextResponse.json({
            status: 500,
            message: "The product status has not been changed! Please try again.",
        })
     }

}