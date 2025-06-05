import { NextRequest, NextResponse } from "next/server";
import Database from "@/lib/designPatterns/singletonPatterns/dbConnection";

export async function POST(req: NextRequest) {
    const { productId, cartId } = await req.json();
    try {
        const pool = await Database.getInstance();

        const selectQuery = `
            SELECT * FROM cart_items 
            WHERE cart_id = @cartId AND product_id = @productId
        `;
        const selectResult = await pool
            .request()
            .input("cartId", cartId)
            .input("productId", productId)
            .query(selectQuery);

        if (selectResult.recordset.length === 0) {
            const insertQuery = `
                INSERT INTO cart_items (cart_id, product_id)
                VALUES (@cartId, @productId)
            `;
            await pool
                .request()
                .input("cartId", cartId)
                .input("productId", productId)
                .query(insertQuery);

            return NextResponse.json({
                message: "Product added to cart.",
                status: 200,
            });
        } else {
            return NextResponse.json({
                message: "You can only add 1 quantity per product!",
                status: 400,
            });
        }
    } catch (error) {
        return NextResponse.json({
            message: `Internal server error: ${error}`,
            status: 500,
        });
    }
}
