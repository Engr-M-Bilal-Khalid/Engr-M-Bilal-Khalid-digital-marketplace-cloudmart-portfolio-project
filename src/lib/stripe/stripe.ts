import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});


export interface CreateStripeProduct {
  productName: string;
  productDescription?: string | undefined;
  productPrice: number;
  stripeAccount: string;
  imageUrl : string []
}


export interface UpdateStripeProductAndPriceIds {
  accountId: string;
  stripeProductId: string;
  oldPriceId: string;
  name?: string;
  newAmount: number;
  currency?: string;
}


export interface DeleteStripeProduct {
  stripeProductId: string;
  stripeAccountId: string;
}