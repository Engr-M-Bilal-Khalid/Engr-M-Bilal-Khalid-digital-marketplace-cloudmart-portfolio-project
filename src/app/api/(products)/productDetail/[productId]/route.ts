// @ts-ignore


import Database from "@/lib/designPatterns/singletonPatterns/dbConnection";
import { NextRequest, NextResponse } from "next/server";


export async function POST(
  req: NextRequest, 
) {
  const body =await req.json();
  const {productId} = body
  try {
    if (!productId || isNaN(productId)) {
      return NextResponse.json(
        { message: "Product ID is required.", status: 400 },
        { status: 400 }
      );
    }


    let pool;
    let productDetails;
    let productQuery: string;

    productQuery = `
      select p.product_id,p.product_name,p.category_id,pc.category_name,p.price,p.digital_asset_url,p.description,u.userName as seller_name,u.email as seller_email,p.stripe_product_id,p.stripe_price_id,pr.image_url,s.seller_id,s.stripe_account_id from products p join product_images pr on pr.product_id = p.product_id join sellers s on p.seller_id = s.seller_id join users u on s.user_id = u.user_id join product_categories pc on p.category_id = pc.category_id where p.product_id = @productId
    `;



    pool = await Database.getInstance(); 

   
    productDetails = await pool
      .request()
      .input("productId", productId)
      .query(productQuery);

    

    const groupedProducts = productDetails.recordset.reduce((acc, row) => {
      const existingProduct = acc.find((item: { product_id: number; }) => item.product_id === row.product_id);

      if (existingProduct) {
        existingProduct.image_urls = [...(existingProduct.image_urls || []), row.image_url].filter(Boolean);
      } else {
        acc.push({
          product_id: row.product_id,
          product_name: row.product_name,
          description: row.description,
          categoryName: row.category_name,
          price: row.price,
          sellerId: row.seller_id,
          seller_email: row.seller_email,
          seller_name: row.seller_name,
          stripeSellerAccountId: row.stripe_account_id,
          stripeProductId: row.stripe_product_id,
          stripePriceId: row.stripe_price_id,
          digital_asset_url: row.digital_asset_url,
          image_urls: row.image_url ? [row.image_url] : [],
        });
      }
      return acc;
    }, []);

    const categoryId = productDetails.recordset[0].category_id;

    const query = `
      select p.product_id,p.product_name,p.category_id,pc.category_name,p.price,p.digital_asset_url,p.description,u.userName as seller_name,u.email as seller_email,p.stripe_product_id,p.stripe_price_id,pr.image_url,s.seller_id,s.stripe_account_id from products p join product_images pr on pr.product_id = p.product_id join sellers s on p.seller_id = s.seller_id join users u on s.user_id = u.user_id join product_categories pc on p.category_id = pc.category_id where p.category_id = @categoryId`;

    const sameCategoryproducts = await pool.request().input('categoryId', categoryId).query(query);

    const sameCategoryGroupProducts = sameCategoryproducts.recordset.reduce((acc, row) => {
      const existingProduct = acc.find((item: { product_id: number; }) => item.product_id === row.product_id);

      if (existingProduct) {
        existingProduct.image_urls = [...(existingProduct.image_urls || []), row.image_url].filter(Boolean);
      } else {
        acc.push({
          product_id: row.product_id,
          product_name: row.product_name,
          description: row.description,
          categoryName: row.category_name,
          price: row.price,
          sellerId: row.seller_id,
          seller_email: row.seller_email,
          seller_name: row.seller_name,
          stripeSellerAccountId: row.stripe_account_id,
          stripeProductId: row.stripe_product_id,
          stripePriceId: row.stripe_price_id,
          digital_asset_url: row.digital_asset_url,
          image_urls: row.image_url ? [row.image_url] : [],
        });
      }
      return acc;
    }, []);

    console.log(`Category Id fetch from db : ${categoryId}`)

    // If no product is found, return a 404 response
    if (!groupedProducts || !sameCategoryGroupProducts) {
      return NextResponse.json(
        { message: "Product not found.", status: 404 },
        { status: 404 }
      );
    }

    // Return the fetched product details
    return NextResponse.json(
      {
        product: groupedProducts[0],
        sameCategoryProducts: sameCategoryGroupProducts,
        message: "Product fetched successfully.",
        status: 200,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching product details:", error);
    // Return a 500 response for server errors
    return NextResponse.json(
      {
        message: "Error fetching product details. Please try again later.",
        status: 500,
      },
      { status: 500 }
    );
  }
}
