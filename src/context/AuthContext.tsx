"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation'; // To read the URL for user info

interface AuthContextType {
  userId: string | null;
  userRole: string | null;
  isAuthenticated: boolean;
  setAuth: (userId: string | null, userRole: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    const url = new URL(window.location.href);
    const roleParam = url.searchParams.get('role');
    const userIdParam = url.searchParams.get('user_id');

    if (roleParam === 'customer' && userIdParam) {
      setUserId(userIdParam);
      setUserRole('customer');
      setIsAuthenticated(true);
    } else {
      setUserId(null);
      setUserRole(null);
      setIsAuthenticated(false);
    }
  }, [pathname]); // Re-run when the pathname changes

  const setAuth = (newUserId: string | null, newUserRole: string | null) => {
    setUserId(newUserId);
    setUserRole(newUserRole);
    setIsAuthenticated(!!newUserId); // isAuthenticated is true if userId is not null
  };

  return (
    <AuthContext.Provider value={{ userId, userRole, isAuthenticated, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};