'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function StripeSuccess() {
  const searchParams = useSearchParams();
  const accountId = searchParams.get('accountId');
  const userId = searchParams.get('userId');

  useEffect(() => {
    const fetchAccountLink = async () => {
      if (accountId && userId) {
        const res = await fetch('/api/save-account-id', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, accountId }),
        });
        const data = await res.json();
        console.log('Stripe account ID:', { data }, accountId);
        console.log('User ID:', userId);
      }
    };

    fetchAccountLink();
  }, [accountId, userId]);

  return(
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 p-6 font-sans pt-20 pb-15">
      <Card className="max-w-md w-full bg-white shadow-2xl rounded-3xl p-8 border border-blue-200 transform transition-all duration-300 hover:scale-101">
        <CardContent className="flex flex-col items-center text-center">
          <CheckCircle className="text-blue-500 w-20 h-20 mb-6" />
          <h2 className="text-3xl font-extrabold text-blue-800 mb-3">
            Onboarding Complete!
          </h2>
          <p className="text-lg text-blue-600 font-semibold mb-2">
            Account ID: <span className="font-normal text-gray-800 break-all">{accountId}</span>
          </p>
          <p className="text-lg text-blue-600 font-semibold mb-4">
            User ID: <span className="font-normal text-gray-800 break-all">{userId}</span>
          </p>
          <p className="text-gray-700 mt-2 leading-relaxed text-base">
            Your Stripe account has been successfully connected. You can now list
            your products and start selling.
            <br />
            Continue to dashboard to manage your products and view sales.
          </p>
          <a
            href="/sign-in"
            className="mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Sign in
          </a>
        </CardContent>
      </Card>
    </div>
  )
}