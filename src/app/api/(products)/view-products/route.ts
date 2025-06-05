import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import sql from 'mssql';
import Database from '@/lib/designPatterns/singletonPatterns/dbConnection';

const fetchProductsSchema = z.object({
  userRole: z.string(),
  userId: z.number().int(),
  value: z.enum(['pending', 'rejected', 'approved', 'active', 'inactive']).nullable().optional(),

});

export async function GET(req: NextRequest) {
  try {
    const pool = await Database.getInstance();
    const query = `select p.product_id,p.product_name,p.price,p.digital_asset_url,p.description,p.stripe_product_id,p.stripe_price_id,pr.image_url,s.seller_id,s.stripe_account_id from products p join product_images pr on pr.product_id = p.product_id join sellers s on p.seller_id = s.seller_id where p.status = 'approved' and p.activation_status = 'active'`
    const products = await pool.request().query(query);

    const groupedProducts = products.recordset.reduce((acc, row) => {
      const existingProduct = acc.find((item: { product_id: number; }) => item.product_id === row.product_id);

      if (existingProduct) {
        existingProduct.image_urls = [...(existingProduct.image_urls || []), row.image_url].filter(Boolean);
      } else {
        acc.push({
          product_id: row.product_id,
          product_name: row.product_name,
          description: row.description,
          price: row.price,
          sellerId: row.seller_id,
          stripeSellerAccountId: row.stripe_account_id,
          stripeProductId: row.stripe_product_id,
          stripePriceId: row.stripe_price_id,
          digital_asset_url: row.digital_asset_url,
          image_urls: row.image_url ? [row.image_url] : [],
        });
      }
      return acc;
    }, []);
    return NextResponse.json(
      {
        message: 'Product successfully fetch',
        result: groupedProducts,
        status: 200
      }
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error', error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { userRole, userId, value } = body;
    console.log('Fetching Products For:', { userRole, userId }); // 👈 added debug log
    const pool = await Database.getInstance();
    let query = '';
    let result, sellerId;
    let request = pool.request();

    if (userRole === 'owner' || userRole === 'admin') {
      const validStatuses = ['pending', 'approved', 'rejected'];
      const validActivationStatuses = ['active', 'inactive'];
      if (value !== null && validStatuses.includes(value as string)) {
        query = `SELECT u.userName,u.email,p.product_id,p.product_name,p.price,p.sellCount,p.digital_asset_url,pc.category_name,p.status,p.activation_status,p.created_at,p.updated_at FROM products p join sellers s on p.seller_id = s.seller_id join users u on s.user_id = u.user_id  join product_categories pc on p.category_id = pc.category_id where p.status = @value`;
      } else if (value !== null && validActivationStatuses.includes(value as string)) {
        query = `SELECT u.userName,u.email,p.product_id,p.product_name,p.price,p.sellCount,p.digital_asset_url,pc.category_name,p.status,p.activation_status,p.created_at,p.updated_at FROM products p join sellers s on p.seller_id = s.seller_id join users u on s.user_id = u.user_id  join product_categories pc on p.category_id = pc.category_id where p.activation_status = @value`;
      } else {
        query = 'SELECT u.userName,u.email,p.product_id,p.product_name,p.price,p.sellCount,p.digital_asset_url,pc.category_name,p.status,p.activation_status,p.created_at,p.updated_at FROM products p join sellers s on p.seller_id = s.seller_id join users u on s.user_id = u.user_id  join product_categories pc on p.category_id = pc.category_id';
      }
    } else if (userRole === 'seller') {
      query = 'select seller_id from sellers where user_id = @userId';
      result = await request.input('userId', sql.Int, userId).query(query);
      sellerId = result.recordset[0].seller_id;
      query = `select p.product_id,p.seller_id,p.product_name,p.price,p.created_at,p.updated_at,p_c.category_name,p.digital_asset_url,p.sellCount,p.status,p.activation_status from products p join product_categories p_c on p.category_id = p_c.category_id where p.seller_id = @sellerId`;
      request = request.input('sellerId', sql.Int, sellerId);
    } else if (userRole === 'customer') {
      query = 'SELECT * FROM products';
    } else {
      return NextResponse.json({ message: 'Invalid user role.' }, { status: 400 });
    }

    result = await request.input('value', value).query(query);

    return NextResponse.json(result.recordset, { status: 200 });

  } catch (error: any) {
    console.error('Fetch Products Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation error', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { message: 'Internal server error', error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}



