import Database from "@/lib/designPatterns/singletonPatterns/dbConnection";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { itemId, productId, cartId } = body;
    try {
        let query, result, pool;
        pool = await Database.getInstance();
        query = 'delete from cart_items where item_id = @itemId and product_id = @productId and cart_id = @cartId';
        result = await pool.request().input('itemId', itemId).input('productId', productId).input('cartId', cartId).query(query);
        return NextResponse.json({
            message: result.rowsAffected[0] > 0 ? "Item removed from cart successfully." : "Item not found in cart.",
            status: 200
        });
    } catch (error) {
        return NextResponse.json({
            message:'Internal server error: ' + error,
            status: 500
        })
    }
}