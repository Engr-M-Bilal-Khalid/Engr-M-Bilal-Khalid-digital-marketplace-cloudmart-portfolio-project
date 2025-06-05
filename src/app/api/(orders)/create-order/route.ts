import Database from "@/lib/designPatterns/singletonPatterns/dbConnection";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { cartId, customerId } = body;

    const pool = await Database.getInstance();

    // Step 1: Insert order and get inserted order_id
    const insertOrderQuery = `
    INSERT INTO orders(customer_id, cart_id)
    OUTPUT INSERTED.order_id
    VALUES (@customerId, @cartId)
  `;
    const insertedOrder = await pool
        .request()
        .input('customerId', customerId)
        .input('cartId', cartId)
        .query(insertOrderQuery);

    const orderId = insertedOrder.recordset[0].order_id;

    // Step 2: Get cart items
    const getCartItemsQuery = `
    SELECT 
      p.product_id, 
      ci.quantity, 
      p.price, 
      p.product_name, 
      p.digital_asset_url, 
      p.description, 
      pi.image_url, 
      u.email, 
      u.userName 
    FROM cart_items ci 
    JOIN products p ON ci.product_id = p.product_id 
    OUTER APPLY (
      SELECT TOP 1 * FROM product_images pi 
      WHERE pi.product_id = p.product_id 
      ORDER BY pi.product_id
    ) pi 
    JOIN sellers s ON p.seller_id = s.seller_id 
    JOIN users u ON s.user_id = u.user_id 
    WHERE ci.cart_id = @cartId;
  `;

    const cartItemsResult = await pool
        .request()
        .input('cartId', cartId)
        .query(getCartItemsQuery);

    const orderItems = cartItemsResult.recordset.map(item => ({
        productId: item.product_id,
        quantity: item.quantity,
        price: item.price,
    }));

    // Step 3: Insert each item into order_items table
    for (const item of orderItems) {
        await pool.request()
            .input('orderId', orderId)
            .input('productId', item.productId)
            .input('quantity', item.quantity)
            .input('price', item.price)
            .query(`
        INSERT INTO order_items(order_id, product_id, quantity, price)
        VALUES (@orderId, @productId, @quantity, @price)
      `);
        const incrementSellCountInProducts = "UPDATE products SET sellCount = sellCount + 1 WHERE product_id = @productId;";
        await pool.request().input('productId',item.productId).query(incrementSellCountInProducts);
    };

    const updateOrderToPaidStatus = "update orders set total_amount = (select sum(price) as [Total Price] from order_items where order_id = @orderId), order_status = 'Delivered' where order_id = @orderId"

    await pool.request().input('orderId', orderId).query(updateOrderToPaidStatus);



    return NextResponse.json({
        status: 200,
        message: 'Order created with items chk DB',
        orderId,
        cartItems: cartItemsResult.recordset,
    });
}
