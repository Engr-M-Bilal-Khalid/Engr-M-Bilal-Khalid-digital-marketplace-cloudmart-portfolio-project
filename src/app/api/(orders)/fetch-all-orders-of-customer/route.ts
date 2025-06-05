import Database from "@/lib/designPatterns/singletonPatterns/dbConnection";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cartId, customerId } = body;

    if (!cartId || !customerId) {
      return NextResponse.json(
        {
          message: "Missing cartId or customerId in request body.",
          status: 400,
        },
        { status: 400 }
      );
    }

    let pool;
    let recentOrderProducts, allOrderProducts;
    let recentOrderProductsQuery: string;
    let allOrderProductsQuery: string;

    recentOrderProductsQuery = `
      SELECT
        p.product_id,
        ci.quantity,
        p.price,
        p.product_name,
        p.digital_asset_url,
        p.description,
        pi.image_url,
        u.email,
        u.userName,
        c.customer_id
      FROM
        cart_items ci
      JOIN
        carts c ON ci.cart_id = c.cart_id
      JOIN
        products p ON ci.product_id = p.product_id
      OUTER APPLY
        (SELECT TOP 1 * FROM product_images pi WHERE pi.product_id = p.product_id ORDER BY pi.product_id) pi
      JOIN
        sellers s ON p.seller_id = s.seller_id
      JOIN
        users u ON s.user_id = u.user_id
      WHERE
        ci.cart_id = @cartId AND c.customer_id = @customerId;
    `;

    allOrderProductsQuery = `
      SELECT
        p.product_id,
        ci.quantity,
        p.price,
        p.product_name,
        p.digital_asset_url,
        p.description,
        pi.image_url,
        u.email,
        u.userName,
        c.customer_id
      FROM
        cart_items ci
      JOIN
        carts c ON ci.cart_id = c.cart_id
      JOIN
        products p ON ci.product_id = p.product_id
      OUTER APPLY
        (SELECT TOP 1 * FROM product_images pi WHERE pi.product_id = p.product_id ORDER BY pi.product_id) pi
      JOIN
        sellers s ON p.seller_id = s.seller_id
      JOIN
        users u ON s.user_id = u.user_id
      WHERE
        c.customer_id = @customerId;
    `;

    pool = await Database.getInstance();

    recentOrderProducts = await pool
      .request()
      .input("cartId", cartId)
      .input("customerId", customerId)
      .query(recentOrderProductsQuery);

    allOrderProducts = await pool
      .request()
      .input("customerId", customerId)
      .query(allOrderProductsQuery);

    return NextResponse.json(
      {
        recentOrderProducts: recentOrderProducts.recordset,
        allOrderProducts: allOrderProducts.recordset,
        message: "Orders fetched successfully.",
        status: 200,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        message: "Error in fetching orders. Please try again later.",
        status: 500,
      },
      {
        status: 500,
      }
    );
  }
}
