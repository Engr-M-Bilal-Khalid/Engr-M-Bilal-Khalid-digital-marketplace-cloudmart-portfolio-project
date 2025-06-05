import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import sql from 'mssql';
import Database from '@/lib/designPatterns/singletonPatterns/dbConnection';
import { stripe, DeleteStripeProduct } from '@/lib/stripe/stripe';

async function deleteStripeProduct({ stripeProductId, stripeAccountId }: DeleteStripeProduct) {
    const deletedProduct = await stripe.products.update(
        stripeProductId,
        {
            active: false,
        },
        {
            stripeAccount: stripeAccountId,
        }
    );
    return deletedProduct;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { productId } = body;
        console.log('Deleting Product:', { productId });
        const pool = await Database.getInstance();
        let query1, query2,query3 ,result, request1, request2,request3;
        request1 = pool.request();
        request2 = pool.request();
        request3 = pool.request();
        query1 = 'select p.seller_id,p.stripe_product_id,s.stripe_account_id from products p join sellers s on p.seller_id = s.seller_id where p.product_id = @productId ';
        let accountInfo = await request1.input('productId', productId).query(query1);
        let stripeProductId = accountInfo.recordset[0].stripe_product_id;
        let stripeAccountId = accountInfo.recordset[0].stripe_account_id;

        const deleted = await deleteStripeProduct({
            stripeProductId: stripeProductId,
            stripeAccountId: stripeAccountId,
        });

        console.log('Deleted (deactivated) product:', deleted.id);

        query2 = 'DELETE FROM product_images WHERE product_id = @productId';
        result = await request2.input('productId', sql.Int, productId).query(query2);

        query3 = 'DELETE FROM products WHERE product_id = @productId';
        result = await request3.input('productId', sql.Int, productId).query(query3);
        return NextResponse.json({ message: 'Product deleted successfully', rowsAffected: result.rowsAffected }, { status: 200 });
    } catch (error: any) {
        console.error('Delete Product Error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: 'Validation error', errors: error.errors }, { status: 400 });
        }
        return NextResponse.json(
            { message: 'Internal server error', error: error.message || 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
