'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Mail, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import Link from 'next/link';

// Validation schema
const verificationSchema = z.object({
    email: z.string().email(),
    userVerificationCode: z
        .string()
        .min(6, { message: 'Code must be 6 digits' })
        .max(6, { message: 'Code must be 6 digits' })
        .refine((val) => /^\d+$/.test(val), {
            message: 'Code must contain only numbers',
        }),
});

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

type VerificationStatus = 'idle' | 'success' | 'error' | 'loading';

const VerifyEmailPage = () => {
    const [email, setEmail] = useState<string>('');
    const [userVerificationCode, setUserVerificationCode] = useState<string>('');
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
    const [message, setMessage] = useState<string>('');
    const [timer, setTimer] = useState<number>(0); // Initialize timer to 0
    const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;

        if (isTimerActive && timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (timer === 0 && isTimerActive) {
            setIsTimerActive(false);
            setMessage((prevMessage) => prevMessage ? prevMessage : 'Verification code expired. Please resend.');
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isTimerActive, timer]);

    const handleVerify = async () => {
        setIsVerifying(true);
        setVerificationStatus('loading');
        setMessage('Verifying code...');

        const validationResult = verificationSchema.safeParse({
            email,
            userVerificationCode,
        });

        if (!validationResult.success) {
            setVerificationStatus('error');
            setMessage(validationResult.error.issues[0].message);
            setIsVerifying(false);
            return;
        }

        try {
            const response = await fetch('/api/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    code: userVerificationCode,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json() as { message?: string };
                throw new Error(errorData.message || 'Failed to verify email.');
            }

            const data = await response.json() as { message: string };
            setVerificationStatus('success');
            setMessage(data.message);
            router.push('/sign-in');
        } catch (error: any) {
            setVerificationStatus('error');
            setMessage(error.message || 'Failed to verify email.');
        } finally {
            setIsVerifying(false);
        }
    };


    useEffect(() => {
        const delay = setTimeout(() => {
            startResendTimer();
        }, 500); // Delay 5 seconds

        return () => clearTimeout(delay); // Cleanup in case component unmounts
    }, []);

    const startResendTimer = () => {
        setMessage('Sending new verification code...');
        setIsTimerActive(true);
        setTimer(60);
        setTimeout(() => {
            setMessage('New verification code sent. Please check your email.');
        }, 2000);
    };


    const isFormValid = verificationSchema.safeParse({
        email,
        userVerificationCode,
    }).success;

    const isVerifyButtonDisabled =
        isVerifying || verificationStatus === 'success' || !isFormValid;

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
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Verify Your Email</h2>
                </div>

                <div className="space-y-4">
                    <Input
                        required
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        disabled={isVerifying}
                    />
                    <Input
                        required
                        type="text"
                        placeholder="Enter verification code"
                        value={userVerificationCode}
                        onChange={(e) => setUserVerificationCode(e.target.value)}
                        className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        disabled={isVerifying}
                    />
                    <Button
                        onClick={handleVerify}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300"
                        disabled={isVerifyButtonDisabled}
                    >
                        {isVerifying ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            'Verify'
                        )}
                    </Button>

                    <div className="text-right mt-2">
                        {!isTimerActive && timer === 0 && (
                            <Link href='/resend-code' className="text-blue-500 hover:underline cursor-pointer">
                                <p
                                    className="text-blue-500 hover:underline cursor-pointer"
                                >
                                    Resend Code
                                </p>
                            </Link>

                        )}
                        {isTimerActive && timer > 0 && (
                            <p className="text-gray-500 dark:text-gray-400 mt-2">
                                .. Resend available in: {timer} seconds
                            </p>
                        )}
                    </div>
                    <Button
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300"
                    >
                        <Link href="/sign-in">Sign In</Link>
                    </Button>
                </div>

                {verificationStatus === 'error' && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}
                {verificationStatus === 'success' && (
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

export default VerifyEmailPage;