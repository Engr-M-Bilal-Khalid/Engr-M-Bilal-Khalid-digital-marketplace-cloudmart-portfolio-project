import { NextRequest, NextResponse } from "next/server";
import Database from '@/lib/designPatterns/singletonPatterns/dbConnection';
import { stripe, UpdateStripeProductAndPriceIds } from "@/lib/stripe/stripe";

async function updateStripeProduct({
    accountId,
    stripeProductId,
    oldPriceId,
    name,
    newAmount,
    currency = 'inr', }: UpdateStripeProductAndPriceIds) {
    const updatedProduct = await stripe.products.update(stripeProductId, {
        ...(name && { name }),
    }, {
        stripeAccount: accountId,
    });
    await stripe.prices.update(
        oldPriceId,
        {
            active:false
        },
        {
            stripeAccount: accountId,
        }
    );
    const newPriceId = await stripe.prices.create({
        product:stripeProductId,
        unit_amount: newAmount * 100,
        currency: 'usd',
    },{
        stripeAccount: accountId,
    });
    return { updatedProduct, newPriceId };
}

export async function POST(req: NextRequest) {
    let query1, query2, query3, query4, result, request1, request2, request3, request4, pool, now: Date, stripeResult, stripeProductId, stripePriceId, sellerId, sellerIdResult, stripeAccountIdResult, stripeAccountId;
    const body = await req.json()
    const { productId, productName, productCategoryId, productPrice } = body;
    now = new Date();
    try {

        pool = await Database.getInstance();

        request1 = pool.request();
        request2 = pool.request();
        request3 = pool.request();
        request4 = pool.request();

        //Extract sellerId
        query1 = 'select seller_id from products where product_id = @productId';
        sellerIdResult = await request1.input('productId', productId).query(query1);
        sellerId = await sellerIdResult.recordset[0].seller_id;
        console.log('Seller ID:', sellerId);

        //Extract Stripe Account ID
        query2 = 'select stripe_account_id  from sellers where seller_id = @sellerId';
        stripeAccountIdResult = await request2.input('sellerId', sellerId).query(query2);
        stripeAccountId = await stripeAccountIdResult.recordset[0].stripe_account_id;
        console.log('Stripe Account ID:', stripeAccountId);

        //Extract Stripe Product ID and Price ID
        query3 = 'Select stripe_product_id,stripe_price_id from products where product_id = @productId';
        stripeResult = await request2.input('productId', productId).query(query3);
        stripeProductId = stripeResult.recordset[0].stripe_product_id;
        stripePriceId = stripeResult.recordset[0].stripe_price_id;
        console.log('Stripe Old Product ID:', stripeProductId);
        console.log('Stripe Old Price ID:', stripePriceId);

        const stripeUpdatedResult = await updateStripeProduct({
          accountId: stripeAccountId,
          stripeProductId,
          oldPriceId: stripePriceId,
          name: productName,
          newAmount: productPrice,
          currency: 'inr',
        });


        const newStripePriceId = stripeUpdatedResult.newPriceId.id;
        const updatedProductId = stripeUpdatedResult.updatedProduct.id
        console.log('Stripe Product Updated:',updatedProductId );
        console.log('New Stripe Price ID:', newStripePriceId);


        //Update Product in Database
        query4 = 'Update products SET product_name = @productName , price = @productPrice, category_id= @productCategoryId, updated_at= @now, stripe_price_id = @newStripePriceId where product_id = @productId';
        result = await request4.input('productName', productName).input('productPrice', productPrice).input('productCategoryId', productCategoryId).input('now', now).input('newStripePriceId',newStripePriceId).input('productId', productId).query(query4);
        return NextResponse.json({ message: 'Product updated successfully', data: result.recordset }, { status: 201 });

    } catch (error) {
        console.error(`Error in updating product :`, error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
} 