// src/components/NavbarWrapper.tsx
'use client'; // This directive makes it a Client Component

import { usePathname } from 'next/navigation';
import { Footer } from '../footer/Footer';
import { Navbar } from './navbar';

interface NavbarWrapperProps {
    userId: number | null;
    userRole: string | null;
    initialSessionToken: string | null;
}


export function NavbarWrapper({ userId, userRole, initialSessionToken }: NavbarWrapperProps) {
    


    const pathname = usePathname();

    const shouldDisplayNavbar = !pathname.includes('/dashboard');

    if (!shouldDisplayNavbar) {
        return null;
    }
    
    return (
        userId && userRole
            ?
            <Navbar userId={userId} userRole={userRole} initialSessionToken={initialSessionToken} />
            :
            <Navbar initialSessionToken={initialSessionToken} />
    );
}

export function FooterWrapper() {
    const pathname = usePathname();


    const shouldDisplayNavbar = !pathname.includes('/dashboard');

    if (!shouldDisplayNavbar) {
        return null;
    }

    return (
        <Footer />
    );
}