"use client"

import { AddToCart, Product } from '@/app/productChk/page';
import ImageSlider from "@/components/ImageSlider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { errorNotifier, successNotifier } from '@/lib/designPatterns/observerPattern/notificationTrigger';
import { useEffect, useState } from 'react';
import { CategoryCardSkeleton } from './CategorySection';
import { Ban, ShoppingCart } from 'lucide-react';
import { useCartContext } from '@/context/CartContext';
import { useSession } from "@/context/SessionContext";
import Link from 'next/link';


export const FeaturedProductsSection: React.FC = () => {

    const [viewProducts, setViewProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const {
        cartId,
        sessionId,
        customerId,
    } = useCartContext();
    const { userId, userRole, sessionToken } = useSession();
    useEffect(() => {

        const viewproducts = async () => {
            try {
                setLoading(true)
                const res = await fetch('/api/view-products', {
                    method: 'GET',
                });

                if (!res.ok) {
                    console.log(`Error`);
                    errorNotifier.notify('Failed to fetch products Response not ok');
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                if (data.status === 200 && data.result) {
                    setViewProducts(data.result);
                    successNotifier.notify(data.message);
                    console.log('Fetched Products:', data.result);
                    setLoading(false);
                } else {
                    console.log(`Error`);
                    errorNotifier.notify('Failed to fetch products Else block');
                    setLoading(false);
                }
            } catch (err: any) {
                errorNotifier.notify('Failed to fetch products Catch Block');
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
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
                    Featured Products
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {
                        loading
                            ?
                            (
                                Array.from({ length: 4 }).map((_, index) => (
                                    <ProductCardSkeleton key={index} />
                                ))
                            )
                            :
                            (
                                viewProducts.slice(0, 4).map((product) => (
                                    <div key={product.product_id} className='bg-gray-200 p-5 rounded-xl'>
                                        <div className="relative w-full aspect-square rounded-md overflow-hidden" >
                                            <ImageSlider urls={product.image_urls} />
                                        </div>
                                        <div className="">
                                            <h3 className="text-sm font-extrabold text-gray-800 truncate mb-1 pt-4">
                                                <Link href={`productDetail/${product.product_id}`}>
                                                    {product.product_name}
                                                </Link>
                                            </h3>
                                            <p className="text-sm text-blue-600 font-medium mb-2">{product.description}</p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xl font-bold text-gray-900">${product.price}</span>
                                                <button className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors duration-300" onClick={() => addToCart({ productId: product.product_id, customerId: customerId, cartId: cartId })} disabled={userRole !== 'customer'}>
                                                    {
                                                        sessionToken ?
                                                        (userRole === 'seller' || userRole === 'admin' || userRole === 'owner') ?
                                                            <div className="relative w-6 h-6">
                                                                <ShoppingCart className="text-gray-400 w-full h-full" />
                                                                <Ban className="text-red-500 absolute top-0 right-0 w-3 h-3" />
                                                            </div>
                                                            :
                                                            <ShoppingCart className="w-5 h-5" />
                                                            :
                                                            <ShoppingCart className="w-5 h-5" />
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )
                    }
                </div>
                <div className="text-center mt-12">
                    <button className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-blue-700 transition-colors duration-300 shadow-md">
                        <a href="/productChk">View All Products</a>
                    </button>
                </div>
            </div>
        </section>
    );
};


export const ProductCardSkeleton: React.FC = () => {
    return (
        <div className="bg-gray-200 p-5 rounded-xl animate-pulse">
            <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-300" />

            <div className="pt-4">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-300 rounded w-full mb-4" />

                <div className="flex justify-between items-center">
                    <div className="h-5 bg-gray-300 rounded w-1/4" />
                    <div className="h-10 w-10 bg-gray-300 rounded-full" />
                </div>
            </div>
        </div>

    );
};

