"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { errorNotifier, successNotifier } from '@/lib/designPatterns/observerPattern/notificationTrigger';




const signUpSchema = z.object({
    name: z.string().min(2, {
        message: 'Name must be at least 2 characters.',
    }),
    email: z.string().email({
        message: 'Please enter a valid email address.',
    }),
    password: z.string().min(8, { // Minimum length of 8
        message: 'Password must be exactly 8 characters.',
    }).max(8, {  //Maximum length of 8
        message: 'Password must be exactly 8 characters'
    }).regex(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8}$/), {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    }),
    confirmPassword: z.string(),
    role: z.enum(['customer', 'seller'], {
        required_error: "Please select a role",
    }),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // path of error
})

// Animation variants for the form container
const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
};

// Main Sign Up Component
const SignUpPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [signUpError, setSignUpError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [role, setRole] = useState<string | undefined>('customer'); // Default role
    const router = useRouter();
    // Initialize the form using react-hook-form
    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'customer', // set default value
        },
    });

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };
    // Function to handle form submission
    const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true);
        setSignUpError(null); // Reset error state

        try {
            // Send data to your backend API endpoint
            const response = await fetch('/api/sign-up', { // Updated route path
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to sign up.');
            }

            // If sign-up is successful
            console.log('Sign Up Data:', values);
            successNotifier.notify("Account has been created successfully");
            form.reset();
            router.push('/verify-email');
        } catch (error: any) {
            console.error('Sign Up Error:', error);
            errorNotifier.notify(error)
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update local state when the role changes, so we can show/hide fields.
    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === 'role') {
                setRole(value.role);
            }
        });
        return () => subscription.unsubscribe();
    }, [form.watch]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 pb-15 pt-30">
            <motion.div
                variants={formVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg space-y-6"
            >
                <h2 className="text-3xl font-semibold text-gray-800 dark:text-white text-center">
                    Sign Up
                </h2>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 dark:text-gray-300">Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your name"
                                            {...field}
                                            className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-500 dark:text-red-400" />
                                </FormItem>
                            )}
                        />
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
                                        <div className='relative'>
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
                                                title={showPassword ? 'Hide confirm password' : 'Show confirm password'}
                                            >
                                                {showPassword ? (
                                                    <Eye className="h-5 w-5" />
                                                ) : (
                                                    <EyeOff className="h-5 w-5" />
                                                )}
                                            </button>

                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-red-500 dark:text-red-400" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 dark:text-gray-300">Confirm Password</FormLabel>
                                    <FormControl>
                                        <div className='relative'>
                                            <Input
                                                placeholder="Confirm your password"
                                                {...field}
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                            />
                                            <button
                                                type="button"
                                                onClick={toggleConfirmPasswordVisibility}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
                                                title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                            >
                                                {showConfirmPassword ? (
                                                    <Eye className="h-5 w-5" />
                                                ) : (
                                                    <EyeOff className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-red-500 dark:text-red-400" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 dark:text-gray-300">Role</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                                            <SelectItem value="customer" className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white">Customer</SelectItem>
                                            <SelectItem value="seller" className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white">Seller</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-red-500 dark:text-red-400" />
                                </FormItem>
                            )}
                        />



                        <Button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                        </Button>
                    </form>
                </Form>



                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <a href="/sign-in" className="text-blue-500 hover:underline">
                        Sign in
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

export default SignUpPage;
