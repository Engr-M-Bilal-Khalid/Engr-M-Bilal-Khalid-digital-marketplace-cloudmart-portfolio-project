"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, Download, Shield, Check, Ban } from "lucide-react";
import {
    errorNotifier,
    successNotifier,
} from "@/lib/designPatterns/observerPattern/notificationTrigger";
import Link from "next/link";
import ImageSlider from "@/components/ImageSlider";
import { useSession } from "@/context/SessionContext";
import { useCartContext } from "@/context/CartContext";
import { AddToCart } from "@/app/productChk/page";
import { Separator } from "@/components/ui/separator";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

interface ProductDetail {
    product_id: number;
    product_name: string;
    description: string;
    categoryName: string,
    price: number;
    sellerId: number;
    seller_email: string,
    seller_name: string,
    stripeSellerAccountId: string;
    stripeProductId: string;
    stripePriceId: string;
    digital_asset_url: string;
    image_urls: string[];
    category_id: number
}

const BREADCRUMBS = [
    { id: 1, name: 'Home', href: '/' },
    { id: 2, name: 'Products', href: '/products' },
]


export default function ProductDetailPage() {
    const params = useParams();
    const productIdStr = params.productId as string;

    const productId = Number(productIdStr);

    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [sameCategoryProducts, setSameCategoryProducts] = useState<ProductDetail[] | null>([]);
    const { userRole, sessionToken } = useSession();
    const { customerId, cartId } = useCartContext();


    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) {
                setError("Product ID is missing from the URL.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/productDetail/${productId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body:JSON.stringify({productId})
                });

                const data = await response.json();

                if (!response.ok || data.status !== 200) {
                    const errorMessage = data.message || "Failed to fetch product details.";
                    errorNotifier.notify(errorMessage);
                    setError(errorMessage);
                    setProduct(null);
                } else {
                    successNotifier.notify(data.message);
                    setProduct(data.product);
                    setSameCategoryProducts(data.sameCategoryProducts);
                }
            } catch (err: any) {
                console.error("Error fetching product details:", err);
                const errorMessage =
                    err.message || "An unexpected error occurred while fetching product details.";
                errorNotifier.notify(errorMessage);
                setError(errorMessage);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
                <p className="text-xl text-gray-600">Loading product details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative shadow-md">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
                <p className="text-xl text-gray-600">Product not found.</p>
            </div>
        );
    }

    return (
        <div>
            <div className=" min-h-screen flex items-center justify-center py-12">
                <div className=" rounded-3xl  overflow-hidden max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
                        <div>
                            <ol className="flex items-center space-x-2 mb-6">
                                {BREADCRUMBS.map((breadcrumb, i) => (
                                    <li key={breadcrumb.href}>
                                        <div className="flex items-center text-sm">
                                            <Link
                                                href={breadcrumb.href}
                                                className="font-medium text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200"
                                            >
                                                {breadcrumb.name}
                                            </Link>
                                            {i !== BREADCRUMBS.length - 1 ? (
                                                <svg
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                    aria-hidden="true"
                                                    className="ml-2 h-5 w-5 flex-shrink-0 text-gray-300"
                                                >
                                                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                                                </svg>
                                            ) : null}
                                        </div>
                                    </li>
                                ))}
                                <li>
                                    <div className="flex items-center text-sm">
                                        <span className="ml-2 font-medium text-gray-700">
                                            {product.product_name}
                                        </span>
                                    </div>
                                </li>
                            </ol>

                            <div className="mt-4">
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl leading-tight">
                                    {product.product_name}
                                </h1>
                            </div>

                            <section className="mt-4">
                                <div className="flex items-center">
                                    <p className="font-bold text-gray-900 text-3xl">
                                        ${product.price}
                                    </p>

                                    <div className="ml-4 border-l border-gray-300 pl-4 text-gray-600 text-sm font-medium">
                                        {product.categoryName}
                                    </div>
                                </div>

                                <div className="mt-6 space-y-6">
                                    <p className="text-base text-gray-700 leading-relaxed">
                                        {product.description}
                                    </p>
                                </div>

                                <div className="mt-6 flex items-center">
                                    <Check
                                        aria-hidden="true"
                                        className="h-5 w-5 flex-shrink-0 text-green-500"
                                    />
                                    <p className="ml-2 text-sm text-gray-600">
                                        Eligible for instant delivery
                                    </p>
                                </div>

                                <div className="mt-4 text-gray-600 text-sm">
                                    <p className="font-medium">
                                        <span className="font-semibold text-gray-800">Seller:</span>{" "}
                                        {product.seller_name} (
                                        <a
                                            href={`mailto:${product.seller_email}`}
                                            className="text-blue-600 hover:underline transition-colors duration-200"
                                        >
                                            {product.seller_email}
                                        </a>
                                        )
                                    </p>
                                </div>
                            </section>
                        </div>

                        <div className="mt-10 lg:col-start-2 lg:row-span-2 lg:mt-0 lg:self-center">

                            {product.image_urls ? (
                                <ImageSlider urls={product.image_urls} />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-gray-400 text-3xl font-bold bg-gray-200 rounded-2xl">
                                    No Image Available
                                </div>
                            )}

                        </div>

                        <div className="mt-10 lg:col-start-1 lg:row-start-2 lg:max-w-lg lg:self-start">
                            <div className="mt-10">
                                <button
                                    onClick={() => {
                                        addToCart({ productId: product.product_id, cartId })
                                    }}
                                    className="w-full inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 text-xl transform hover:scale-105 active:scale-95"
                                >
                                    <ShoppingCart className="h-7 w-7 mr-3" />
                                    Add to Cart
                                </button>
                            </div>
                            <div className="mt-6 text-center">
                                <div className="group inline-flex text-sm font-medium">
                                    <Shield
                                        aria-hidden="true"
                                        className="mr-2 h-5 w-5 flex-shrink-0 text-gray-400"
                                    />
                                    <span className="text-gray-600 hover:text-gray-800 transition-colors duration-200">
                                        30 Day Return Guarantee
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <MaxWidthWrapper>
                <Separator className="my-4" />
            </MaxWidthWrapper>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
                        {product.categoryName.toUpperCase()} Category Products
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {
                            sameCategoryProducts ?
                                sameCategoryProducts.map((product) => (
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
                                                <button className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors duration-300" onClick={() => {
                                                    addToCart({ productId: product.product_id, cartId })
                                                }}>
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
                                )) : null
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}