"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SessionContextType {
  userId: number | null;
  userRole: string | null;
  sessionToken: string | null;
}

const SessionContext = createContext<SessionContextType>({
  userId: null,
  userRole: null,
  sessionToken: null,
});

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: SessionContextType;
}) => {
  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};
