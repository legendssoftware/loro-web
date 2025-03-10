'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { containerVariants } from '@/lib/utils/animations';

// Client component that uses useSearchParams
const VerifyEmailClient = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                toast.error('Invalid verification link', {
                    style: {
                        borderRadius: '5px',
                        background: '#333',
                        color: '#fff',
                        fontFamily: 'var(--font-unbounded)',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        fontWeight: '300',
                        padding: '16px',
                    },
                    duration: 5000,
                    position: 'bottom-center',
                    icon: '❌',
                });
                router.push('/sign-up');
                return;
            }

            try {
                const response = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Verification failed');
                }

                toast.success(data.message, {
                    style: {
                        borderRadius: '5px',
                        background: '#333',
                        color: '#fff',
                        fontFamily: 'var(--font-unbounded)',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        fontWeight: '300',
                        padding: '16px',
                    },
                    duration: 5000,
                    position: 'bottom-center',
                    icon: '✅',
                });

                // Wait for toast to finish
                await new Promise(resolve => setTimeout(resolve, 2000));
                router.push(`/new-password?token=${token}`);
            } catch (error) {
                if (error instanceof Error) {
                    toast.error(error.message, {
                        style: {
                            borderRadius: '5px',
                            background: '#333',
                            color: '#fff',
                            fontFamily: 'var(--font-unbounded)',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            fontWeight: '300',
                            padding: '16px',
                        },
                        duration: 5000,
                        position: 'bottom-center',
                        icon: '❌',
                    });
                }
                router.push('/sign-up');
            }
        };

        verifyEmail();
    }, [token, router]);

    return (
        <motion.div
            initial='hidden'
            animate='show'
            variants={containerVariants}
            className='relative flex items-center justify-center min-h-screen p-4'
            style={{
                backgroundImage:
                    'url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rcRWmJ3wUamu61uy3uz2BHS5rxJP3t.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'bottom center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div className='absolute inset-0 bg-black/50' />
            <div className='relative w-full max-w-md p-6 space-y-4 text-center shadow-lg sm:p-8 sm:space-y-6 bg-white/10 backdrop-blur-lg rounded-xl'>
                <h1 className='text-2xl font-normal text-center text-white uppercase sm:text-3xl font-heading'>
                    Verifying Email
                </h1>
                <div className='flex flex-col items-center justify-center gap-4'>
                    <Loader2 className='w-8 h-8 text-white animate-spin' />
                    <p className='text-xs text-white uppercase font-body'>Please wait while we verify your email...</p>
                </div>
            </div>
        </motion.div>
    );
};

// Loading fallback component
const EmailVerificationLoading = () => {
    return (
        <div className='relative flex items-center justify-center min-h-screen p-4'
            style={{
                backgroundImage:
                    'url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rcRWmJ3wUamu61uy3uz2BHS5rxJP3t.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'bottom center',
                backgroundRepeat: 'no-repeat',
            }}>
            <div className='absolute inset-0 bg-black/50' />
            <div className='relative w-full max-w-md p-6 space-y-4 text-center shadow-lg sm:p-8 sm:space-y-6 bg-white/10 backdrop-blur-lg rounded-xl'>
                <h1 className='text-2xl font-normal text-center text-white uppercase sm:text-3xl font-heading'>
                    Loading
                </h1>
                <div className='flex flex-col items-center justify-center gap-4'>
                    <Loader2 className='w-8 h-8 text-white animate-spin' />
                    <p className='text-xs text-white uppercase font-body'>Initializing...</p>
                </div>
            </div>
        </div>
    );
};

// Main page component with Suspense boundary
export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<EmailVerificationLoading />}>
            <VerifyEmailClient />
        </Suspense>
    );
}
