import Database from "@/lib/designPatterns/singletonPatterns/dbConnection";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const pool = await Database.getInstance();
    const body = await req.json();
    const { userId, userRole } = body;
    console.log(userId, userRole)
    if (userRole === 'seller' && userId) {
        const selectedSellerId = await pool.request().input('userId', userId).query("select seller_id from sellers where user_id = @userId");
        const sellerId = selectedSellerId.recordset[0].seller_id;
        console.log(`Extracted Seller Id id ${sellerId}`);

        const orderDetailQuery = "select o.order_id,o.customer_id,u.userName,u.email, o.order_date,o.order_status,o.payment_method,oi.quantity,p.product_name,p.price,p.seller_price,p.platform_price from orders o join customers c on o.customer_id = c.customer_id join users u on c.user_id = u.user_id join order_items oi on o.order_id = oi.order_id join products p on oi.product_id = p.product_id where p.seller_id = @sellerId";
        const orderDetail = await pool.request().input('sellerId', sellerId).query(orderDetailQuery);
        console.log(orderDetail.recordset);

        return NextResponse.json({ status: 200, orderDetail:orderDetail.recordset ,sellerId})
    }else if(userRole === 'customer' && userId){
        const selectedCustomerId = await pool.request().input('userId', userId).query("select customer_id from customers where user_id = @userId");
        const customerId = selectedCustomerId.recordset[0].customer_id;
        console.log(`Extracted Customer Id id ${customerId}`);

        const orderDetailCustomerQuery = "select oi.order_item_id, o.order_date,o.order_status,o.created_at,o.payment_method,oi.quantity,p.product_name,p.description,p.price,p.digital_asset_url,u.email,u.userName,pc.category_name from orders o join order_items oi on o.order_id = oi.order_id  join products p on oi.product_id = p.product_id join product_categories pc on p.category_id = pc.category_id join sellers s on p.seller_id = s.seller_id join users u on s.user_id = u.user_id where o.customer_id = @customerId";
         const orderDetailCustomer = await pool.request().input('customerId', customerId).query(orderDetailCustomerQuery);
        console.log(orderDetailCustomer.recordset);
         return NextResponse.json({ status: 201, orderDetailCustomer:orderDetailCustomer.recordset, customerId})
    }

    return NextResponse.json({ status: 500 })
}