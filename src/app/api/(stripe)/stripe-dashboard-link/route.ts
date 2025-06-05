import { NextResponse, NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe/stripe'; 

export async function POST(req: NextRequest) {
const { accountId } = await req.json();


if (!accountId) {
    return NextResponse.json({ message: 'Account ID is required' }, { status: 400 });
}

try {
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    console.log(loginLink);
    console.log(loginLink.url)
    return NextResponse.json({ url: loginLink.url }, { status: 200 });
} catch (error: any) {
    console.error('Error creating account link:', error);
    return NextResponse.json(
        { message: 'Failed to create Stripe account link', error: error.message },
        { status: 500 }
    );
}
}
