'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Mail, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import  Link  from 'next/link';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            delayChildren: 0.3,
            staggerChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
    },
};

const ResendCodePage = () => {
    const [email, setEmail] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
    const [message, setMessage] = useState('Enter your email to resend the verification code.');
    const router = useRouter();

    const handleResendCode = async () => {
        setIsResending(true);
        setResendStatus('loading');
        setMessage('Sending code...');

        try {
            // Simulate API call delay
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Make an API call to your backend to resend the code
            const response = await fetch('/api/resend-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to resend verification code.');
            }

            const data = await response.json();
            setResendStatus('success');
            setMessage(data.message); // Or a more specific message
            // router.push('/verify-email'); //removed auto route

        } catch (error: any) {
            setResendStatus('error');
            setMessage(error.message || 'Failed to resend verification code.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <motion.div
            className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div
                className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg space-y-6"
                variants={itemVariants}
            >
                <div className="text-center">
                    <Mail className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Resend Verification Code</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {message}
                    </p>
                </div>

                <div className="space-y-4">
                    <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        disabled={isResending}
                    />
                    <Button
                        onClick={handleResendCode}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300"
                        disabled={isResending}
                    >
                        {isResending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            'Resend Code'
                        )}
                    </Button>
                    <div className="text-center mt-2">
                        <Link href="/verify-email">
                            <p className="text-blue-500 hover:underline cursor-pointer">
                                Go to Verify Email
                            </p>
                        </Link>
                    </div>
                </div>

                {resendStatus === 'error' && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}
                {resendStatus === 'success' && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}
            </motion.div>
        </motion.div>
    );
};

export default ResendCodePage;
