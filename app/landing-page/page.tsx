'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
    Menu,
    LogIn,
    User,
    Download,
    Smartphone,
    PhoneCall,
} from 'lucide-react';
import { ThemeToggler } from '@/modules/navigation/theme.toggler';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { PageTransition } from '@/components/animations/page-transition';
import { toast } from 'react-hot-toast';
import Vapi from '@vapi-ai/web';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';
import {
    handleVapiError,
    retryVapiOperation,
} from '@/lib/utils/vapi-error-handler';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

// Update the constants for call time management to use environment variables with fallbacks
const CALL_MAX_DURATION_MS =
    parseInt(process.env.NEXT_PUBLIC_MAX_CALL_DURATION_MINUTES || '5', 10) *
    60 *
    1000; // Default: 5 minutes
const WARNING_TIME_REMAINING_MS =
    parseInt(process.env.NEXT_PUBLIC_CALL_WARNING_SECONDS || '60', 10) * 1000; // Default: 60 seconds

const LandingPage: React.FunctionComponent = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isCallInitializing, setIsCallInitializing] = useState(false);
    const [demoVapi, setDemoVapi] = useState<Vapi | null>(null);
    const [connectionError, setConnectionError] = useState<Error | null>(null);
    const initAttemptedRef = useRef(false);
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const callStartTimeRef = useRef<number | null>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const warningShownRef = useRef(false);

    const formattedTimeRemaining = useMemo(() => {
        if (timeRemaining === null) return null;

        const totalSeconds = Math.ceil(timeRemaining / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, [timeRemaining]);

    const startCallTimer = useCallback(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }

        warningShownRef.current = false;

        callStartTimeRef.current = Date.now();
        setTimeRemaining(CALL_MAX_DURATION_MS);

        timerIntervalRef.current = setInterval(() => {
            if (!callStartTimeRef.current) return;

            const elapsed = Date.now() - callStartTimeRef.current;
            const remaining = Math.max(0, CALL_MAX_DURATION_MS - elapsed);
            setTimeRemaining(remaining);

            if (
                remaining <= WARNING_TIME_REMAINING_MS &&
                !warningShownRef.current
            ) {
                warningShownRef.current = true;
                toast('1 minute remaining in your call', {
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
                    duration: 4000,
                    position: 'bottom-center',
                    icon: '⏱️',
                });
            }

            if (remaining <= 0) {
                toast('Call time limit reached (5 minutes)', {
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
                    duration: 4000,
                    position: 'bottom-center',
                    icon: '⏰',
                });

                clearInterval(timerIntervalRef.current!);
                timerIntervalRef.current = null;
                endDemoCall();
            }
        }, 1000);
    }, []);

    const stopCallTimer = useCallback(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        callStartTimeRef.current = null;
        setTimeRemaining(null);
        warningShownRef.current = false;
    }, []);

    // Initialize Vapi instance for demo calls (without authentication requirement)
    useEffect(() => {
        // Skip if we've already attempted initialization
        if (initAttemptedRef.current) {
            return;
        }

        initAttemptedRef.current = true;

        const initializeVapi = async () => {
            try {
                const apiKey = process.env.NEXT_PUBLIC_VAPI_KEY;

                if (!apiKey) {
                    throw new Error(
                        'Vapi API key is not defined in environment variables',
                    );
                }

                // Create Vapi instance only once
                const vapiInstance = new Vapi(apiKey);

                // Set up event listeners
                vapiInstance.on('call-start', () => {
                    setIsCallActive(true);
                    setIsCallInitializing(false);
                    setConnectionError(null);
                    startCallTimer();
                    showSuccessToast('Connected to Loro AI Assistant', toast);
                });

                vapiInstance.on('call-end', () => {
                    setIsCallActive(false);
                    setConnectionError(null);
                    stopCallTimer();
                    showSuccessToast('Call ended. Thank you!', toast);
                });

                vapiInstance.on('error', (error) => {
                    setIsCallInitializing(false);
                    setIsCallActive(false);
                    stopCallTimer();
                    setConnectionError(
                        error instanceof Error
                            ? error
                            : new Error(String(error)),
                    );

                    // Use our enhanced error handler
                    handleVapiError(error, toast);
                });

                setDemoVapi(vapiInstance);
                return vapiInstance;
            } catch (error) {
                // Handle initialization errors
                setConnectionError(
                    error instanceof Error ? error : new Error(String(error)),
                );
                handleVapiError(error, toast);
                return null;
            }
        };

        initializeVapi();

        return () => {
            stopCallTimer();

            // Clean up event listeners and end call if active
            if (demoVapi) {
                try {
                    demoVapi.stop();
                } catch (e) {
                    console.error('Error stopping Vapi call:', e);
                }
            }
        };
    }, []);

    // Start demo call with retry capability - doesn't require authentication
    const startDemoCall = async () => {
        if (!demoVapi) {
            showErrorToast('Call feature not available', toast);
            return;
        }

        if (isCallActive) {
            toast('Call is already ongoing', {
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
                duration: 2000,
                position: 'bottom-center',
                icon: 'ℹ️',
            });
            return;
        }

        setIsCallInitializing(true);
        setConnectionError(null);

        // Show call initiation notification
        showSuccessToast('Initiating call. Connecting...', toast);

        try {
            // Define the operation to retry if needed
            const startOperation = async () => {
                // Get assistant ID from environment variables
                const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

                if (!assistantId) {
                    throw new Error(
                        'Assistant ID not found in environment variables',
                    );
                }

                // Start the demo call with the assistant ID
                return await demoVapi.start(assistantId);
            };

            // Use the retry utility with up to 2 automatic retries for transient issues
            await retryVapiOperation(startOperation, 2, toast, {
                onRetry: (attempt) => {
                    // Update UI during retry attempts
                    setIsCallInitializing(true);
                },
            });
        } catch (error) {
            // If we got here, all retries failed or the error wasn't retryable
            // handleError event will be triggered by Vapi, so we don't need additional handling here
            setIsCallInitializing(false);
        }
    };

    // End demo call with improved error handling
    const endDemoCall = () => {
        if (!demoVapi) {
            return;
        }

        if (!isCallActive) {
            setIsCallInitializing(false);
            return;
        }

        try {
            demoVapi.stop();
            stopCallTimer();
        } catch (error) {
            // Use our error handler but silent the toast since this is less critical
            handleVapiError(error, toast, { silent: true });
            // Force UI update in case the event doesn't fire
            setIsCallActive(false);
            setIsCallInitializing(false);
            stopCallTimer();
        }
    };

    // Retry the demo call if it failed
    const retryDemoCall = () => {
        if (isCallActive || isCallInitializing) {
            return;
        }

        setConnectionError(null);
        startDemoCall();
    };

    // Handle account button click - directs to dashboard if logged in, sign-in if not
    const handleAccountClick = () => {
        if (isAuthenticated) {
            router.push('/');
        } else {
            router.push('/sign-in');
        }
    };

    return (
        <PageTransition type="fade">
            <div className="relative flex flex-col min-h-screen bg-background">
                {/* Navigation */}
                <nav className="relative flex items-center justify-between p-6">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link
                            href="/"
                            className="text-xl tracking-tight uppercase font-body"
                        >
                            <span>LORO CRM</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation - Hidden on mobile */}
                    <div className="items-center hidden space-x-6 md:flex">
                        {isCallActive ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={endDemoCall}
                                className="text-xs font-normal text-red-500 uppercase transition-colors cursor-pointer font-body hover:bg-red-100 dark:hover:bg-red-900/20"
                            >
                                <PhoneCall
                                    className="w-5 h-5 mr-2 animate-pulse"
                                    size={22}
                                    strokeWidth={1.2}
                                />
                                <span>
                                    END CALL{' '}
                                    {formattedTimeRemaining &&
                                        `(${formattedTimeRemaining})`}
                                </span>
                            </Button>
                        ) : connectionError ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={retryDemoCall}
                                className="text-xs font-normal uppercase transition-colors cursor-pointer text-amber-500 font-body hover:bg-amber-100 dark:hover:bg-amber-900/20"
                            >
                                <PhoneCall
                                    className="w-5 h-5 mr-2"
                                    size={22}
                                    strokeWidth={1.2}
                                />
                                <span>RETRY CALL</span>
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={startDemoCall}
                                disabled={isCallInitializing}
                                className="text-xs font-normal text-green-500 uppercase transition-colors cursor-pointer font-body hover:bg-green-100 dark:hover:bg-green-900/20"
                            >
                                {isCallInitializing ? (
                                    <>
                                        <PhoneCall
                                            className="w-5 h-5 mr-2 animate-pulse"
                                            size={22}
                                            strokeWidth={1.2}
                                        />
                                        <span>CONNECTING...</span>
                                    </>
                                ) : (
                                    <>
                                        <PhoneCall
                                            className="w-5 h-5 mr-2"
                                            size={22}
                                            strokeWidth={1.2}
                                        />
                                        <span>LEARN ABOUT LORO</span>
                                    </>
                                )}
                            </Button>
                        )}
                        <ThemeToggler />
                        <Button
                            className="text-xs font-normal text-white uppercase transition-colors bg-primary font-body hover:bg-primary/80"
                            onClick={handleAccountClick}
                        >
                            {isAuthenticated ? (
                                <>
                                    <User className="w-5 h-5 mr-2" />
                                    <span>Dashboard</span>
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5 mr-2" />
                                    <span>Sign In</span>
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="flex items-center md:hidden">
                        <ThemeToggler />
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Open Menu"
                            className="p-0 ml-2"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <Menu className="w-5 h-5" />
                        </Button>

                        {/* Mobile Menu */}
                        {isMenuOpen && (
                            <div className="absolute top-0 left-0 z-50 w-full p-4 mt-16 bg-background">
                                <div className="p-4 space-y-4 border rounded-md shadow-lg border-border">
                                    <div className="flex flex-col space-y-3">
                                        {isCallActive ? (
                                            <Button
                                                className="justify-start w-full text-xs font-normal text-red-500 uppercase transition-colors bg-transparent font-body hover:bg-red-100 dark:hover:bg-red-900/20"
                                                onClick={endDemoCall}
                                            >
                                                <PhoneCall className="w-5 h-5 mr-2 animate-pulse" />
                                                <span>
                                                    END CALL{' '}
                                                    {formattedTimeRemaining &&
                                                        `(${formattedTimeRemaining})`}
                                                </span>
                                            </Button>
                                        ) : connectionError ? (
                                            <Button
                                                className="justify-start w-full text-xs font-normal uppercase transition-colors bg-transparent text-amber-500 font-body hover:bg-amber-100 dark:hover:bg-amber-900/20"
                                                onClick={retryDemoCall}
                                            >
                                                <PhoneCall className="w-5 h-5 mr-2" />
                                                <span>RETRY CALL</span>
                                            </Button>
                                        ) : (
                                            <Button
                                                className="justify-start w-full text-xs font-normal uppercase transition-colors bg-transparent font-body"
                                                onClick={startDemoCall}
                                                disabled={isCallInitializing}
                                            >
                                                {isCallInitializing ? (
                                                    <>
                                                        <PhoneCall className="w-5 h-5 mr-2 animate-pulse" />
                                                        <span>
                                                            CONNECTING...
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <PhoneCall className="w-5 h-5 mr-2 text-green-500" />
                                                        <span className="text-card-foreground">
                                                            LEARN ABOUT LORO
                                                        </span>
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                        <Button
                                            className="justify-start w-full text-xs font-normal text-white uppercase transition-colors bg-primary hover:bg-primary/90 font-body"
                                            onClick={handleAccountClick}
                                        >
                                            {isAuthenticated ? (
                                                <>
                                                    <User className="w-5 h-5 mr-2" />
                                                    <span>Dashboard</span>
                                                </>
                                            ) : (
                                                <>
                                                    <LogIn className="w-5 h-5 mr-2" />
                                                    <span>Sign In</span>
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="flex flex-col items-center justify-center px-4 py-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="w-full"
                    >
                        <h1 className="max-w-3xl mx-auto text-4xl font-normal uppercase md:text-5xl lg:text-6xl font-body">
                            Unified Business Platform That Works Anywhere
                        </h1>
                        <p className="max-w-2xl mx-auto mt-6 text-xs uppercase text-muted-foreground font-body">
                            A comprehensive enterprise resource planning and
                            customer relationship management system that works
                            seamlessly online and offline, providing maximum
                            flexibility for field and office staff
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative flex items-center justify-center w-full mt-16 max-w-7xl"
                    >
                        <div className="relative w-full aspect-[16/9] flex items-center justify-center">
                            <div className="absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-background to-transparent" />

                            {/* Dashboard/Web View */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="relative w-full h-full"
                            >
                                <Image
                                    src="/web.png"
                                    alt="LORO CRM Dashboard Interface"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </motion.div>

                            {/* Mobile View - Hidden on mobile, visible on larger screens */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                                className="absolute hidden xl:block -right-4 -bottom-10 w-[200px] h-[400px] lg:w-[300px] lg:h-[600px] xl:w-[320px] xl:h-[650px] lg:-right-10 lg:-bottom-16 z-20"
                            >
                                <div className="relative w-full h-full drop-shadow-2xl">
                                    <Image
                                        src="/mobile.png"
                                        alt="LORO CRM Mobile App Interface"
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            </motion.div>

                            {/* Decorative Elements */}
                            <div className="absolute w-32 h-32 rounded-full top-1/4 left-1/4 bg-primary/10 blur-3xl" />
                            <div className="absolute w-32 h-32 rounded-full bottom-1/4 right-1/4 bg-primary/10 blur-3xl" />
                        </div>
                    </motion.div>

                    {/* Responsive adjustments for dashboard image */}
                    <style jsx global>{`
                        @media (max-width: 768px) {
                            .aspect-[16/9] {
                                aspect-ratio: 4/3;
                            }
                        }
                        @media (min-width: 769px) and (max-width: 1024px) {
                            .aspect-[16/9] {
                                aspect-ratio: 16/10;
                            }
                        }
                    `}</style>
                </section>

                {/* Mobile App Download Section */}
                <section className="py-16 bg-gradient-to-r from-background to-background/90">
                    <div className="container px-4 mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="flex flex-col items-center justify-center space-y-8 text-center"
                        >
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                                <Smartphone className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="max-w-2xl text-2xl font-normal uppercase md:text-3xl font-body">
                                Get LORO CRM on Your Mobile Device
                            </h2>
                            <p className="max-w-xl mx-auto text-xs uppercase text-muted-foreground font-body">
                                Experience the full power of LORO CRM on the go
                                with our mobile application. Currently available
                                for Android devices, with iOS support coming
                                soon.
                            </p>
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <a
                                    href="https://storage.googleapis.com/crmapplications/resources/apk.apk"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block"
                                >
                                    <Button className="px-8 py-6 text-xs font-normal text-white uppercase transition-colors bg-primary hover:bg-primary/90 font-body">
                                        <Download className="w-5 h-5 mr-2" />
                                        <span>Download Android APK</span>
                                    </Button>
                                </a>
                                <Button
                                    disabled
                                    className="px-8 py-6 text-xs font-normal uppercase transition-colors cursor-not-allowed bg-muted/50 hover:bg-muted/50 text-muted-foreground font-body"
                                >
                                    <span>iOS Version Coming Soon</span>
                                </Button>
                            </div>
                            <p className="text-[10px] uppercase text-muted-foreground/70 font-body">
                                For Android devices running Android 5.0 or
                                newer. Enable installation from unknown sources
                                in your device settings to install.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-16 bg-background">
                    <div className="container px-4 mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="max-w-3xl mx-auto"
                        >
                            <h2 className="mb-8 text-2xl font-normal text-center uppercase md:text-3xl font-body">
                                Frequently Asked Questions
                            </h2>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className="text-sm font-normal text-left uppercase font-body hover:no-underline">
                                        What apps does Loro CRM offer?
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-2 text-xs uppercase text-muted-foreground font-body">
                                        Loro CRM offers a powerful web-based dashboard for comprehensive management via any modern browser. We also provide a native mobile application specifically designed for Android devices, enabling field access and offline capabilities. An iOS application is planned for future development.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger className="text-sm font-normal text-left uppercase font-body hover:no-underline">
                                        How is my data used and protected?
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-2 text-xs uppercase text-muted-foreground font-body">
                                        Your data is strictly used to deliver and enhance the Loro CRM service, as detailed in our Privacy Policy. We prioritize data protection through industry-standard security practices, including robust encryption for data both in transit and at rest, strict access controls based on user roles, and regular security assessments to prevent unauthorized access.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger className="text-sm font-normal text-left uppercase font-body hover:no-underline">
                                        Is Loro CRM secure and safe to use?
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-2 text-xs uppercase text-muted-foreground font-body">
                                        Absolutely. Security is fundamental to Loro CRM. We employ secure token-based authentication, enforce Role-Based Access Control (RBAC) across the platform, and utilize secure infrastructure with continuous monitoring. Measures like data encryption, regular backups, and adherence to privacy regulations ensure the integrity and safety of your data.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-4">
                                    <AccordionTrigger className="text-sm font-normal text-left uppercase font-body hover:no-underline">
                                        What kind of business problems does Loro CRM solve?
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-2 text-xs uppercase text-muted-foreground font-body">
                                        Loro CRM is designed for businesses managing field operations, sales processes, and client relationships. It helps track leads, manage tasks and routes for mobile teams, handle claims, oversee client interactions, manage product quotations/orders, and provides real-time location tracking and comprehensive reporting across all modules.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-5">
                                    <AccordionTrigger className="text-sm font-normal text-left uppercase font-body hover:no-underline">
                                        Can I use Loro CRM without an internet connection?
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-2 text-xs uppercase text-muted-foreground font-body">
                                        Yes, the Loro CRM mobile application for Android is designed to work seamlessly both online and offline. This allows field staff maximum flexibility, ensuring they can access necessary information and log activities even in areas with poor connectivity. The web dashboard requires an active internet connection.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-6">
                                    <AccordionTrigger className="text-sm font-normal text-left uppercase font-body hover:no-underline">
                                        Can Loro CRM be customized for my company?
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-2 text-xs uppercase text-muted-foreground font-body">
                                        Loro CRM offers customization options at the organizational level. Administrators can manage company structure, define operating hours, and potentially adjust appearance settings through the dashboard to better fit specific business needs.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-16 bg-gradient-to-r from-background to-background/90">
                    <div className="container px-4 mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center"
                        >
                            <h2 className="mb-12 text-2xl font-normal uppercase md:text-3xl font-body">
                                Many Needs, One Unified Platform.
                            </h2>
                        </motion.div>
                        <div className="grid gap-8 md:grid-cols-3">
                            {/* Card 1: Automation */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="p-6 text-center transition-shadow duration-300 bg-card rounded-xl hover:shadow-lg"
                            >
                                <h3 className="mt-4 mb-2 text-lg font-normal uppercase font-body">
                                    Automate Workflows
                                </h3>
                                <p className="text-xs uppercase text-muted-foreground font-body">
                                    Streamline lead assignments, task scheduling, and activity tracking so your team can focus on core business goals.
                                </p>
                            </motion.div>

                            {/* Card 2: Prioritization */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="p-6 text-center transition-shadow duration-300 bg-card rounded-xl hover:shadow-lg"
                            >
                                <h3 className="mt-4 mb-2 text-lg font-normal uppercase font-body">
                                    Prioritize Effectively
                                </h3>
                                <p className="text-xs uppercase text-muted-foreground font-body">
                                    Utilize smart features to manage leads and tasks, ensuring your team always focuses on the highest-impact activities.
                                </p>
                            </motion.div>

                            {/* Card 3: Efficiency */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="p-6 text-center transition-shadow duration-300 bg-card rounded-xl hover:shadow-lg"
                            >
                                <h3 className="mt-4 mb-2 text-lg font-normal uppercase font-body">
                                    Reduce Manual Effort
                                </h3>
                                <p className="text-xs uppercase text-muted-foreground font-body">
                                    Generate quotations quickly, manage tasks visually with drag-and-drop boards, and minimize repetitive data entry across the platform.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12">
                    <div className="container px-4 mx-auto">
                        <div className="grid gap-8 text-center md:text-left md:grid-cols-4">
                            <div className="md:col-span-1">
                                <span className="text-xl tracking-tight uppercase font-body">
                                    LORO CRM
                                </span>
                                <div className="mt-4 text-xs uppercase text-muted-foreground font-body">
                                    <span className="text-[10px] uppercase font-body">
                                        Comprehensive ERP & CRM system for
                                        modern businesses with seamless online
                                        and offline operations
                                    </span>
                                </div>
                            </div>
                            <div>
                                <h4 className="mb-4 text-xs font-normal uppercase font-body">
                                    Platform
                                </h4>
                                <ul className="space-y-2 text-xs uppercase text-muted-foreground font-body">
                                    <li>
                                        <Link
                                            href="#features"
                                            className="transition-colors hover:text-primary"
                                        >
                                            <span className="text-[10px] uppercase font-body">
                                                Web Dashboard
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#solutions"
                                            className="transition-colors hover:text-primary"
                                        >
                                            <span className="text-[10px] uppercase font-body">
                                                Mobile App
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/pricing"
                                            className="transition-colors hover:text-primary"
                                        >
                                            <span className="text-[10px] uppercase font-body">
                                                API & Integration
                                            </span>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-4 text-xs font-normal uppercase font-body">
                                    Resources
                                </h4>
                                <ul className="space-y-2 text-xs uppercase text-muted-foreground font-body">
                                    <li>
                                        <Link
                                            href="/docs"
                                            className="transition-colors hover:text-primary"
                                        >
                                            <span className="text-[10px] uppercase font-body">
                                                Documentation
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/api"
                                            className="transition-colors hover:text-primary"
                                        >
                                            <span className="text-[10px] uppercase font-body">
                                                API Reference
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/contact"
                                            className="transition-colors hover:text-primary"
                                        >
                                            <span className="text-[10px] uppercase font-body">
                                                Support Center
                                            </span>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-4 text-xs font-normal uppercase font-body">
                                    Company
                                </h4>
                                <ul className="space-y-2 text-xs uppercase text-muted-foreground font-body">
                                    <li>
                                        <Link
                                            href="/about"
                                            className="transition-colors hover:text-primary"
                                        >
                                            <span className="text-[10px] uppercase font-body">
                                                About
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/blog"
                                            className="transition-colors hover:text-primary"
                                        >
                                            <span className="text-[10px] uppercase font-body">
                                                Blog
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/contact"
                                            className="transition-colors hover:text-primary"
                                        >
                                            <span className="text-[10px] uppercase font-body">
                                                Contact Us
                                            </span>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-between pt-8 mt-8 text-center border-t md:flex-row md:text-left">
                            <div className="text-xs text-muted-foreground font-body">
                                <span className="text-[10px] uppercase font-body">
                                    © 2024 LORO CRM. All rights reserved.
                                </span>
                            </div>
                            <div className="flex gap-4 mt-4 md:mt-0">
                                <Link
                                    href="#"
                                    className="text-[10px] uppercase transition-colors text-muted-foreground hover:text-primary font-body"
                                >
                                    <span>Privacy Policy</span>
                                </Link>
                                <Link
                                    href="#"
                                    className="text-[10px] uppercase transition-colors text-muted-foreground hover:text-primary font-body"
                                >
                                    <span>Terms of Service</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </PageTransition>
    );
};

export default LandingPage;
