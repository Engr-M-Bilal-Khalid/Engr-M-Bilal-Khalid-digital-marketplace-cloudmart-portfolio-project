'use client';
import ImageSlider from "@/components/ImageSlider";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { errorNotifier, successNotifier } from "@/lib/designPatterns/observerPattern/notificationTrigger";
import { useEffect, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingBag, ShoppingCart } from 'lucide-react'
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import { set } from "zod";
import { CategoryCardSkeleton } from "@/components/home/CategorySection";
import { ProductCardSkeleton } from "@/components/home/FeaturedProductsSection";
import { useCartContext } from "@/context/CartContext";


export interface Product {
    product_id: number;
    product_name: string;
    description: string;
    price: number;
    sellerId: number;
    stripeSellerAccountId: string;
    stripeProductId: string;
    stripePriceId: string;
    digital_asset_url: string;
    image_urls: string[]; // Multiple image URLs for the product
}

export interface CartProductItem extends Omit<Product, 'image_urls'> {
    item_id: number;
    cart_id: number;
    image_url: string; // Single image URL for the cart 
    quantity: number
}

export interface AddToCart {
    productId: number,
    cartId?: number | undefined,
    sessionId?: string | undefined,
    customerId?: number | undefined
}

export interface FetchProductsInCart {
    cartId: number
    customerId?: number | undefined
    sessionId?: string | undefined
}

export default function Products() {

    const {
        cartId,
        sessionId,
        customerId,
    } = useCartContext();



    const [products, setProducts] = useState<Product[]>([]);
    const [productLoad, setProductLoad] = useState(true)


    useEffect(() => {

        const viewproducts = async () => {
            try {
                setProductLoad(true);
                const res = await fetch('/api/view-products', { // Corrected path
                    method: 'GET',
                });

                if (!res.ok) {
                    console.log(`Error`)
                    return;
                }

                const data = await res.json();
                if (data && data.result) {
                    setProducts(data.result);
                    setProductLoad(false)
                    console.log('Fetched Products:', data.result.length);
                } else {
                    console.log(`Error`)
                }
            } catch (err: any) {
                console.log(`Error`)
            }
        };
        viewproducts();
    }, []);



    const addToCart = async ({ productId, cartId }: AddToCart) => {
        const responseCart = await fetch('/api/add-to-cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, cartId })
        });

        const dataCart = await responseCart.json();

        if (dataCart.status === 200) {
            successNotifier.notify("Product added to cart chk db");
        } else if (dataCart.status === 400) {
            errorNotifier.notify("You can only add 1 quantity per product!");
        } else {
            errorNotifier.notify(`Error: ${dataCart.message || "Unknown error"}`);
        }

    }



    return (
        <MaxWidthWrapper>
            <div className="pt-20 pb-15">
                <div className="flex justify-center items-center mb-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mt-5 mb-5">
                        Our Products
                    </h2>

                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {
                        productLoad
                            ?
                            (
                                Array.from({ length: 12 }).map((_, index) => (
                                    <ProductCardSkeleton key={index} />
                                ))
                            ) :

                            (products.map((product) => (
                                <div key={product.product_id} className='bg-gray-200 p-5 rounded-xl'>
                                    <div className="relative w-full aspect-square rounded-md overflow-hidden" >
                                        <ImageSlider urls={product.image_urls} />
                                    </div>
                                    <div className="">
                                        <h3 className="text-sm font-extrabold text-gray-800 truncate mb-1 pt-4">
                                            <Link href={`/productDetail/${product.product_id}`}>
                                                {product.product_name}
                                            </Link>
                                        </h3>
                                        <p className="text-sm text-blue-600 font-medium mb-2">{product.description}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xl font-bold text-gray-900">${product.price}</span>
                                            <button className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors duration-300" onClick={() => addToCart({ productId: product.product_id, customerId: customerId, cartId: cartId })}>
                                                <ShoppingCart className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                            )
                    }
                </div>
            </div>
        </MaxWidthWrapper>)
}
