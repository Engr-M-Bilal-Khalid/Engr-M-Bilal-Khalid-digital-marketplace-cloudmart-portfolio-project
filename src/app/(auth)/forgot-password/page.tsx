"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleResetPassword = async () => {
        setStatus('loading');
        setMessage(''); // Clear previous messages

        try {
            //  Call the forgot password API endpoint
            const response = await fetch('/api/forgot-password', { //  Corrected route
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to send password reset email.');
            }

            const data = await response.json();
            setMessage(data.message);
            setStatus('success');


        } catch (error: any) {
            setMessage(error.message || 'Failed to send password reset email.');
            setStatus('error');
        } finally {
            setStatus('idle'); //  important, remove loading state.
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <Mail className="w-10 h-10 text-blue-500" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Forgot Your Password?</h2>
                <p className="text-gray-600 mb-6 text-center">
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mb-4"
                    disabled={status === 'loading'}
                />

                <Button
                    onClick={handleResetPassword}
                    className={cn(
                        "w-full",
                        status === 'loading' && "opacity-70 cursor-not-allowed"
                    )}
                    disabled={status === 'loading'}
                >
                    {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                </Button>

                {message && (
                    <div
                        className={cn(
                            "mt-4 p-3 rounded-md text-center",
                            status === 'success' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800 flex items-center gap-2"
                        )}
                    >
                        {status === 'error' && <AlertTriangle className="w-5 h-5" />}
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
