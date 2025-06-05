"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';
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

// Define the schema for password reset using Zod
const resetPasswordSchema = z.object({
    password: z.string().min(8, { // Enforce minimum length
        message: 'Password must be at least 8 characters long.',
    }).max(8, {
        message: 'Password must be at most 8 characters long.',
    }).regex(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/), { // Removed {8}$
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    }),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

// Animation variants for the form container
const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
};

// Main Reset Password Component
const ResetPasswordPage = () => {
    const [resetError, setResetError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [token, setToken] = useState<string | null>(null); // To store the token from the URL


    // Initialize the form using react-hook-form
    const form = useForm<z.infer<typeof resetPasswordSchema>>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const { password, confirmPassword } = form.watch();

    const isFormValid = resetPasswordSchema.safeParse({
        password,
        confirmPassword,
    }).success;

    // Get the token from the URL query parameters
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const tokenFromURL = urlParams.get('token');
            if (tokenFromURL) {
                
                setToken(tokenFromURL);
            } else {
                // Handle the case where there's no token (e.g., redirect or show an error)
                setResetError("Invalid or missing reset token."); // set a user friendly message
            }
        }
    }, []);

    // Function to handle form submission
    const onSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
        setIsSubmitting(true);
        setResetError(null); // Reset error state

        if (!token) {
            setResetError("Missing reset token.  Cannot complete password reset.");
            setIsSubmitting(false);
            return;
        }

        // Simulate an API call (replace with your actual reset logic)
        try {
            // Simulate a delay
            // await new Promise(resolve => setTimeout(resolve, 2000));

            // In a real app, you would send the data to your backend here
            const response = await fetch('/api/reset-password', {  //  API endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token, // Include the token
                    newPassword: values.password, // Send the new password
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to reset password.');
            }

            const data = await response.json();
            console.log('Reset Password Response:', data);
            // Redirect to a success page or login page
            alert(data.message); // Show success message
            //window.location.href = '/login'; //redirect

        } catch (error: any) {
            // Handle errors (e.g., display error message)
            console.error('Reset Password Error:', error);
            setResetError(error.message || 'An error occurred during password reset.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <motion.div
                variants={formVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg space-y-6"
            >
                <div className="flex justify-center mb-6">
                    <Lock className="w-10 h-10 text-blue-500" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white text-center">
                    Reset Your Password
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                    Enter your new password.
                </p>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 dark:text-gray-300">New Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter your new password"
                                                {...field}
                                                type={showPassword ? 'text' : 'password'}
                                                className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 pr-10" // Make space for the icon
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
                                    <FormMessage className="text-red-500 dark:text-red-400" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 dark:text-gray-300">Confirm New Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                placeholder="Confirm your new password"
                                                {...field}
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 pr-10" // Make space for the icon
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

                        <Button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300"
                            disabled={isSubmitting} // Disable button if submitting or form is invalid
                        >
                            {isSubmitting ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </form>
                </Form>

                {resetError && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{resetError}</AlertDescription>
                    </Alert>
                )}

                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Remembered your password?{' '}
                    <a href="/sign-in" className="text-blue-500 hover:underline">
                        Sign in
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
