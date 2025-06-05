// src/app/api/(stripe)/create-account-link/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe';


export async function POST(req: NextRequest) {
  const requestBody = await req.json();
  const userId = requestBody.userId;
  try {
    // 1. Create Express Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      }
    });


    // 2. Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/seller/on-boarding?userId=${userId}`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/seller/on-success?accountId=${account.id}&userId=${userId}`,
      type: 'account_onboarding',
    });


    // 3. Send accountLink.url to frontend
    return NextResponse.json({ url: accountLink.url});
  } catch (err) {
    console.error('Stripe Connect Error:', err);
    return NextResponse.json({ error: 'Stripe Connect error' }, { status: 500 });
  }
}
