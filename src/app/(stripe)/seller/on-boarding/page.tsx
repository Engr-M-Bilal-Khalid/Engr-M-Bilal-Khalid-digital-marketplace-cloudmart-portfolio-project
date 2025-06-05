import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function StripeOnboardingCancelled() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <Alert className="max-w-md bg-white shadow-lg rounded-2xl p-6 border border-red-300">
        <AlertTitle className="text-xl font-semibold text-red-600">Onboarding Canceled</AlertTitle>
        <AlertDescription className="mt-2 text-gray-600">
          You canceled the Stripe onboarding process. Please retry to connect your Stripe account.
        </AlertDescription>
        <div className="mt-6 text-center">
          <Link href="/api/stripe/onboard">
            <Button className="bg-red-600 hover:bg-red-700 text-white">Retry Onboarding</Button>
          </Link>
        </div>
      </Alert>
    </div>
  );
}
