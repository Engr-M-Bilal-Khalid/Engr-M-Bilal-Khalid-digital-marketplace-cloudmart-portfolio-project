import Database from '@/lib/designPatterns/singletonPatterns/dbConnection';
import { stripe } from '@/lib/stripe/stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

const webhookSecret = process.env.STRIPE_WEBHOOK_API_KEY!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`);
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const pool = await Database.getInstance();
    const query = "UPDATE carts SET payment_status = 'paid' WHERE cart_id = @cartId AND customer_id = @customerId;";
    let result;
    const session = event.data.object as any;
    const cartItemsMetadata = session.metadata.cartItems ? JSON.parse(session.metadata.cartItems) : [];
    const paymentIntentId = session.payment_intent;

    let cartId = null;
    let customerId = null;

    try {
      for (const item of cartItemsMetadata) {
        const itemPrice = item.price;
        const itemQuantity = item.quantity;
        const stripeSellerAccountId = item.stripeSellerAccountId;
        cartId = item.cart_id;
        customerId = item.cust_id;
        const applicationFeeAmount = Math.round(itemPrice * itemQuantity * 0.1 * 100); 
        const transferAmount = Math.round(itemPrice * itemQuantity * 0.9 * 100); 

        console.log(
          `Processing item: Product ID ${item.product_id}, Seller ${stripeSellerAccountId}, Price ${itemPrice}, Quantity ${itemQuantity}`
        );
        console.log(`Transfer amount: ${transferAmount / 100} USD, Application fee: ${applicationFeeAmount / 100} USD`);

        console.log(`Seller Account ID for item ${item.product_id}:`, stripeSellerAccountId);
        await stripe.transfers.create({
          amount: transferAmount,
          currency: 'usd',
          destination: stripeSellerAccountId,
          transfer_group: paymentIntentId,
        });
        console.log(`Transferred ${transferAmount / 100} USD to ${stripeSellerAccountId}.`);
        console.log(`From webhook ${cartId} , ${customerId}`);
       
      }
      if(!cartId && !customerId){
        console.log(`Query can not execute`)
      }else{
        result = await pool.request().input('cartId', cartId).input('customerId', customerId).query(query);
      }

      return NextResponse.json({ received: true,result }, { status: 200 });
    } catch (error: any) {
      console.error('Error processing payment and transfers:', error.message);
      return NextResponse.json({ error: 'Payment/Transfer Error' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
