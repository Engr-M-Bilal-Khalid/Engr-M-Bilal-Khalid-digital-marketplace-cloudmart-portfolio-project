import { stripe } from '@/lib/stripe/stripe';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { cartItems, customerId } = await req.json();
  const origin = req.headers.get('origin') || new URL(req.url).origin;
  const firstItem = cartItems[0]; 
  const cartId = firstItem.cart_id;

  if (!cartItems || cartItems.length === 0) {
    return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
  }

  try {
    console.log(`Cart Item from chkOut : ${cartItems}`);
    console.log(`Customer Id : ${customerId}`)
    const lineItems = cartItems.map((item: any) => {
      console.log(item.stripe_account_id);
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product_name,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity
      };
    });

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/orderSuccess?session_id={CHECKOUT_SESSION_ID}&cartId=${cartId}&customerId=${customerId}`,
      cancel_url: `${origin}/cancel`,
      metadata: {
        cartItems: JSON.stringify(cartItems.map((item: any) => ({
          cart_id: item.cart_id,
          product_id: item.product_id,
          stripeSellerAccountId: item.stripe_account_id,
          price: item.price,
          quantity: item.quantity,
          cust_id: customerId
        }))),
      },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error: any) {
    console.error('Checkout session error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}