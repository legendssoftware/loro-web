'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Loader2,
    Eye,
    EyeOff,
    Building2,
    Briefcase,
    ArrowLeft,
} from 'lucide-react';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

type SignInSchema = z.infer<typeof signInSchema>;

// Client sign in schema based on DTO
const clientSignInSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

type ClientSignInSchema = z.infer<typeof clientSignInSchema>;

// User sign in form component
const UserSignInForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const { signIn, isLoading, error, clearAuthError, profileData } = useAuthStore();

    const [form, setForm] = useState<SignInSchema>({
        username: '',
        password: '',
    });
    const [errors, setErrors] = useState<{
        [K in keyof SignInSchema]?: string;
    }>({});

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
                    message =
                        'Your authentication token has expired. Please sign in again.';
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
            const formattedErrors = result.error.issues.reduce(
                (acc, issue) => {
                    const path = issue.path[0] as keyof SignInSchema;
                    acc[path] = issue.message;
                    return acc;
                },
                {} as { [K in keyof SignInSchema]?: string },
            );

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
                const hour = new Date().getHours();
                const greeting =
                    hour < 12
                        ? 'Good morning'
                        : hour < 18
                          ? 'Good afternoon'
                          : 'Good evening';

                // Use profileData from the store, which should be updated by signIn
                // or fallback to response.profileData if store isn't updated yet.
                const nameToGreet = profileData?.name || response?.profileData?.name || 'User';

                showSuccessToast(
                    `${greeting},  ${nameToGreet}!`,
                    toast,
                );

                // Validate and use callbackUrl for redirection
                let redirectTarget = '/';
                if (callbackUrl) {
                    try {
                        const parsedCallback = callbackUrl.startsWith('/')
                            ? new URL(callbackUrl, window.location.origin)
                            : new URL(callbackUrl);

                        if (parsedCallback.origin === window.location.origin && parsedCallback.pathname.startsWith('/')) {
                            redirectTarget = parsedCallback.pathname + parsedCallback.search + parsedCallback.hash;
                        } else {
                            console.warn('UserSignInForm: Invalid callbackUrl origin. Defaulting to /.');
                        }
                    } catch (e) {
                        console.warn('UserSignInForm: Invalid callbackUrl format. Defaulting to /.');
                    }
                }

                // Use window.location.href for a hard navigation instead of router.push
                // This ensures the middleware can properly handle the authentication
                window.location.href = redirectTarget;
            } else if (response.message) {
                // If we have a message but no tokens, it's an error
                showErrorToast(response.message, toast);
            }
        } catch (error) {
            // Error handling is done in the useEffect above
        }
    };

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 sm:mt-6">
            <div className="space-y-1">
                <label
                    htmlFor="username"
                    className="block text-xs font-light text-white uppercase font-body"
                >
                    Username
                </label>
                <Input
                    id="username"
                    type="text"
                    value={form.username}
                    onChange={(e) =>
                        setForm((prev) => ({
                            ...prev,
                            username: e.target.value,
                        }))
                    }
                    placeholder="theguy@loro.co.za"
                    disabled={isLoading}
                    className={cn(
                        'bg-white/10 border-white/20 text-white placeholder:text-white/50 font-light',
                        errors.username &&
                            'border-red-500 focus-visible:ring-red-500',
                        isLoading && 'opacity-50',
                    )}
                    aria-label="Username"
                />
                {errors.username && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.username}
                    </p>
                )}
            </div>
            <div className="space-y-1">
                <div className="flex justify-between">
                    <label
                        htmlFor="password"
                        className="block text-xs font-light text-white uppercase font-body"
                    >
                        Password
                    </label>
                    <Link
                        href="/forgot-password"
                        className={cn(
                            'text-[9px] cursor-pointer text-white hover:text-white/80 font-light font-body uppercase',
                            isLoading && 'pointer-events-none opacity-50',
                        )}
                        tabIndex={isLoading ? -1 : 0}
                    >
                        Forgot password?
                    </Link>
                </div>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                password: e.target.value,
                            }))
                        }
                        placeholder="***********************"
                        disabled={isLoading}
                        className={cn(
                            'bg-white/10 border-white/20 text-white placeholder:text-white/50 font-light pr-10',
                            errors.password &&
                                'border-red-500 focus-visible:ring-red-500',
                            isLoading && 'opacity-50',
                        )}
                        aria-label="Password"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isLoading}
                        className={cn(
                            'absolute right-0 top-0 h-full px-3 text-white/70 hover:text-white hover:bg-transparent',
                            isLoading && 'opacity-50',
                        )}
                        onClick={handleTogglePassword}
                        aria-label={
                            showPassword ? 'Hide password' : 'Show password'
                        }
                    >
                        {showPassword ? (
                            <EyeOff className="w-4 h-4 text-white/70" />
                        ) : (
                            <Eye className="w-4 h-4 text-white/70" />
                        )}
                    </Button>
                    {errors.password && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.password}
                        </p>
                    )}
                </div>
            </div>

            <Button
                type="submit"
                className={cn(
                    'w-full bg-primary hover:bg-primary/90 p-5 font-normal font-body uppercase text-xs',
                    isLoading && 'opacity-50',
                )}
                disabled={isLoading}
                aria-label="Sign In"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center space-x-1">
                        <p className="font-normal text-white uppercase">
                            Signing In
                        </p>
                        <Loader2
                            className="w-4 h-4 mr-2 text-white animate-spin"
                            size={16}
                            strokeWidth={1.5}
                        />
                    </div>
                ) : (
                    <span className="font-normal text-white">Sign In</span>
                )}
            </Button>
        </form>
    );
};

