import Database from "@/lib/designPatterns/singletonPatterns/dbConnection";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    const body = await req.json();
    const {cartId} = body;
   const query = "SELECT ci.item_id,ci.cart_id,ci.quantity,p.product_id, p.description, p.price, p.product_name,p.digital_asset_url, p.seller_id,p.stripe_price_id,p.stripe_product_id, pi.image_url, s.stripe_account_id FROM carts c JOIN cart_items ci ON c.cart_id = ci.cart_id JOIN products p ON ci.product_id = p.product_id JOIN (SELECT product_id, MIN(image_url) AS image_url FROM product_images GROUP BY product_id) pi ON p.product_id = pi.product_id JOIN sellers s on p.seller_id = s.seller_id WHERE c.cart_id = @cartId";
    const pool = await Database.getInstance();
    const result = await pool.request().input('cartId',cartId).query(query);
    console.log(result);
    console.log(result.recordset)
    return NextResponse.json({
        status:200,
        cartItems:result.recordset
    })
}

