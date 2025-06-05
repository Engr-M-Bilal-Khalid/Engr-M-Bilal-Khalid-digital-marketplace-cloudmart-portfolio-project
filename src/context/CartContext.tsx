"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of your context data
interface CartContextType {
    cartId: number | undefined;
    setCartId: (id: number | undefined) => void;
    sessionId: string;
    setSessionId: (id: string) => void;
    customerId: number | undefined;
    setCustomerId: (id: number | undefined) => void;
}

// Create the context with a default value
const CartContext = createContext<CartContextType | undefined>(undefined);

// Create a provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartId, setCartId] = useState<number | undefined>(undefined);
    const [sessionId, setSessionId] = useState<string>("1");
    const [customerId, setCustomerId] = useState<number | undefined>(undefined);

    return (
        <CartContext.Provider
            value={{
                cartId,
                setCartId,
                sessionId,
                setSessionId,
                customerId,
                setCustomerId,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

// Custom hook to use the cart context
export const useCartContext = (): CartContextType => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCartContext must be used within a CartProvider");
    }
    return context;
};