// Client sign in form component
const ClientSignInForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const { clientSignIn, isLoading, error, clearAuthError } = useAuthStore();

    const [form, setForm] = useState<ClientSignInSchema>({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<{
        [K in keyof ClientSignInSchema]?: string;
    }>({});

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = clientSignInSchema.safeParse(form);

        if (!result.success) {
            const formattedErrors = result.error.issues.reduce(
                (acc, issue) => {
                    const path = issue.path[0] as keyof ClientSignInSchema;
                    acc[path] = issue.message;
                    return acc;
                },
                {} as { [K in keyof ClientSignInSchema]?: string },
            );

            setErrors(formattedErrors);
            return;
        }

        setErrors({});

        try {
            const response = await clientSignIn({
                email: form.email.trim(),
                password: form.password.trim(),
            });

            // Only show success toast and redirect if we have valid tokens
            if (response.accessToken && response.refreshToken) {
                const hour = new Date().getHours();
                const greeting =
                    hour < 12
                        ? 'Good morning'
                        : hour < 18
                        ? 'Good afternoon'
                        : 'Good evening';

                showSuccessToast(
                    `${greeting}, welcome to the client portal!`,
                    toast,
                );

                // Always redirect client users directly to quotations page
                // Use window.location.href for a hard navigation instead of router.push
                // This ensures the middleware can properly handle the authentication
                window.location.href = '/quotations';
            } else if (response.message) {
                // If we have a message but no tokens, it's an error
                showErrorToast(response.message, toast);
            }
        } catch (error) {
            // Error handling is done in the useEffect above
        }
    };

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 sm:mt-6">
            <div className="space-y-1">
                <label
                    htmlFor="client-email"
                    className="block text-xs font-light text-white uppercase font-body"
                >
                    Email
                </label>
                <Input
                    id="client-email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                        setForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                        }))
                    }
                    placeholder="client@example.com"
                    disabled={isLoading}
                    className={cn(
                        'bg-white/10 border-white/20 text-white placeholder:text-white/50 font-light',
                        errors.email &&
                            'border-red-500 focus-visible:ring-red-500',
                        isLoading && 'opacity-50',
                    )}
                    aria-label="Email"
                />
                {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
            </div>
            <div className="space-y-1">
                <div className="flex justify-between">
                    <label
                        htmlFor="client-password"
                        className="block text-xs font-light text-white uppercase font-body"
                    >
                        Password
                    </label>
                    <Link
                        href="/forgot-password"
                        className={cn(
                            'text-[9px] cursor-pointer text-white hover:text-white/80 font-light font-body uppercase',
                            isLoading && 'pointer-events-none opacity-50',
                        )}
                        tabIndex={isLoading ? -1 : 0}
                    >
                        Forgot password?
                    </Link>
                </div>
                <div className="relative">
                    <Input
                        id="client-password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                password: e.target.value,
                            }))
                        }
                        placeholder="***********************"
                        disabled={isLoading}
                        className={cn(
                            'bg-white/10 border-white/20 text-white placeholder:text-white/50 font-light pr-10',
                            errors.password &&
                                'border-red-500 focus-visible:ring-red-500',
                            isLoading && 'opacity-50',
                        )}
                        aria-label="Password"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isLoading}
                        className={cn(
                            'absolute right-0 top-0 h-full px-3 text-white/70 hover:text-white hover:bg-transparent',
                            isLoading && 'opacity-50',
                        )}
                        onClick={handleTogglePassword}
                        aria-label={
                            showPassword ? 'Hide password' : 'Show password'
                        }
                    >
                        {showPassword ? (
                            <EyeOff className="w-4 h-4 text-white/70" />
                        ) : (
                            <Eye className="w-4 h-4 text-white/70" />
                        )}
                    </Button>
                    {errors.password && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.password}
                        </p>
                    )}
                </div>
            </div>

            <Button
                type="submit"
                className={cn(
                    'w-full bg-primary hover:bg-primary/90 p-5 font-normal font-body uppercase text-xs',
                    isLoading && 'opacity-50',
                )}
                disabled={isLoading}
                aria-label="Sign In"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center space-x-1">
                        <p className="font-normal text-white uppercase">
                            Signing In
                        </p>
                        <Loader2
                            className="w-4 h-4 mr-2 text-white animate-spin"
                            size={16}
                            strokeWidth={1.5}
                        />
                    </div>
                ) : (
                    <span className="font-normal text-white">Sign In</span>
                )}
            </Button>
        </form>
    );
};

