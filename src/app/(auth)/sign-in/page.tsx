"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { motion } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { errorNotifier, successNotifier } from '@/lib/designPatterns/observerPattern/notificationTrigger';


// Define the schema for sign-in form validation
const signInSchema = z.object({
    email: z.string().email({
        message: 'Please enter a valid email address.',
    }),
    password: z.string().min(8, {
        message: 'Password must be at least 8 characters.',
    }).max(8, {
        message: 'Password must be exactly 8 characters'
    }),
});

// Animation variants for the form container
const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
};

// Main Sign In Component
const SignInPage = () => {
    const [signInError, setSignInError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [userId, setUserId] = useState<number>();
    const [userRole, setUserRole] = useState<string | null>(null); // To store user role
    const [showPassword, setShowPassword] = useState(false);
    const [customerId, setCustomerId] = useState()
    const router = useRouter();
    const searchParams = useSearchParams();
    const cartId = searchParams.get('cartId');


    // Initialize the form using react-hook-form
    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // Function to handle form submission
    const onSubmit = async (values: z.infer<typeof signInSchema>) => {
        setIsSubmitting(true);
        setSignInError(null); // Reset error state

        try {
            // Send data to your backend API endpoint
            const response = await fetch('/api/sign-in', { // Updated route path
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to sign in.');
            }

            // If sign-in is successful
            const responseData = await response.json();
            console.log('Sign In Data:', responseData);

            if (responseData.status === 403) {
                errorNotifier.notify(responseData.message);
            } else {

                // Store user role
                setUserRole(responseData.user.role);
                setUserId(responseData.user.user_id);
                localStorage.setItem("user", JSON.stringify(responseData.user.user_id));
                setLoginSuccess(true);
            }



        } catch (error: any) {
            // Handle errors (e.g., display error message)
            console.error('Sign In Error:', error);
            setSignInError(error.message || 'An error occurred during sign in.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Function to handle navigation based on role
    const handleNavigation = async () => {
        if (cartId) {
            try {
                const response = await fetch('/api/update-sessionId-to-custId', {
                    method: 'POST',
                    body: JSON.stringify({ cartId, userId })
                });
                const data = await response.json();
                successNotifier.notify("Successfully sign-in")
                router.push(`/productChk?cartId=${data.cartId}`);
                return;
            } catch (error) {
                errorNotifier.notify("To buy products, please sign in with a customer account. Seller / Admins / Owner accounts are restricted from purchasing. Redirecting to seller dashboard ...")
            }
        }
        // if (typeof window !== 'undefined') {
        if (userRole === 'customer') {
            window.location.href = `/?role=customer&user_id=${userId}`;
        } else if (userRole === 'seller') {
            window.location.href = `/dashboard?role=seller&user_id=${userId}`;
        } else if (userRole === 'owner') {
            window.location.href = `/dashboard?role=owner&user_id=${userId}`;
        } else if (userRole === 'admin') {
            window.location.href = `/dashboard?role=admin&user_id=${userId}`;
        } else {
            window.location.href = '/dashboard?role=invalid'; //default
        }
        // }
    };

    // `${process.env.NEXT_PUBLIC_APP_URL}/seller/on-success?accountId=${account.id}&userId=${userId}`

    // Get welcome message
    const getWelcomeMessage = () => {
        if (userRole === 'seller') {
            return "Welcome Seller!";
        } else if (userRole === 'owner') {
            return "Welcome Owner!";
        } else if (userRole === 'admin') {
            return "Welcome Admin!";
        }
        else {
            return "Login Successful!";
        }
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <motion.div
                variants={formVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg space-y-6"
            >
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white text-center">
                    Sign In
                </h2>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 dark:text-gray-300">Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your email"
                                            {...field}
                                            type="email"
                                            className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-500 dark:text-red-400" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 dark:text-gray-300">Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter your password"
                                                {...field}
                                                type={showPassword ? 'text' : 'password'}
                                                className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                            />
                                            <button
                                                type="button"
                                                onClick={togglePasswordVisibility}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
                                                title={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? (
                                                    <Eye className="h-5 w-5" />
                                                ) : (
                                                    <EyeOff className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <Link href="/forgot-password" className="text-right text-blue-500 hover:underline text-sm">
                                        Forgot Password
                                    </Link>
                                    <FormMessage className="text-red-500 dark:text-red-400" />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300"
                            disabled={isSubmitting}
                        // onClick={() => handleNavigation()}
                        >
                            {isSubmitting ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </form>
                </Form>


                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link href="/sign-up" className="text-blue-500 hover:underline">
                        Sign Up
                    </Link>
                </div>
            </motion.div>
            <Dialog open={loginSuccess} onOpenChange={setLoginSuccess}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{getWelcomeMessage()}</DialogTitle>
                        <DialogDescription>
                            You have successfully logged in.  Redirecting...
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end">

                        <Button onClick={() => {
                            setLoginSuccess(false); // Close the dialog
                            handleNavigation(); // Navigate
                        }} className="bg-[#155DFC] hover:bg-blue-600 text-white">
                            Continue
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SignInPage;
