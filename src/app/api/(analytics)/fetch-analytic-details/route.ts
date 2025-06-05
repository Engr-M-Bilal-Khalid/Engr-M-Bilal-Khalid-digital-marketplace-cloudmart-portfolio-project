import Database from "@/lib/designPatterns/singletonPatterns/dbConnection";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
     const pool = await Database.getInstance(); 
    const body = await req.json();
    const {userRole,userId} = body;
    console.log(userId, userRole)
        if (userRole === 'seller' && userId) {
            const selectedSellerId = await pool.request().input('userId', userId).query("select seller_id from sellers where user_id = @userId");
            const sellerId = selectedSellerId.recordset[0].seller_id;
            console.log(`Extracted Seller Id id ${sellerId}`);
    
            const orderDetailQuery = "select o.order_date,p.price,p.seller_price,p.platform_price from orders o join customers c on o.customer_id = c.customer_id join users u on c.user_id = u.user_id join order_items oi on o.order_id = oi.order_id join products p on oi.product_id = p.product_id where p.seller_id = @sellerId";
            const orderDetail = await pool.request().input('sellerId', sellerId).query(orderDetailQuery);
            console.log(orderDetail.recordset);
    
            return NextResponse.json({ status: 200, orderDetail:orderDetail.recordset ,sellerId})
        }else if(userRole === 'owner' && userId){
            const query = 'select total_amount as price,created_at as order_date,seller_amount as seller_price,platform_fee as platform_price from orders';
            const result = await pool.request().query(query);
            console.log(result.recordset);
            return NextResponse.json({ status: 201, result:result.recordset})
        }
}