// Sign in form component with tabs
const SignInForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const { isLoading } = useAuthStore();
    const [activeTab, setActiveTab] = useState<string>('employee');

    const handleTabChange = (tabValue: string) => {
        setActiveTab(tabValue);
    };

    const handleGoBack = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent default navigation behavior
        // Force navigation to the landing page without preserving any query parameters
        window.location.replace('/landing-page');
    };

    return (
        <PublicOnlyRoute
            redirectTo={callbackUrl.startsWith('/') ? callbackUrl : '/'}
        >
            <PageTransition type="fade">
                <div
                    className="relative flex items-center justify-center min-h-screen p-4"
                    style={{
                        backgroundImage:
                            'url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rcRWmJ3wUamu61uy3uz2BHS5rxJP3t.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'bottom center',
                        backgroundRepeat: 'no-repeat',
                    }}
                >
                    <div className="absolute inset-0 bg-black/50" />
                    <motion.div
                        className="relative w-full max-w-md p-6 space-y-4 shadow-lg sm:p-8 sm:space-y-6 bg-white/10 backdrop-blur-lg rounded-xl"
                        variants={itemVariants}
                    >
                        <div className="absolute top-4 left-4">
                            <a
                                href="/landing"
                                onClick={handleGoBack}
                                className="block"
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    type="button"
                                    className="rounded-full text-white/70 hover:text-white hover:bg-white/10"
                                    aria-label="Go back to landing page"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </a>
                        </div>

                        <h1 className="text-2xl font-normal text-center text-white sm:text-3xl font-heading">
                            LORO CRM
                        </h1>

                        <div className="w-full">
                            <div className="flex items-center mb-6">
                                <div className="relative flex items-center justify-center flex-1 gap-1 mr-4 cursor-pointer">
                                    <div
                                        className={`mb-3 font-body px-0 font-normal flex justify-center items-center w-full ${
                                            activeTab === 'employee'
                                                ? 'text-primary'
                                                : 'text-white/70 hover:text-white'
                                        }`}
                                        onClick={() =>
                                            handleTabChange('employee')
                                        }
                                    >
                                        <Building2 className="w-4 h-4 mr-2" />
                                        <span className="text-xs font-thin uppercase font-body">
                                            Employee Portal
                                        </span>
                                    </div>
                                    {activeTab === 'employee' && (
                                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary" />
                                    )}
                                </div>
                                <div className="relative flex items-center justify-center flex-1 gap-1 mr-4 cursor-pointer">
                                    <div
                                        className={`mb-3 font-body px-0 font-normal flex justify-center items-center w-full ${
                                            activeTab === 'client'
                                                ? 'text-primary'
                                                : 'text-white/70 hover:text-white'
                                        }`}
                                        onClick={() =>
                                            handleTabChange('client')
                                        }
                                    >
                                        <Briefcase className="w-4 h-4 mr-2" />
                                        <span className="text-xs font-thin uppercase font-body">
                                            Client Portal
                                        </span>
                                    </div>
                                    {activeTab === 'client' && (
                                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary" />
                                    )}
                                </div>
                            </div>

                            <div className="mt-4">
                                {activeTab === 'employee' && <UserSignInForm />}
                                {activeTab === 'client' && <ClientSignInForm />}
                            </div>
                        </div>

                        <div className="pt-4 space-y-2 text-center">
                            <div className="text-[10px] text-white font-light flex flex-row items-center space-x-1 justify-center">
                                <p className="font-body uppercase text-[10px] text-white">
                                    Don&apos;t have an account?
                                </p>
                                <Link
                                    href="/sign-up"
                                    className={cn(
                                        'text-white hover:text-white/80 font-normal uppercase font-body text-[10px]',
                                        isLoading &&
                                            'pointer-events-none opacity-50',
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
        <div className="flex items-center justify-center min-h-screen p-4 bg-gray-900">
            <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-white">Loading...</p>
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
