"use client";

import Dashboard from '@/components/dashboard/dashboard';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';


export interface ProductCategory {
  category_id: number;
  category_name: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
}



const DashboardPage = () => {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const userId = searchParams.get('user_id');
  const [userName, setUserName] = useState<string>(``);
  const [stripeAccountId, setStripeAccountId] = useState<string>();
  const [loadNow,setLoadNow] = useState(false)


  useEffect(() => {

     const checkSession = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if(response.status === 200){
          setLoadNow(true)
        }
        if (response.status === 401) {
          console.warn('Session expired. Redirecting to sign-in...');
          window.location.href = '/sign-in';
        }
      } catch (error) {
        console.error('Error checking session:', error);
        window.location.href = '/sign-in';
      }
    };

    checkSession();

    const interval = setInterval(() => {
      checkSession();
    }, 1000);

    const fetchStripeAccountId = async () => {
      try {
        const res = await fetch('/api/fetch-account-id', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId,role }),
        });

        const data = await res.json();
        console.log(data.userName)
        setUserName(data.userName);
        if (role === 'seller') {
          setStripeAccountId(data.stripeAccountId);
          
        }
      } catch (err) {
        console.error('Stripe connection failed:', err);
      }
    };
    fetchStripeAccountId();
  
    return () => clearInterval(interval);
  }, [])


  if (!role) {
    return (
      <></>
    );
  }

  if (role === 'Invalid') {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <p className="text-xl font-semibold">Invalid User. You will be redirected shortly...</p>
      </div>
    );
  }

  if(loadNow){
    return(
       <SidebarProvider> <Dashboard roleName={role} userId={Number(userId)} userName={userName} stripeAccountId={stripeAccountId}  /></SidebarProvider>
    )
  }
 
};

export default DashboardPage;

