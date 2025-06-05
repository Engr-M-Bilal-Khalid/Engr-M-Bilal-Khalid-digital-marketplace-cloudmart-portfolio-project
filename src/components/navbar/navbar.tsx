"use client"
import { CartProductItem, FetchProductsInCart, Product } from "@/app/productChk/page";
import { Cross, Menu, Trash2, XIcon } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from "react";
import { handleSignOut } from "../dashboard/handleSignOut";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet";
import { ShoppingBag } from 'lucide-react';

import { errorNotifier, successNotifier } from "@/lib/designPatterns/observerPattern/notificationTrigger";
import Link from "next/link";
import { useCartContext } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
    initialSessionToken: string | null;
    userId?: number | null; // Optional, if you want to pass userId
    userRole?: string | null; // Optional, if you want to pass userRole
}

export const Navbar = ({ initialSessionToken, userId, userRole }: NavbarProps) => {

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [sessionToken, setSessionToken] = useState<string | null>(initialSessionToken);
    const auth = useAuth();
    const idOfUser = auth.userId;
    const isAuthenticated = auth.isAuthenticated

    const {
        cartId,
        setCartId,
        sessionId,
        setSessionId,
        customerId,
        setCustomerId
    } = useCartContext();


    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [cartItems, setCartItems] = useState<CartProductItem[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const cartIdAfterLogin = searchParams.get('cartId');

    const createAndStoreSessionId = async () => {
        const response = await fetch('/api/create-sessionId-for-customer', {
            method: 'POST'
        });
        if (!response) {
            alert('Error occured!')
        }
        const data = await response.json();
        if (data?.status === 201) {
            const cartId = data?.cartId;
            const sessionId = data?.sessionId;
            console.log(cartId, sessionId);
            setCartId(cartId);
            setSessionId(sessionId);
            // Store both in a cookie named 'cartSessionIds'
            const cookieValue = JSON.stringify({ cartId, sessionId });
            document.cookie = `cartSessionIds=${encodeURIComponent(cookieValue)}; path=/; max-age=604800;`;
            successNotifier.notify(`Session Id created as no user LogIn!`)
        }
    }
    const getCartSessionIds = () => {
        const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('cartSessionIds='));

        if (!cookie) return null;

        try {
            const value = decodeURIComponent(cookie.split('=')[1]);
            const parsed = JSON.parse(value);
            const { cartId, sessionId } = parsed;

            return { cartId, sessionId };
        } catch (error) {
            console.error('Failed to parse cartSessionIds cookie:', error);
            return null;
        }
    };

    const checkSessionId = async () => {
        try {
            const response = await fetch('/api/sessionId-validation-for-customer', {
                method: 'POST',
                credentials: 'include'
            });
            if (response.status === 200) {
                const data = await response.json();
                const customerId = data.sessionData.customer_id;
                console.log(`No need to create session Customer Id exists ${customerId}`);
                if (!cartIdAfterLogin) {
                    const innerResponse = await fetch('/api/create-cartId-for-customer', {
                        method: 'POST',
                        body: JSON.stringify({ customerId })
                    });
                    if (innerResponse.status === 200) {
                        const innerData = await innerResponse.json();
                        const cartId = innerData.cartId;
                        setCartId(cartId);
                        setCustomerId(customerId);
                    }
                } else {
                    setCartId(cartIdAfterLogin ? Number(cartIdAfterLogin) : undefined);
                    setCustomerId(customerId);
                }
            }
            if (response.status === 401) {
                console.warn("Initaite session_id store in cart table");
                await createAndStoreSessionId();
            }
            if (response.status === 400) {
                const sessionData = getCartSessionIds();

                if (sessionData) {
                    console.log('Cart ID Sessional:', sessionData.cartId);
                    console.log('Session ID Sessional:', sessionData.sessionId);
                    setCartId(sessionData.cartId);
                    setSessionId(sessionData.cartId);

                    console.log('Cart ID State:', cartId);
                    console.log('Session ID State:', sessionId);
                } else {
                    console.warn('cartSessionIds cookie not found or invalid, creating new one...');
                    await createAndStoreSessionId();
                }
            }
        } catch (error) {
            console.error('Error checking session:', error);
        }
    };


    const fetchProductsInCart = async ({ cartId }: FetchProductsInCart) => {
        const fetchCartItemsResponse = await fetch('/api/fetch-from-cart', {
            method: 'POST',
            body: JSON.stringify({ cartId })
        });

        const data = await fetchCartItemsResponse.json();
        setCartItems(data.cartItems);
    }


    useEffect(() => {
        console.log(`sessionToken is from useEffect ${sessionToken}`)
        checkSessionId();
        setSessionToken(initialSessionToken);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);



    const handleRemoveItem = async (item_id: number, product_id: number, cart_id: number) => {
        const response = await fetch('/api/remove-from-cart', {
            method: 'POST',
            body: JSON.stringify({
                itemId: item_id,
                productId: product_id,
                cartId: cart_id
            })
        });
        if (response.ok) {
            const data = await response.json();
            const status = data.status;
            if (status === 200) {
                fetchProductsInCart({ cartId: cartId as number })
                successNotifier.notify(data.message);
            } else {
                errorNotifier.notify(data.message)
            }
        }
    }

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            errorNotifier.notify("Your cart is empty.")
            return;
        }

        try {
            console.log(`From handleCheckout button : ${cartItems}`)
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cartItems, customerId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                successNotifier.notify(errorData?.error || 'Failed to initiate checkout.')

                return;
            }

            const data = await response.json();

            if (data?.url) {
                router.push(data.url);
            } else if (data?.urls && Array.isArray(data.urls) && data.urls.length > 0) {
                const redirectToCheckout = async (urls: string[]) => {
                    if (urls.length > 0) {
                        router.push(urls[0]);
                        urls.forEach(url => window.open(url, '_blank'));
                        errorNotifier.notify('You will be redirected to separate checkout pages for each seller.');
                    }
                };
                redirectToCheckout(data.urls);
            } else {
                errorNotifier.notify('Invalid checkout response received.')
            }
        } catch (error: any) {
            errorNotifier.notify(`Error initiating checkout: ${error.message}`)
        }
    };

    return (
        <div className="bg-gray-100 font-sans w-full m-0 fixed top-0 z-50">
            <div className="bg-white shadow">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between py-4">
                        <div>
                            <Link href="/">        
                            <Image src="/logo.png" className="w-15 h-10" width={18} height={10} alt="Cloud Mart" />
                            </Link>

                        </div>

                        <div className="hidden sm:flex sm:items-center">
                            <div className="hidden sm:flex sm:items-center justify-center px-2">
                                <a href="/productChk" className="text-gray-800 text-sm font-semibold hover:text-[#219FDA] mr-4">Products</a>
                                {
                                    sessionToken && userId && userRole
                                        ?
                                        <>
                                            <a onClick={handleSignOut} className="text-red-400 text-sm font-semibold border px-4 py-2 rounded-lg hover:text-[#FD5C63] hover:border-[#FD5C63] hover:cursor-pointer  mr-4">Sign out</a>
                                            <a href={`dashboard?role=${userRole}&user_id=${userId}`} className="text-gray-800 text-sm font-semibold border px-4 py-2 rounded-lg hover:text-[#219FDA] hover:border-[#219FDA]  mr-4">Dashboard</a>
                                        </>
                                        :
                                        <>
                                            <a href="/sign-in" className="text-gray-800 text-sm font-semibold border px-4 py-2 rounded-lg hover:text-[#219FDA] hover:border-[#219FDA]  mr-4">Sign in</a>
                                            <a href="/sign-up" className="text-gray-800 text-sm font-semibold border px-4 py-2 rounded-lg hover:text-[#219FDA] hover:border-[#219FDA]  mr-4">Sign up</a>

                                        </>
                                }
                                <>
                                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                                        <SheetTrigger asChild>
                                            <Button variant="link" className="text-gray-800 text-sm font-semibold border px-4 py-2 rounded-lg hover:text-[#219FDA] hover:border-[#219FDA]  mr-4" onClick={() => { fetchProductsInCart({ cartId: cartId as number }) }}>
                                                <ShoppingBag className="mr-2 h-4 w-4" />
                                                Cart
                                            </Button>

                                        </SheetTrigger>
                                        <SheetContent className="">
                                            <SheetHeader>
                                                <SheetTitle>Your Cart</SheetTitle>
                                                <SheetDescription>
                                                    Items currently in your shopping cart.
                                                </SheetDescription>
                                            </SheetHeader>
                                            <div className="overflow-y-auto max-h-[70vh] grid gap-4 p-4 mt-4">
                                                {cartItems && cartItems.length > 0 ? (
                                                    cartItems.map((item) => (
                                                        <div
                                                            key={item.item_id}
                                                            className="relative border p-3 rounded-xl shadow-sm bg-white"
                                                        >
                                                            {/* Trash icon in top-right corner */}
                                                            <button
                                                                onClick={() => handleRemoveItem(item.item_id, item.product_id, item.cart_id)}
                                                                className="absolute top-2 right-2 text-red-400 hover:text-red-800 transition"
                                                                title="Remove from cart"
                                                            >
                                                                <XIcon className="h-4 w-4" />
                                                            </button>

                                                            <div className="flex items-center space-x-4">
                                                                <img
                                                                    src={item.image_url}
                                                                    alt={item.product_name}
                                                                    className="h-12 w-12 rounded-md object-cover"
                                                                />
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium">{item.product_name}</p>
                                                                    <p className="text-xs text-muted-foreground">Cart ID: {item.cart_id}</p>
                                                                    <p className="text-xs text-muted-foreground">Product ID: {item.product_id}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Price: ${item.price.toFixed(2)}
                                                                    </p>
                                                                </div>
                                                                <p className="text-sm whitespace-nowrap">Qty: 01</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className='flex h-full flex-col items-center justify-center space-y-1'>
                                                        <div
                                                            aria-hidden='true'
                                                            className='relative mb-4 h-60 w-60 text-muted-foreground'>
                                                            <Image
                                                                src='/hippo-empty-cart.png'
                                                                fill
                                                                alt='empty shopping cart hippo'
                                                            />
                                                        </div>
                                                        <div className='text-xl font-semibold'>
                                                            Your cart is empty
                                                        </div>
                                                        <SheetTrigger asChild>
                                                            <Button className='text-sm text-muted-foreground' variant='link'>
                                                                <Link
                                                                    href='/productChk'
                                                                >
                                                                    Add items to your cart to checkout
                                                                </Link>
                                                            </Button>

                                                        </SheetTrigger>
                                                    </div>
                                                )}
                                            </div>

                                            <SheetFooter>
                                                {
                                                    sessionToken 
                                                        ?
                                                        userRole === 'customer'
                                                        ?
                                                        <Button onClick={handleCheckout} variant="link" className="w-full">
                                                            CheckOut
                                                        </Button>
                                                        :
                                                        <h1>You can not buy product from seller,admin and owner account</h1>                
                                                        :
                                                        <Link href={`/sign-in?cartId=${cartId}`}>
                                                            <Button variant="link" className="w-full" onClick={()=>setIsSheetOpen(false)}>
                                                                Sign In As Customer
                                                            </Button>
                                                        </Link>
                                                }

                                            </SheetFooter>


                                        </SheetContent>
                                    </Sheet>
                                </>
                            </div>
                        </div>

                        <div className="sm:hidden cursor-pointer" onClick={toggleMobileMenu}>
                            <Menu className="w-6 h-6 text-[#219FDA]" />
                        </div>
                    </div>

                    <div
                        ref={menuRef}
                        className={`block sm:hidden bg-white border-t-2 py-2 ${isMobileMenuOpen ? 'block' : 'hidden'
                            }`}
                    >
                        <div className="flex flex-col items-center justify-center">
                            <a href="#" className="text-gray-800 text-sm font-semibold hover:text-[#219FDA] mb-1">Products</a>
                            <a href="#" className="text-gray-800 text-sm font-semibold hover:text-[#219FDA] mb-1">Marketplace</a>
                            <a href="#" className="text-gray-800 text-sm font-semibold hover:text-[#219FDA] mb-1">Partners</a>
                            <a href="#" className="text-gray-800 text-sm font-semibold hover:text-[#219FDA] mb-1">Pricing</a>
                            <div className="flex justify-between items-center border-t-2 pt-2">
                                <div className="hidden sm:flex sm:items-center">
                                    {
                                        sessionToken && userId && userRole
                                            ?
                                            <a href={`dashboard?role=${userRole}&user_id=${userId}`} className="text-gray-800 text-sm font-semibold border px-4 py-2 rounded-lg hover:text-[#219FDA] hover:border-[#219FDA]">Dashboard</a>
                                            :
                                            <>
                                                <a href="/sign-in" className="text-gray-800 text-sm font-semibold hover:text-[#219FDA] mr-4">Sign in</a>
                                                <a href="/sign-up" className="text-gray-800 text-sm font-semibold border px-4 py-2 rounded-lg hover:text-[#219FDA] hover:border-[#219FDA]">Sign up</a>

                                            </>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}