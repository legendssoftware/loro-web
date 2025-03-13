'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { signInSchema } from '@/lib/schema/auth';
import { useAuthStore } from '@/store/auth-store';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { PublicOnlyRoute } from '@/components/auth/public-only-route';
import { PageTransition } from '@/components/animations/page-transition';
import { itemVariants } from '@/lib/utils/animations';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';

type SignInSchema = z.infer<typeof signInSchema>;

// Sign in form component that uses useSearchParams
const SignInForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const { signIn, isLoading, error, clearAuthError } = useAuthStore();

    const [form, setForm] = useState<SignInSchema>({
        username: '',
        password: '',
    });
    const [errors, setErrors] = useState<{ [K in keyof SignInSchema]?: string }>({});

    // Clear any auth errors when component mounts or unmounts
    useEffect(() => {
        clearAuthError();
        return () => clearAuthError();
    }, [clearAuthError]);

    // Show toast for auth errors
    useEffect(() => {
        if (error) {
            showErrorToast(error, toast);
            clearAuthError();
        }
    }, [error, clearAuthError]);

    // Handle URL reason parameters for cases like token expiration or refresh failure
    useEffect(() => {
        const reason = searchParams.get('reason');
        if (reason) {
            let message = '';
            switch (reason) {
                case 'refresh_failed':
                    message = 'Your session has expired. Please sign in again.';
                    break;
                case 'token_expired':
                    message = 'Your authentication token has expired. Please sign in again.';
                    break;
                default:
                    message = 'Please sign in to continue.';
            }
            showErrorToast(message, toast);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = signInSchema.safeParse(form);

        if (!result.success) {
            const formattedErrors = result.error.issues.reduce((acc, issue) => {
                const path = issue.path[0] as keyof SignInSchema;
                acc[path] = issue.message;
                return acc;
            }, {} as { [K in keyof SignInSchema]?: string });

            setErrors(formattedErrors);
            return;
        }

        setErrors({});

        try {
            const response = await signIn({
                username: form.username.trim(),
                password: form.password.trim(),
            });

            // Only show success toast and redirect if we have valid tokens
            if (response.accessToken && response.refreshToken) {
                showSuccessToast('Sign in successful!', toast);

                // Simplified callback URL handling - decode it once and sanitize
                const decodedCallbackUrl = decodeURIComponent(callbackUrl);
                // Make sure callback URL is to our domain and valid
                const finalRedirectUrl = decodedCallbackUrl.startsWith('/') ?
                    decodedCallbackUrl :
                    '/'; // Default to home page if invalid

                // Shorter wait time before redirect
                await new Promise(resolve => setTimeout(resolve, 500));

                // Push to the sanitized URL
                router.push(finalRedirectUrl);
            } else if (response.message) {
                // If we have a message but no tokens, it's an error
                showErrorToast(response.message, toast);
            }
        } catch (error) {
            // Error handling is done in the useEffect above
            // showErrorToast will be triggered by the error state change
        }
    };

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <PublicOnlyRoute redirectTo={callbackUrl.startsWith('/') ? callbackUrl : '/'}>
            <PageTransition type='fade'>
                <div
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
                    <motion.div
                        className='relative w-full max-w-md p-6 space-y-4 shadow-lg sm:p-8 sm:space-y-6 bg-white/10 backdrop-blur-lg rounded-xl'
                        variants={itemVariants}
                    >
                        <h1 className='text-2xl font-normal text-center text-white sm:text-3xl font-heading'>
                            LORO CRM
                        </h1>
                        <form onSubmit={handleSubmit} className='mt-4 space-y-4 sm:mt-6'>
                            <div className='space-y-1'>
                                <label
                                    htmlFor='username'
                                    className='block text-xs font-light text-white uppercase font-body'
                                >
                                    Username
                                </label>
                                <Input
                                    id='username'
                                    type='text'
                                    value={form.username}
                                    onChange={e => setForm(prev => ({ ...prev, username: e.target.value }))}
                                    placeholder='theguy@loro.co.za'
                                    disabled={isLoading}
                                    className={cn(
                                        'bg-white/10 border-white/20 text-white placeholder:text-white/50 font-light',
                                        errors.username && 'border-red-500 focus-visible:ring-red-500',
                                        isLoading && 'opacity-50',
                                    )}
                                    aria-label='Username'
                                />
                                {errors.username && <p className='mt-1 text-xs text-red-500'>{errors.username}</p>}
                            </div>
                            <div className='space-y-1'>
                                <div className='flex justify-between'>
                                    <label
                                        htmlFor='password'
                                        className='block text-xs font-light text-white uppercase font-body'
                                    >
                                        Password
                                    </label>
                                    <Link
                                        href='/forgot-password'
                                        className={cn(
                                            'text-[9px] cursor-pointer text-white hover:text-white/80 font-light font-body uppercase',
                                            isLoading && 'pointer-events-none opacity-50',
                                        )}
                                        tabIndex={isLoading ? -1 : 0}
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className='relative'>
                                    <Input
                                        id='password'
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                                        placeholder='***********************'
                                        disabled={isLoading}
                                        className={cn(
                                            'bg-white/10 border-white/20 text-white placeholder:text-white/50 font-light pr-10',
                                            errors.password && 'border-red-500 focus-visible:ring-red-500',
                                            isLoading && 'opacity-50',
                                        )}
                                        aria-label='Password'
                                    />
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='icon'
                                        disabled={isLoading}
                                        className={cn(
                                            'absolute right-0 top-0 h-full px-3 text-white/70 hover:text-white hover:bg-transparent',
                                            isLoading && 'opacity-50',
                                        )}
                                        onClick={handleTogglePassword}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                                    </Button>
                                    {errors.password && <p className='mt-1 text-xs text-red-500'>{errors.password}</p>}
                                </div>
                            </div>

                            <Button
                                type='submit'
                                className={cn(
                                    'w-full bg-primary hover:bg-primary/90 p-5 font-normal font-body uppercase text-xs',
                                    isLoading && 'opacity-50',
                                )}
                                disabled={isLoading}
                                aria-label='Sign In'
                            >
                                {isLoading ? (
                                    <div className='flex items-center justify-center space-x-1'>
                                        <p className='font-normal text-white uppercase'>Signing In</p>
                                        <Loader2
                                            className='w-4 h-4 mr-2 text-white animate-spin'
                                            size={16}
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                ) : (
                                    <span className='font-normal text-white'>Sign In</span>
                                )}
                            </Button>
                        </form>
                        <div className='space-y-2 text-center'>
                            <div className='text-[10px] text-white font-light flex flex-row items-center space-x-1 justify-center'>
                                <p className='font-body uppercase text-[10px] text-white'>
                                    Don&apos;t have an account?
                                </p>
                                <Link
                                    href='/sign-up'
                                    className={cn(
                                        'text-white hover:text-white/80 font-normal uppercase font-body text-[10px]',
                                        isLoading && 'pointer-events-none opacity-50',
                                    )}
                                    tabIndex={isLoading ? -1 : 0}
                                >
                                    Create one
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </PageTransition>
        </PublicOnlyRoute>
    );
};

// Loading fallback for suspense
const SignInFallback = () => {
    return (
        <div className='flex items-center justify-center min-h-screen p-4 bg-gray-900'>
            <div className='flex flex-col items-center space-y-4'>
                <Loader2 className='w-10 h-10 text-primary animate-spin' />
                <p className='text-sm text-white'>Loading...</p>
            </div>
        </div>
    );
};

// Main page component with Suspense boundary
const SignInPage = () => {
    return (
        <Suspense fallback={<SignInFallback />}>
            <SignInForm />
        </Suspense>
    );
};

export default SignInPage;
