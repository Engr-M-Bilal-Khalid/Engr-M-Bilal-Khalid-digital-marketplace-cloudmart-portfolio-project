import { FooterWrapper, NavbarWrapper } from '@/components/navbar/navbarAndFooterWrapper';
import { AuthProvider } from "@/context/AuthContext";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { cookies } from 'next/headers';
import { Toaster } from 'sonner';
import "./globals.css";
import { CartProvider } from '@/context/CartContext';
import { SessionProvider } from '@/context/SessionContext';

const poppins = Poppins({
  weight: '400'
});


export const metadata: Metadata = {
  title: "Cloud Mart",
  description: "Created by M Bilal Khlalid",
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  const fetchSessionToken = async () => {
    const cookieStore = await cookies();
    const sessionDataCookie = cookieStore.get('session-token')?.value || null;
    if (sessionDataCookie) {
      try {
        // Parse the JSON string back into an object
        const parsedData = JSON.parse(sessionDataCookie);

        let sessionToken: string | null = null;
        let userId: number | null = null;
        let userRole: string | null = null;

        sessionToken = parsedData.sessionToken || null;
        userId = parsedData.userId || null; // Assuming you named it 'userId'
        userRole = parsedData.userRole || null;

        console.log('Extracted Session Token:', sessionToken);
        console.log('Extracted User ID:', userId);
        console.log('Extracted User Role:', userRole);
        return {userId,userRole,sessionToken}
      } catch (error) {
        console.error('Error parsing session data cookie:', error);
      }
    }
  }

  let { userId, userRole, sessionToken } = await fetchSessionToken() ?? { userId: null, userRole: null, sessionToken: null };

  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased bg-gray-100`}>
        <SessionProvider value={{ userId, userRole, sessionToken }}>
        <AuthProvider >
          <CartProvider> {/* ✅ Wrap Navbar and children */}
            <NavbarWrapper userId={userId} userRole={userRole} initialSessionToken={sessionToken}
            />
            <Toaster position="top-center" richColors />
            
              {children}
            
            <FooterWrapper />
          </CartProvider>
        </AuthProvider>
        </SessionProvider>
      </body>
    </html>

  );
}
