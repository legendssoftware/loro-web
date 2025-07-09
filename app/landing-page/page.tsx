'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PageTransition } from '@/components/animations/page-transition';
import {  Check, PhoneCall, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MotionSection } from '@/components/animations/motion-section';
import { StaggerContainer } from '@/components/animations/stagger-container';
import { StaggerItem } from '@/components/animations/stagger-item';
import { FadeIn } from '@/components/animations/fade-in';
import { ScrollToTop } from '@/components/animations/scroll-to-top';
import { SmoothScroll } from '@/components/smooth-scroll';
import { UserCarousel } from '@/components/animations/user-carousel';
import { StatsDisplay } from '@/components/animations/stats-display';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { mockDataStore } from '@/lib/mock-data';
import { ThemeToggler } from '@/modules/navigation/theme.toggler';
import { toast } from 'react-hot-toast';
import Vapi from '@vapi-ai/web';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';
import {
    handleVapiError,
    retryVapiOperation,
} from '@/lib/utils/vapi-error-handler';

// Update the constants for call time management to use environment variables with fallbacks
const CALL_MAX_DURATION_MS =
    parseInt(process.env.NEXT_PUBLIC_MAX_CALL_DURATION_MINUTES || '5', 10) *
    60 *
    1000; // Default: 5 minutes
const WARNING_TIME_REMAINING_MS =
    parseInt(process.env.NEXT_PUBLIC_CALL_WARNING_SECONDS || '60', 10) * 1000; // Default: 60 seconds

export default function Home() {
    const diverseUsers = mockDataStore.getDiverseUserProfiles();
    const [liveStats, setLiveStats] = useState(
        mockDataStore.getLiveHeroStats(),
    );

    // Phrases for the animated H1
    const heroPhrases = [
        'LORO: Complete Business Control',
        'Stop Juggling Multiple Systems',
        'One Platform, Everything Connected',
        'Built for South African Businesses',
        'CRM + Field Service + Analytics',
        'Transform Your Business Operations',
        'Real-Time Insights & Offline Ready',
        'Enterprise Features, SME Pricing',
    ];
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

    // Vapi call state management
    const [isCallActive, setIsCallActive] = useState(false);
    const [isCallInitializing, setIsCallInitializing] = useState(false);
    const [demoVapi, setDemoVapi] = useState<Vapi | null>(null);
    const [connectionError, setConnectionError] = useState<Error | null>(null);
    const initAttemptedRef = useRef(false);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const callStartTimeRef = useRef<number | null>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const warningShownRef = useRef(false);

    // Mobile menu state
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Refresh stats every 30 seconds to show live data
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveStats(mockDataStore.getLiveHeroStats());
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Effect to cycle through phrases
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentPhraseIndex(
                (prevIndex) => (prevIndex + 1) % heroPhrases.length,
            );
        }, 4000); // Change phrase every 4 seconds

        return () => clearInterval(intervalId);
    }, [heroPhrases.length]);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setIsMobileMenuOpen(false);
        };

        if (isMobileMenuOpen) {
            document.addEventListener('click', handleClickOutside);
            // Lock scroll when mobile menu is open
            document.body.style.overflow = 'hidden';
        } else {
            // Restore scroll when mobile menu is closed
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
            // Ensure scroll is restored on cleanup
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const formattedTimeRemaining = useMemo(() => {
        if (timeRemaining === null) return null;

        const totalSeconds = Math.ceil(timeRemaining / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, [timeRemaining]);

    const stopCallTimer = useCallback(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        callStartTimeRef.current = null;
        setTimeRemaining(null);
        warningShownRef.current = false;
    }, []);

    // End demo call with improved error handling
    const endDemoCall = useCallback(() => {
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
    }, [demoVapi, isCallActive, stopCallTimer]);

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
    }, [endDemoCall]);

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
    // Include dependencies to satisfy ESLint, but we only want this to run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                onRetry: () => {
                    // Update UI during retry attempts
                    setIsCallInitializing(true);
                },
            });
        } catch {
            // If we got here, all retries failed or the error wasn't retryable
            // handleError event will be triggered by Vapi, so we don't need additional handling here
            setIsCallInitializing(false);
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

    return (
        <PageTransition>
            <div className="flex flex-col min-h-screen">
                <SmoothScroll />
                <FadeIn duration={0.8}>
                    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
                        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
                            <div className="flex items-center gap-2">
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="text-xl font-normal tracking-tight uppercase font-body"
                                >
                                    <span className="md:hidden">LORO</span>
                                    <span className="hidden md:inline">LORO CRM</span>
                                </motion.span>
                            </div>

                            {/* Desktop Navigation */}
                            <nav className="items-center hidden gap-6 md:flex">
                                <motion.div
                                    className="flex items-center gap-6"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                >
                                    <Link
                                        href="#features"
                                        className="text-xs font-normal uppercase transition-colors font-body hover:text-primary"
                                    >
                                        Features
                                    </Link>
                                    <Link
                                        href="#benefits"
                                        className="text-xs font-normal uppercase transition-colors font-body hover:text-primary"
                                    >
                                        Benefits
                                    </Link>
                                    <Link
                                        href="#pricing"
                                        className="text-xs font-normal uppercase transition-colors font-body hover:text-primary"
                                    >
                                        Pricing
                                    </Link>
                                    <Link
                                        href="#testimonials"
                                        className="text-xs font-normal uppercase transition-colors font-body hover:text-primary"
                                    >
                                        Testimonials
                                    </Link>
                                    <Link
                                        href="#faq"
                                        className="text-xs font-normal uppercase transition-colors font-body hover:text-primary"
                                    >
                                        FAQ
                                    </Link>
                                    {isCallActive ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={endDemoCall}
                                            className="text-xs font-normal text-red-500 uppercase transition-colors cursor-pointer font-body hover:bg-red-100 dark:hover:bg-red-900/20"
                                        >
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
                                            <span>RETRY CALL</span>
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={startDemoCall}
                                            disabled={isCallInitializing}
                                            className="text-xs font-normal uppercase transition-colors cursor-pointer font-body hover:text-primary"
                                        >
                                            <span>
                                                {isCallInitializing ? 'CONNECTING...' : 'DEMO CALL'}
                                            </span>
                                        </Button>
                                    )}
                                </motion.div>
                            </nav>

                            {/* Desktop Right Side */}
                            <motion.div
                                className="items-center hidden gap-4 md:flex"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <ThemeToggler />
                                <Link
                                    href="/sign-in"
                                    className="text-xs font-normal uppercase transition-colors font-body hover:text-primary"
                                >
                                    Sign In
                                </Link>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button asChild className="text-xs font-normal uppercase font-body">
                                        <Link href="/sign-up">
                                        <span className='text-white'>
                                        Get Started
                                            </span>
                                        </Link>
                                    </Button>
                                </motion.div>
                            </motion.div>

                            {/* Mobile Right Side */}
                            <div className="flex items-center gap-2 md:hidden">
                                <ThemeToggler />
                                <motion.button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMobileMenuOpen(!isMobileMenuOpen);
                                    }}
                                    className="p-2 rounded-lg hover:bg-muted"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Menu className="w-6 h-6" />
                                </motion.button>
                            </div>

                            {/* Mobile Menu Overlay */}
                            <AnimatePresence>
                                {isMobileMenuOpen && (
                                    <>
                                        {/* Background Overlay */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        />
                                        {/* Mobile Menu Panel */}
                                        <motion.div
                                            initial={{ opacity: 0, x: '100%' }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: '100%' }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className="fixed inset-y-0 right-0 z-[80] w-80 h-screen bg-background/95 backdrop-blur-md border-l shadow-xl flex-1"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="flex flex-col h-full">
                                                {/* Mobile Menu Header */}
                                                <div className="flex items-center justify-between p-4 border-b bg-background/80">
                                                    <span className="text-lg font-normal uppercase font-body">
                                                        LORO CRM
                                                    </span>
                                                    <motion.button
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        className="p-2 rounded-lg hover:bg-muted"
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <X className="w-6 h-6" />
                                                    </motion.button>
                                                </div>

                                                {/* Mobile Menu Content */}
                                                <div className="flex flex-col flex-1 p-4 space-y-4 bg-background/90">
                                                    <Link
                                                        href="#features"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        className="p-3 text-sm font-normal uppercase transition-colors rounded-lg font-body hover:bg-muted hover:text-primary"
                                                    >
                                                        Features
                                                    </Link>
                                                    <Link
                                                        href="#benefits"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        className="p-3 text-sm font-normal uppercase transition-colors rounded-lg font-body hover:bg-muted hover:text-primary"
                                                    >
                                                        Benefits
                                                    </Link>
                                                    <Link
                                                        href="#pricing"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        className="p-3 text-sm font-normal uppercase transition-colors rounded-lg font-body hover:bg-muted hover:text-primary"
                                                    >
                                                        Pricing
                                                    </Link>
                                                    <Link
                                                        href="#testimonials"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        className="p-3 text-sm font-normal uppercase transition-colors rounded-lg font-body hover:bg-muted hover:text-primary"
                                                    >
                                                        Testimonials
                                                    </Link>
                                                    <Link
                                                        href="#faq"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        className="p-3 text-sm font-normal uppercase transition-colors rounded-lg font-body hover:bg-muted hover:text-primary"
                                                    >
                                                        FAQ
                                                    </Link>

                                                    <div className="pt-4 space-y-2 border-t">
                                                        <Link
                                                            href="/sign-in"
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                            className="block p-3 text-sm font-normal uppercase transition-colors rounded-lg font-body hover:bg-muted hover:text-primary"
                                                        >
                                                            Sign In
                                                        </Link>
                                                    </div>

                                                    {/* Call Button in Mobile Menu */}
                                                    <div className="pt-4 border-t">
                                                        {isCallActive ? (
                                                            <Button
                                                                variant="outline"
                                                                onClick={endDemoCall}
                                                                className="w-full text-xs font-normal text-red-500 uppercase font-body hover:bg-red-100 dark:hover:bg-red-900/20"
                                                            >
                                                                <span>
                                                                    END CALL{' '}
                                                                    {formattedTimeRemaining &&
                                                                        `(${formattedTimeRemaining})`}
                                                                </span>
                                                            </Button>
                                                        ) : connectionError ? (
                                                            <Button
                                                                variant="outline"
                                                                onClick={retryDemoCall}
                                                                className="w-full text-xs font-normal uppercase text-amber-500 font-body hover:bg-amber-100 dark:hover:bg-amber-900/20"
                                                            >
                                                                <PhoneCall className="w-4 h-4 mr-2" />
                                                                <span>RETRY CALL</span>
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                onClick={startDemoCall}
                                                                disabled={isCallInitializing}
                                                                className="w-full text-xs font-normal uppercase font-body"
                                                            >
                                                                <PhoneCall className="w-4 h-4 mr-2" />
                                                                <span>
                                                                    {isCallInitializing ? 'CONNECTING...' : 'DEMO CALL'}
                                                                </span>
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {/* Auth Links */}
                                                    <div className="pt-4 space-y-2 border-t">
                                                        <Button
                                                            asChild
                                                            className="w-full text-xs font-normal uppercase font-body"
                                                        >
                                                            <Link
                                                                href="/sign-up"
                                                                onClick={() => setIsMobileMenuOpen(false)}
                                                            >
                                                                Get Started
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </header>
                </FadeIn>

                <main className="flex-1">
                    {/* Hero Section */}
                    <MotionSection className="py-8 md:py-16 lg:py-24" duration={0.8}>
                        <div className="container px-4 mx-auto md:px-6">
                            <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
                                <StaggerContainer
                                    className="flex flex-col justify-center space-y-4"
                                    staggerChildren={0.2}
                                >
                                    <StaggerItem className="space-y-2">
                                        <div className="relative h-32 p-1 overflow-hidden sm:h-40 md:h-48">
                                            <AnimatePresence mode="wait">
                                                <motion.h1
                                                    key={currentPhraseIndex}
                                                    initial={{ y: 50, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    exit={{ y: -50, opacity: 0 }}
                                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                                    className="absolute inset-0 flex items-center text-2xl font-normal tracking-tighter uppercase sm:text-3xl md:text-5xl xl:text-6xl/none font-body"
                                                >
                                                    {heroPhrases[currentPhraseIndex]}
                                                </motion.h1>
                                            </AnimatePresence>
                                        </div>
                                        <p className="max-w-[600px] text-xs uppercase text-muted-foreground font-body md:text-xs">
                                            Stop juggling multiple systems. Loro combines CRM, field service management, inventory tracking, quotation system, task management, and real-time analytics in one powerful platform.
                                        </p>
                                    </StaggerItem>
                                    <StaggerItem className="flex flex-col gap-2 min-[400px]:flex-row">
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Button
                                                size="lg"
                                                className="text-xs font-normal uppercase font-body"
                                                asChild
                                            >
                                                <a
                                                    href="https://storage.googleapis.com/crmapplications/resources/apk.apk"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <span className='text-white'>Try our Android App</span>
                                                </a>
                                            </Button>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="lg"
                                                className="text-xs font-normal uppercase font-body"
                                            >
                                                <Link href="#features">
                                                    See Features
                                                </Link>
                                            </Button>
                                        </motion.div>
                                    </StaggerItem>
                                </StaggerContainer>

                                <StaggerContainer
                                    className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-4 max-h-[600px] lg:max-h-none overflow-hidden"
                                    delay={0.3}
                                    staggerChildren={0.15}
                                >
                                    <StaggerItem
                                        className="space-y-3"
                                        direction="left"
                                    >
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                                            <div className="text-xs font-normal uppercase text-muted-foreground font-body">
                                                Live Activity
                                            </div>
                                            <div className="px-2 py-1 ml-auto text-xs font-normal text-green-700 uppercase bg-green-100 rounded-full animate-LORO font-body">
                                                LIVE
                                            </div>
                                        </div>

                                        {/* Animated User Carousel */}
                                        <div className="overflow-hidden max-h-32">
                                            <UserCarousel
                                                users={diverseUsers}
                                                interval={3500}
                                            />
                                        </div>
                                    </StaggerItem>

                                    <StaggerItem
                                        className="space-y-3"
                                        direction="right"
                                    >
                                        {/* Live Analytics Dashboard Widget */}
                                        <div className="overflow-hidden max-h-24">
                                            <StatsDisplay
                                                data={liveStats}
                                                className="mb-3"
                                            />
                                        </div>

                                        <div className="relative aspect-square max-h-32 lg:max-h-48">
                                            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                                                <motion.div
                                                    className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg"
                                                    animate={{
                                                        scale: [1, 1.05, 1],
                                                        rotate: [
                                                            0, 5, 0, -5, 0,
                                                        ],
                                                    }}
                                                    transition={{
                                                        duration: 5,
                                                        repeat: Number.POSITIVE_INFINITY,
                                                        repeatType: 'reverse',
                                                    }}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="20"
                                                        height="20"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="text-primary"
                                                    >
                                                        <rect
                                                            x="3"
                                                            y="3"
                                                            width="18"
                                                            height="18"
                                                            rx="2"
                                                            ry="2"
                                                        ></rect>
                                                        <rect
                                                            x="7"
                                                            y="7"
                                                            width="3"
                                                            height="3"
                                                        ></rect>
                                                        <rect
                                                            x="14"
                                                            y="7"
                                                            width="3"
                                                            height="3"
                                                        ></rect>
                                                        <rect
                                                            x="7"
                                                            y="14"
                                                            width="3"
                                                            height="3"
                                                        ></rect>
                                                        <rect
                                                            x="14"
                                                            y="14"
                                                            width="3"
                                                            height="3"
                                                        ></rect>
                                                    </svg>
                                                </motion.div>
                                            </div>
                                        </div>

                                        <div className="p-3 border rounded-lg shadow-sm bg-card">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="text-[10px] font-normal uppercase font-body">
                                                    Scan Stats
                                                </div>
                                                <div className="text-xs font-normal uppercase text-primary font-body">
                                                    +12%
                                                </div>
                                            </div>
                                            <div className="h-6 overflow-hidden rounded-md bg-muted">
                                                <motion.div
                                                    className="h-full rounded-md bg-gradient-to-r from-primary to-primary/70"
                                                    initial={{ width: '0%' }}
                                                    animate={{ width: '75%' }}
                                                    transition={{
                                                        duration: 1.5,
                                                        delay: 0.5,
                                                        ease: 'easeOut',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </StaggerItem>
                                </StaggerContainer>
                            </div>
                        </div>
                    </MotionSection>

                    {/* Trusted By Section */}
                    <MotionSection className="py-8 border-y" direction="none">
                        <div className="container px-4 mx-auto md:px-6">
                            <StaggerContainer
                                className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-70"
                                staggerChildren={0.1}
                            >
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <StaggerItem key={i} direction="up">
                                        <div className="flex items-center justify-center w-24 h-8">
                                            <svg
                                                viewBox="0 0 75 24"
                                                fill="currentColor"
                                                className="w-full h-6"
                                            >
                                                <path
                                                    d={`M${
                                                        12 + i
                                                    } 12c0-3.315-2.685-6-6-6S${i} 8.685 ${i} 12s2.685 6 6 6 6-2.685 6-6zm-6 4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm12.5-4c0-3.315-2.685-6-6-6s-6 2.685-6 6 2.685 6 6 6 6-2.685 6-6zm-6 4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm12.5-4c0-3.315-2.685-6-6-6s-6 2.685-6 6 2.685 6 6 6 6-2.685 6-6zm-6 4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm12.5-4c0-3.315-2.685-6-6-6s-6 2.685-6 6 2.685 6 6 6 6-2.685 6-6zm-6 4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm12.5-4c0-3.315-2.685-6-6-6s-6 2.685-6 6 2.685 6 6 6 6-2.685 6-6zm-6 4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm12.5-4c0-3.315-2.685-6-6-6s-6 2.685-6 6 2.685 6 6 6 6-2.685 6-6zm-6 4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm12.5-4c0-3.315-2.685-6-6-6s-6 2.685-6 6 2.685 6 6 6 6-2.685 6-6zm-6 4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm12.5-4c0-3.315-2.685-6-6-6s-6 2.685-6 6 2.685 6 6 6 6-2.685 6-6zm-6 4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm12.5-4c0-3.315-2.685-6-6-6s-6 2.685-6 6 2.685 6 6 6 6-2.685 6-6zm-6 4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm12.5-4c0-3.315-2.685-6-6-6s-6 2.685-6 6 2.685 6 6 6 6-2.685 6-6zm-6 4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm12.5-4c0-3.315-2.685-6-6-6s-6 2.685-6 6 2.685 6 6 6 6-2.685 6-6zm-6 4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm12.5-4c0-3.315-2.685-6-6-6s-6 2.685-6 6 2.685 6 6 6 6-2.685 6-6zm-6 4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm12.5-4c0-3.315-2.685-6-6-6s-6 2.685-6 6 2.685 6 6 6 6-2.685 6-6zm-6 4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm12.5-4c0-3.315-2.685-6-6-6s-6 2.685-6 6 2.685 6 6 6 6-2.685 6-6zm-6 4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm12.5-4c0-3.315-2.685-6-6-6s-6 2.685-6 6 2.685 6 6 6 6-2.685 6-6zm-6 4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm12.5-4c0-3.315-2.685-6-6-6s-6 2.685-6 6 2.685 6 6 6 6-2.685 6-6zm-6 4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm12.5-4c0-3.315-2.685-6-6-6s-6 2.685-6 6 2.685 6 6 6 6-2.685 6-6zm-6 4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm12.5-4c0-3.315-2.685-6-6-6s-6 2.685-6 6 2.685 6 6 6 6-2.685 6-6zm-6 4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm12.5-4c0-3.315-2.685-6-6-6s-6 2.685-6 6 2.685 6 6 6 6-2.685 6-6zm-6 4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z`}
                                                />
                                            </svg>
                                        </div>
                                    </StaggerItem>
                                ))}
                            </StaggerContainer>
                        </div>
                    </MotionSection>

                    {/* Value Proposition */}
                    <MotionSection className="py-12 md:py-16" direction="up">
                        <div className="container px-4 mx-auto md:px-6">
                            <div className="max-w-3xl mx-auto text-center">
                                <motion.p
                                    className="mb-4 text-xs uppercase text-muted-foreground font-body md:text-xs"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8 }}
                                    viewport={{ once: true }}
                                >
                                    <span className="font-normal text-foreground">
                                        Stop juggling multiple systems.
                                    </span>{' '}
                                    Loro combines{' '}
                                    <span className="font-normal text-foreground">
                                        CRM, field service management, inventory tracking, quotation system, task management, and real-time analytics
                                    </span>{' '}
                                    in one powerful platform.
                                    <span className="font-normal text-foreground">
                                        {' '}
                                        Built for South African businesses
                                    </span>{' '}
                                    with{' '}
                                    <span className="font-normal text-foreground">
                                        offline capabilities
                                    </span>{' '}
                                    and{' '}
                                    <span className="font-normal text-foreground">
                                        99.9% uptime guarantee
                                    </span>
                                    .
                                </motion.p>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                    viewport={{ once: true }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button variant="outline" className="mt-2 text-xs font-normal uppercase font-body">
                                        <Link href="#features">
                                            See All Features
                                        </Link>
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </MotionSection>

                    {/* Problem Education Section */}
                    <MotionSection
                        className="py-16 md:py-24 bg-muted/50"
                        direction="up"
                        id="features"
                    >
                        <div className="container px-4 mx-auto md:px-6">
                            <StaggerContainer
                                className="mb-12 text-center"
                                staggerChildren={0.2}
                            >
                                <StaggerItem>
                                    <h2 className="text-3xl font-normal tracking-tighter uppercase sm:text-4xl md:text-5xl font-body">
                                        Why South African Businesses Choose Loro
                                    </h2>
                                </StaggerItem>
                                <StaggerItem>
                                    <p className="max-w-3xl mx-auto mt-4 text-xs uppercase text-muted-foreground font-body md:text-xs">
                                        Loro isn't just another CRM. It's your complete business command center that connects every aspect of your operations - from Johannesburg's bustling business district to Cape Town's growing tech sector.
                                    </p>
                                </StaggerItem>
                            </StaggerContainer>

                            <StaggerContainer
                                className="grid gap-8 mb-12 md:grid-cols-2 lg:grid-cols-4"
                                staggerChildren={0.15}
                            >
                                <StaggerItem direction="up">
                                    <motion.div
                                        className="h-full p-6 border shadow-sm bg-card rounded-xl border-border group"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-blue-600 transition-transform duration-300 bg-blue-100 rounded-full group-hover:scale-110">
                                            <span className="text-xl font-normal font-body">
                                                🎯
                                            </span>
                                        </div>
                                        <h3 className="mb-3 text-lg font-normal uppercase font-body">
                                            Smart Lead Management
                                        </h3>
                                        <p className="mb-4 text-xs uppercase text-muted-foreground font-body">
                                            Capture, qualify, and convert leads with AI-powered lead scoring and automated follow-up sequences.
                                        </p>
                                        <div className="space-y-2">
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="w-2 h-2 mr-2 bg-blue-500 rounded-full"></div>
                                                Automated lead assignment
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="w-2 h-2 mr-2 bg-blue-500 rounded-full"></div>
                                                Lead scoring & qualification
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="w-2 h-2 mr-2 bg-blue-500 rounded-full"></div>
                                                Follow-up reminders
                                            </div>
                                        </div>
                                    </motion.div>
                                </StaggerItem>

                                <StaggerItem direction="up">
                                    <motion.div
                                        className="h-full p-6 border shadow-sm bg-card rounded-xl border-border group"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-green-600 transition-transform duration-300 bg-green-100 rounded-full group-hover:scale-110">
                                            <span className="text-xl font-normal font-body">
                                                💰
                                            </span>
                                        </div>
                                        <h3 className="mb-3 text-lg font-normal uppercase font-body">
                                            Sales Pipeline Control
                                        </h3>
                                        <p className="mb-4 text-xs uppercase text-muted-foreground font-body">
                                            Visual sales pipeline with drag-and-drop stages, deal probability tracking, and revenue forecasting.
                                        </p>
                                        <div className="space-y-2">
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="w-2 h-2 mr-2 bg-green-500 rounded-full"></div>
                                                Visual pipeline management
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="w-2 h-2 mr-2 bg-green-500 rounded-full"></div>
                                                Revenue forecasting
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="w-2 h-2 mr-2 bg-green-500 rounded-full"></div>
                                                Deal probability tracking
                                            </div>
                                        </div>
                                    </motion.div>
                                </StaggerItem>

                                <StaggerItem direction="up">
                                    <motion.div
                                        className="h-full p-6 border shadow-sm bg-card rounded-xl border-border group"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-purple-600 transition-transform duration-300 bg-purple-100 rounded-full group-hover:scale-110">
                                            <span className="text-xl font-normal font-body">
                                                ✅
                                            </span>
                                        </div>
                                        <h3 className="mb-3 text-lg font-normal uppercase font-body">
                                            Task & Project Management
                                        </h3>
                                        <p className="mb-4 text-xs uppercase text-muted-foreground font-body">
                                            Organize work with smart task assignment, priority management, and real-time progress tracking.
                                        </p>
                                        <div className="space-y-2">
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="w-2 h-2 mr-2 bg-purple-500 rounded-full"></div>
                                                Smart task assignment
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="w-2 h-2 mr-2 bg-purple-500 rounded-full"></div>
                                                Priority & deadline tracking
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="w-2 h-2 mr-2 bg-purple-500 rounded-full"></div>
                                                Team collaboration tools
                                            </div>
                                        </div>
                                    </motion.div>
                                </StaggerItem>

                                <StaggerItem direction="up">
                                    <motion.div
                                        className="h-full p-6 border shadow-sm bg-card rounded-xl border-border group"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-orange-600 transition-transform duration-300 bg-orange-100 rounded-full group-hover:scale-110">
                                            <span className="text-xl font-normal font-body">
                                                ⚡
                                            </span>
                                        </div>
                                        <h3 className="mb-3 text-lg font-normal uppercase font-body">
                                            Workflow Automation
                                        </h3>
                                        <p className="mb-4 text-xs uppercase text-muted-foreground font-body">
                                            Automate repetitive tasks with intelligent workflows that trigger actions based on customer behavior.
                                        </p>
                                        <div className="space-y-2">
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="w-2 h-2 mr-2 bg-orange-500 rounded-full"></div>
                                                Custom workflow builder
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="w-2 h-2 mr-2 bg-orange-500 rounded-full"></div>
                                                Trigger-based automation
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="w-2 h-2 mr-2 bg-orange-500 rounded-full"></div>
                                                Email & SMS automation
                                            </div>
                                        </div>
                                    </motion.div>
                                </StaggerItem>

                                <StaggerItem direction="up">
                                    <motion.div
                                        className="h-full p-6 border shadow-sm bg-card rounded-xl border-border group"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-indigo-600 transition-transform duration-300 bg-indigo-100 rounded-full group-hover:scale-110">
                                            <span className="text-xl font-normal font-body">
                                                📊
                                            </span>
                                        </div>
                                        <h3 className="mb-3 text-lg font-normal uppercase font-body">
                                            Real-Time Analytics
                                        </h3>
                                        <p className="mb-4 text-xs uppercase text-muted-foreground font-body">
                                            Make data-driven decisions with customizable dashboards and automated reporting for all key metrics.
                                        </p>
                                        <div className="space-y-2">
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="w-2 h-2 mr-2 bg-indigo-500 rounded-full"></div>
                                                Custom dashboards
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="w-2 h-2 mr-2 bg-indigo-500 rounded-full"></div>
                                                Automated reporting
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="w-2 h-2 mr-2 bg-indigo-500 rounded-full"></div>
                                                Performance insights
                                            </div>
                                        </div>
                                    </motion.div>
                                </StaggerItem>

                                <StaggerItem direction="up">
                                    <motion.div
                                        className="h-full p-6 border shadow-sm bg-card rounded-xl border-border group"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-teal-600 transition-transform duration-300 bg-teal-100 rounded-full group-hover:scale-110">
                                            <span className="text-xl font-normal font-body">
                                                📱
                                            </span>
                                        </div>
                                        <h3 className="mb-3 text-lg font-normal uppercase font-body">
                                            Mobile-First Design
                                        </h3>
                                        <p className="mb-4 text-xs uppercase text-muted-foreground font-body">
                                            Work from anywhere with native mobile apps featuring offline capabilities and GPS tracking.
                                        </p>
                                        <div className="space-y-2">
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="w-2 h-2 mr-2 bg-teal-500 rounded-full"></div>
                                                Offline functionality
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="w-2 h-2 mr-2 bg-teal-500 rounded-full"></div>
                                                Real-time GPS tracking
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="w-2 h-2 mr-2 bg-teal-500 rounded-full"></div>
                                                Native mobile apps
                                            </div>
                                        </div>
                                    </motion.div>
                                </StaggerItem>

                                <StaggerItem direction="up">
                                    <motion.div
                                        className="h-full p-6 border shadow-sm bg-card rounded-xl border-border group"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 transition-transform duration-300 rounded-full text-rose-600 bg-rose-100 group-hover:scale-110">
                                            <span className="text-xl font-normal font-body">
                                                📄
                                            </span>
                                        </div>
                                        <h3 className="mb-3 text-lg font-normal uppercase font-body">
                                            Smart Quotations
                                        </h3>
                                        <p className="mb-4 text-xs uppercase text-muted-foreground font-body">
                                            Generate professional quotes in seconds with automated pricing, templates, and e-signature integration.
                                        </p>
                                        <div className="space-y-2">
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="w-2 h-2 mr-2 rounded-full bg-rose-500"></div>
                                                Automated pricing
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="w-2 h-2 mr-2 rounded-full bg-rose-500"></div>
                                                Custom templates
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="w-2 h-2 mr-2 rounded-full bg-rose-500"></div>
                                                E-signature integration
                                            </div>
                                        </div>
                                    </motion.div>
                                </StaggerItem>

                                <StaggerItem direction="up">
                                    <motion.div
                                        className="h-full p-6 border shadow-sm bg-card rounded-xl border-border group"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 transition-transform duration-300 rounded-full text-amber-600 bg-amber-100 group-hover:scale-110">
                                            <span className="text-xl font-normal font-body">
                                                📦
                                            </span>
                                        </div>
                                        <h3 className="mb-3 text-lg font-normal uppercase font-body">
                                            Inventory Integration
                                        </h3>
                                        <p className="mb-4 text-xs uppercase text-muted-foreground font-body">
                                            Track stock levels, manage suppliers, and automate reordering with integrated inventory management.
                                        </p>
                                        <div className="space-y-2">
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="w-2 h-2 mr-2 rounded-full bg-amber-500"></div>
                                                Real-time stock tracking
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="w-2 h-2 mr-2 rounded-full bg-amber-500"></div>
                                                Automated reordering
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="w-2 h-2 mr-2 rounded-full bg-amber-500"></div>
                                                Supplier management
                                            </div>
                                        </div>
                                    </motion.div>
                                </StaggerItem>
                            </StaggerContainer>

                        </div>
                    </MotionSection>

                    {/* Why Choose Us */}
                    <MotionSection className="py-16 md:py-24" direction="up">
                        <div className="container px-4 mx-auto md:px-6">
                            <StaggerContainer
                                className="mb-12 text-center"
                                staggerChildren={0.2}
                            >
                                <StaggerItem>
                                    <h2 className="text-3xl font-normal tracking-tighter uppercase sm:text-4xl md:text-5xl font-body">
                                        Real Impact, Real Results You Can Count On
                                    </h2>
                                </StaggerItem>
                                <StaggerItem>
                                    <p className="mt-4 text-xs uppercase text-muted-foreground font-body md:text-xs">
                                        Forget vague promises. Here's what Loro delivers to your bottom line:
                                    </p>
                                </StaggerItem>
                            </StaggerContainer>
                            <StaggerContainer
                                className="grid gap-8 md:grid-cols-4"
                                staggerChildren={0.15}
                            >
                                <StaggerItem direction="up">
                                    <motion.div
                                        className="h-full p-6 border shadow-sm bg-card rounded-xl border-border"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h3 className="mb-2 text-xl font-normal uppercase font-body">
                                            Slash Operational Costs
                                        </h3>
                                        <div className="mb-4 space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground font-body uppercase text-[10px]">Admin overhead</span>
                                                <span className="font-medium text-green-600 font-body uppercase text-[9px]">35% ↓</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground font-body uppercase text-[10px]">Fuel expenses</span>
                                                <span className="font-medium text-green-600 font-body uppercase text-[9px]">25% ↓</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground font-body uppercase text-[10px]">Manual reporting</span>
                                                <span className="font-medium text-green-600 font-body uppercase text-[9px]">15 hrs/week saved</span>
                                            </div>
                                        </div>
                                        <p className="text-xs uppercase text-muted-foreground font-body">
                                            Cut administrative overhead with digital processes, reduce fuel expenses through smart route optimization, and eliminate data entry errors that cost time and money.
                                        </p>
                                    </motion.div>
                                </StaggerItem>
                                <StaggerItem direction="up" className="mt-4 md:mt-8">
                                            <motion.div
                                        className="h-full p-6 border shadow-sm bg-card rounded-xl border-border"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h3 className="mb-2 text-xl font-normal uppercase font-body">
                                            Boost Sales Performance
                                        </h3>
                                        <div className="mb-4 space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                 <span className="text-muted-foreground font-body uppercase text-[10px]">Lead conversion</span>
                                                <span className="font-medium text-blue-600 font-body uppercase text-[9px]">45% ↑</span>
                                                </div>
                                            <div className="flex items-center justify-between text-xs">
                                                 <span className="text-muted-foreground font-body uppercase text-[10px]">Quote speed</span>
                                                <span className="font-medium text-blue-600 font-body uppercase text-[9px]">3x faster</span>
                                        </div>
                                            <div className="flex items-center justify-between text-xs">
                                                 <span className="text-muted-foreground font-body uppercase text-[10px]">Repeat business</span>
                                                <span className="font-medium text-blue-600 font-body uppercase text-[9px]">30% ↑</span>
                                            </div>
                                        </div>
                                        <p className="text-xs uppercase text-muted-foreground font-body">
                                            Increase lead conversion rates with automated nurturing, close deals faster with mobile quoting capabilities, and grow repeat business through better client relationship management.
                                        </p>
                                    </motion.div>
                                </StaggerItem>
                                <StaggerItem direction="up" className="mt-8 md:mt-16">
                                    <motion.div
                                        className="h-full p-6 border shadow-sm bg-card rounded-xl border-border"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h3 className="mb-2 text-xl font-normal uppercase font-body">
                                            Supercharge Team Productivity
                                        </h3>
                                        <div className="mb-4 space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                 <span className="text-muted-foreground font-body uppercase text-[10px]">Travel time</span>
                                                <span className="font-medium text-purple-600 font-body uppercase text-[9px]">40% ↓</span>
                                        </div>
                                            <div className="flex items-center justify-between text-xs">
                                                 <span className="text-muted-foreground font-body uppercase text-[10px]">Quote generation</span>
                                              <span className="font-medium text-purple-600 font-body uppercase text-[9px]">60% faster</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                 <span className="text-muted-foreground font-body uppercase text-[10px]">First-call resolution</span>
                                              <span className="font-medium text-purple-600 font-body uppercase text-[9px]">35% ↑</span>
                                            </div>
                                        </div>
                                        <p className="text-xs uppercase text-muted-foreground font-body">
                                            Reduce travel time with AI-powered route planning, speed up quote generation with automated pricing, and improve first-call resolution rates.
                                        </p>
                                    </motion.div>
                                </StaggerItem>
                                <StaggerItem direction="up" className="mt-12 md:mt-24">
                                    <motion.div
                                        className="h-full p-6 border shadow-sm bg-card rounded-xl border-border"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h3 className="mb-2 text-xl font-normal uppercase font-body">
                                            Elevate Customer Satisfaction
                                        </h3>
                                        <div className="mb-4 space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                 <span className="text-muted-foreground font-body uppercase text-[10px]">On-time delivery</span>
                                                <span className="font-medium text-orange-600 font-body uppercase text-[9px]">95%+</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                 <span className="text-muted-foreground font-body uppercase text-[10px]">Response time</span>
                                                <span className="font-medium text-orange-600 font-body uppercase text-[9px]">&lt;2 hours</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                 <span className="text-muted-foreground font-body uppercase text-[10px]">Customer retention</span>
                                                <span className="font-medium text-orange-600 font-body uppercase text-[9px]">40% ↑</span>
                                            </div>
                                        </div>
                                        <p className="text-xs uppercase text-muted-foreground font-body">
                                            Achieve exceptional on-time service delivery with smart scheduling, reduce customer complaint response times, and boost Net Promoter Scores with professional service delivery.
                                        </p>
                                    </motion.div>
                                </StaggerItem>
                            </StaggerContainer>
                        </div>
                    </MotionSection>

                    {/* Take Control Section */}
                    <MotionSection className="py-20" direction="up">
                        <div className="container px-4 mx-auto md:px-6">
                            <StaggerContainer
                                className="mb-12 text-center"
                                staggerChildren={0.2}
                            >
                                <StaggerItem>
                                    <h2 className="text-3xl font-normal tracking-tighter uppercase sm:text-4xl md:text-5xl font-body">
                                        Take Control of Your Business Operations
                                    </h2>
                                </StaggerItem>
                                <StaggerItem>
                                    <p className="mt-4 text-xs uppercase text-muted-foreground font-body md:text-xs">
                                        Stop chasing information across multiple systems and spreadsheets. Loro puts you in the driver's seat with intelligent automation that handles the routine work while you focus on growing your business.
                                    </p>
                                </StaggerItem>
                            </StaggerContainer>

                            {/* Automate What Matters Section */}
                            <div className="mb-16">
                            <div className="grid items-center gap-8 md:grid-cols-2">
                                <motion.div
                                    className="overflow-hidden rounded-xl"
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8 }}
                                    viewport={{ once: true }}
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.03 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Image
                                                src="/images/covers/automation.webp"
                                                alt="Business automation and CRM"
                                            width={400}
                                            height={400}
                                            className="w-full h-auto rounded-xl"
                                        />
                                    </motion.div>
                                </motion.div>
                                <StaggerContainer
                                    className="space-y-6"
                                    staggerChildren={0.15}
                                    delay={0.3}
                                >
                                        <StaggerItem>
                                            <h3 className="mb-4 text-2xl font-normal uppercase font-body">
                                                Automate What Matters, Control What Counts
                                            </h3>
                                        </StaggerItem>
                                    <StaggerItem direction="left">
                                        <div className="flex items-start gap-4">
                                            <motion.div
                                                className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0"
                                                whileHover={{
                                                    scale: 1.1,
                                                        backgroundColor: 'rgba(42, 111, 71, 0.2)',
                                                }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Check className="w-5 h-5 text-primary" />
                                            </motion.div>
                                            <div>
                                                    <h4 className="mb-2 text-lg font-normal uppercase font-body">
                                                        Smart Lead Distribution
                                                    </h4>
                                                <p className="text-xs uppercase text-muted-foreground font-body">
                                                        Automatically assign new leads to the right sales rep based on location, expertise, and workload. No more manual sorting or missed opportunities.
                                                </p>
                                            </div>
                                        </div>
                                    </StaggerItem>
                                    <StaggerItem direction="left">
                                        <div className="flex items-start gap-4">
                                            <motion.div
                                                className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0"
                                                whileHover={{
                                                    scale: 1.1,
                                                        backgroundColor: 'rgba(42, 111, 71, 0.2)',
                                                }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Check className="w-5 h-5 text-primary" />
                                            </motion.div>
                                            <div>
                                                    <h4 className="mb-2 text-lg font-normal uppercase font-body">
                                                        Intelligent Follow-Up Sequences
                                                    </h4>
                                                <p className="text-xs uppercase text-muted-foreground font-body">
                                                        Set up automated touchpoints that nurture prospects without lifting a finger. Convert more leads while your team focuses on closing deals.
                                                </p>
                                            </div>
                                        </div>
                                    </StaggerItem>
                                    <StaggerItem direction="left">
                                        <div className="flex items-start gap-4">
                                            <motion.div
                                                className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0"
                                                whileHover={{
                                                    scale: 1.1,
                                                        backgroundColor: 'rgba(42, 111, 71, 0.2)',
                                                }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Check className="w-5 h-5 text-primary" />
                                            </motion.div>
                                            <div>
                                                    <h4 className="mb-2 text-lg font-normal uppercase font-body">
                                                        Dynamic Route Planning
                                                    </h4>
                                                <p className="text-xs uppercase text-muted-foreground font-body">
                                                        Let our AI optimize your team's daily routes automatically. Save fuel, time, and frustration with zero manual planning.
                                                </p>
                                            </div>
                                        </div>
                                    </StaggerItem>
                                </StaggerContainer>
                            </div>
                        </div>

                            {/* CRM Management Section */}
                            <div className="mb-16">
                                <div className="grid items-center gap-8 md:grid-cols-2">
                            <StaggerContainer
                                        className="space-y-6 md:order-2"
                                staggerChildren={0.15}
                                        delay={0.3}
                                    >
                                        <StaggerItem>
                                            <h3 className="mb-4 text-2xl font-normal uppercase font-body">
                                                Effortless Client Relationship Management
                                        </h3>
                                </StaggerItem>
                                        <StaggerItem direction="right">
                                            <div className="flex items-start gap-4">
                                    <motion.div
                                                    className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0"
                                        whileHover={{
                                                scale: 1.1,
                                                        backgroundColor: 'rgba(42, 111, 71, 0.2)',
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                                    <Check className="w-5 h-5 text-primary" />
                                        </motion.div>
                                                <div>
                                                    <h4 className="mb-2 text-lg font-normal uppercase font-body">
                                                        Unified Client Timeline
                                                    </h4>
                                                    <p className="text-xs uppercase text-muted-foreground font-body">
                                                        Every call, email, meeting, and transaction in one chronological view. Understand your clients completely, every time you interact.
                                                    </p>
                                                </div>
                                            </div>
                                </StaggerItem>
                                        <StaggerItem direction="right">
                                            <div className="flex items-start gap-4">
                                    <motion.div
                                                    className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0"
                                        whileHover={{
                                                scale: 1.1,
                                                        backgroundColor: 'rgba(42, 111, 71, 0.2)',
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                                    <Check className="w-5 h-5 text-primary" />
                                        </motion.div>
                                                <div>
                                                    <h4 className="mb-2 text-lg font-normal uppercase font-body">
                                                        Predictive Insights
                                                    </h4>
                                                    <p className="text-xs uppercase text-muted-foreground font-body">
                                                        Get alerts when clients show signs of churn or upselling opportunities. Stay ahead of problems and capitalize on growth chances.
                                                    </p>
                        </div>
                                            </div>
                                </StaggerItem>
                                        <StaggerItem direction="right">
                                            <div className="flex items-start gap-4">
                                        <motion.div
                                                    className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0"
                                            whileHover={{
                                                    scale: 1.1,
                                                        backgroundColor: 'rgba(42, 111, 71, 0.2)',
                                                }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                    <Check className="w-5 h-5 text-primary" />
                                            </motion.div>
                                                <div>
                                                    <h4 className="mb-2 text-lg font-normal uppercase font-body">
                                                        Seamless Communication
                                                    </h4>
                                            <p className="text-xs uppercase text-muted-foreground font-body">
                                                        Send personalized messages, quotes, and updates directly from client profiles. Professional communication that builds trust and drives results.
                                            </p>
                        </div>
                                            </div>
                                </StaggerItem>
                            </StaggerContainer>
                                        <motion.div
                                        className="overflow-hidden rounded-xl md:order-1"
                                        initial={{ opacity: 0, x: 50 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.8 }}
                                            viewport={{ once: true }}
                                        >
                                                <motion.div
                                            whileHover={{ scale: 1.03 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Image
                                                src="/images/covers/client.webp"
                                                alt="Client relationship management dashboard"
                                                width={600}
                                                height={400}
                                                className="w-full h-auto rounded-xl"
                                            />
                                            </motion.div>
                                        </motion.div>
                                    </div>
                            </div>

                            {/* Data-Driven Decisions CTA */}
                            <div className="text-center">
                                <StaggerContainer staggerChildren={0.2}>
                                <StaggerItem>
                                        <h3 className="mb-4 text-2xl font-normal uppercase font-body">
                                            Data-Driven Decision Making Made Simple
                                        </h3>
                                </StaggerItem>
                                <StaggerItem>
                                        <p className="mb-6 text-xs uppercase text-muted-foreground font-body">
                                            Transform your business intelligence from guesswork to precision with real-time analytics that actually help you grow.
                                    </p>
                                </StaggerItem>
                                    <StaggerItem>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                            className="inline-block"
                                        >
                                            <Button asChild className="text-xs font-normal uppercase font-body">
                                                <Link href="/signup">
                                                    Start Your Free Trial
                                        </Link>
                                    </Button>
                                </motion.div>
                                    </StaggerItem>
                                </StaggerContainer>
                            </div>
                        </div>
                    </MotionSection>

                    {/* Testimonials Section */}
                    <MotionSection
                        id="testimonials"
                        className="py-20 bg-muted"
                        direction="up"
                    >
                        <div className="container px-4 mx-auto md:px-6">
                            <StaggerContainer
                                className="mb-12 text-center"
                                staggerChildren={0.2}
                            >
                                <StaggerItem>
                                    <h2 className="text-3xl font-normal tracking-tighter uppercase font-body sm:text-4xl md:text-5xl">
                                        What Our Users Say
                                    </h2>
                                </StaggerItem>
                                <StaggerItem>
                                    <p className="mt-4 text-xs uppercase text-muted-foreground font-body md:text-xl">
                                        Hear from professionals who have
                                        transformed their networking with Kaad
                                    </p>
                                </StaggerItem>
                            </StaggerContainer>
                            <StaggerContainer
                                className="grid gap-8 md:grid-cols-3"
                                staggerChildren={0.15}
                            >
                                {[
                                    {
                                        initials: 'SM',
                                        name: 'Sarah M.',
                                        role: 'Graphic Designer',
                                        quote: 'Kaad made it so easy to create a professional card for my freelance business! The QR code feature has been a game-changer at networking events.',
                                        stars: 5,
                                    },
                                    {
                                        initials: 'JT',
                                        name: 'James T.',
                                        role: 'Startup Founder',
                                        quote: "I love the NFC feature—it's perfect for networking events! Our team uses Kaad for all our business cards, and the analytics help us track our networking ROI.",
                                        stars: 5,
                                    },
                                    {
                                        initials: 'PR',
                                        name: 'Priya R.',
                                        role: 'Small Business Owner',
                                        quote: "Affordable and intuitive, exactly what I needed. I've received so many compliments on my digital business card, and I love that I can update it anytime without reprinting.",
                                        stars: 4,
                                    },
                                ].map((testimonial, index) => (
                                    <StaggerItem key={index} direction="up">
                                        <motion.div
                                            className="h-full p-6 shadow-sm bg-card rounded-xl"
                                            whileHover={{
                                                y: -10,
                                                boxShadow:
                                                    '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="flex items-center gap-4 mb-4">
                                                <motion.div
                                                    className="flex items-center justify-center w-12 h-12 text-xl font-normal uppercase rounded-full font-body bg-primary/10 text-primary"
                                                    whileHover={{ scale: 1.1 }}
                                                    transition={{
                                                        duration: 0.3,
                                                    }}
                                                >
                                                    {testimonial.initials}
                                                </motion.div>
                                                <div>
                                                    <h3 className="font-normal uppercase font-body">
                                                        {testimonial.name}
                                                    </h3>
                                                    <p className="text-[10px] font-normal uppercase text-muted-foreground font-body">
                                                        {testimonial.role}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-xs italic uppercase text-muted-foreground font-body">
                                                "{testimonial.quote}"
                                            </p>
                                            <div className="flex mt-4">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <motion.svg
                                                        key={star}
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                        className={
                                                            star <=
                                                            testimonial.stars
                                                                ? 'text-yellow-500'
                                                                : 'text-yellow-500/50'
                                                        }
                                                        initial={{
                                                            opacity: 0,
                                                            scale: 0.5,
                                                        }}
                                                        whileInView={{
                                                            opacity: 1,
                                                            scale: 1,
                                                        }}
                                                        transition={{
                                                            duration: 0.3,
                                                            delay:
                                                                0.5 +
                                                                star * 0.1,
                                                        }}
                                                        viewport={{
                                                            once: true,
                                                        }}
                                                    >
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                    </motion.svg>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </StaggerItem>
                                ))}
                            </StaggerContainer>
                        </div>
                    </MotionSection>

                    <MotionSection
                        id="customization"
                        className="py-20 bg-accent"
                        direction="up"
                    >
                        <div className="container px-4 mx-auto md:px-6">
                            <StaggerContainer
                                className="mb-12 text-center"
                                staggerChildren={0.2}
                            >
                                <StaggerItem>
                                    <h2 className="text-3xl font-normal tracking-tighter uppercase font-body sm:text-4xl md:text-5xl">
                                        Complete Business Customization
                                    </h2>
                                </StaggerItem>
                                <StaggerItem>
                                    <p className="mt-4 text-xs uppercase text-muted-foreground font-body md:text-xs">
                                        Transform Loro to match your brand identity and business processes with comprehensive customization options
                                    </p>
                                </StaggerItem>
                            </StaggerContainer>
                            <StaggerContainer
                                className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                                staggerChildren={0.15}
                            >
                                {[
                                    {
                                        name: 'Brand Appearance',
                                        icon: '🎨',
                                        description:
                                            'Customize colors, logos, fonts, and themes to match your corporate identity perfectly.',
                                        features: ['Custom color schemes', 'Logo integration', 'Font selection', 'Theme templates', 'White-label options'],
                                        bgClass:
                                            'bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30',
                                    },
                                    {
                                        name: 'Business Settings',
                                        icon: '⚙️',
                                        description:
                                            'Configure workflows, permissions, and business rules to align with your operational needs.',
                                        features: ['Custom workflows', 'User permissions', 'Business rules', 'Approval processes', 'Integration settings'],
                                        bgClass:
                                            'bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30',
                                    },
                                    {
                                        name: 'Operating Hours',
                                        icon: '🕒',
                                        description:
                                            'Set up flexible schedules, time zones, and working hours for different branches and teams.',
                                        features: ['Multi-timezone support', 'Branch-specific hours', 'Holiday calendars', 'Shift management', 'Automated scheduling'],
                                        bgClass:
                                            'bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30',
                                    },
                                ].map((customization, index) => (
                                    <StaggerItem key={index} direction="up">
                                        <motion.div
                                            className="h-full overflow-hidden shadow-sm bg-background rounded-xl"
                                            whileHover={{
                                                y: -10,
                                                boxShadow:
                                                    '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <motion.div
                                                className={`aspect-[4/3] ${customization.bgClass} p-6 flex items-center justify-center relative`}
                                                whileHover={{ scale: 1.02 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                {/* Icon */}
                                                <motion.div
                                                    className="absolute flex items-center justify-center w-16 h-16 top-4 left-4 rounded-xl bg-white/20 backdrop-blur-sm"
                                                    whileHover={{
                                                        scale: 1.1,
                                                        rotate: 5,
                                                    }}
                                                    transition={{
                                                        duration: 0.3,
                                                    }}
                                                >
                                                    <span className="text-3xl">
                                                        {customization.icon}
                                                    </span>
                                                </motion.div>

                                                {/* Demo interface */}
                                                <div className="w-full max-w-[280px] bg-white dark:bg-black rounded-lg p-4 shadow-lg border border-black/10 dark:border-white/10">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-8 h-8 rounded-full bg-primary/20"></div>
                                                        <div className="flex-1">
                                                            <div className="w-full h-3 mb-1 rounded bg-primary/10"></div>
                                                            <div className="w-2/3 h-2 rounded bg-primary/5"></div>
                                                        </div>
                                                    </div>
                                                    <div className="mb-4 space-y-2">
                                                        <div className="w-full h-2 rounded bg-primary/10"></div>
                                                        <div className="w-4/5 h-2 rounded bg-primary/10"></div>
                                                        <div className="w-3/4 h-2 rounded bg-primary/10"></div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex gap-1">
                                                            <div className="w-4 h-4 rounded bg-primary/20"></div>
                                                            <div className="w-4 h-4 rounded bg-primary/20"></div>
                                                            <div className="w-4 h-4 rounded bg-primary/20"></div>
                                                        </div>
                                                        <div className="w-12 h-8 rounded bg-primary/20"></div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                            <div className="p-6">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <motion.div
                                                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10"
                                                        whileHover={{
                                                            scale: 1.1,
                                                            rotate: 5,
                                                        }}
                                                        transition={{
                                                            duration: 0.3,
                                                        }}
                                                    >
                                                        <span className="text-xl">
                                                            {customization.icon}
                                                        </span>
                                                    </motion.div>
                                                    <h3 className="text-xl font-normal uppercase font-body">
                                                        {customization.name}
                                                    </h3>
                                                </div>
                                                <p className="mb-4 text-xs uppercase text-muted-foreground font-body">
                                                    {customization.description}
                                                </p>
                                                <ul className="mb-4 space-y-1">
                                                    {customization.features.map((feature, i) => (
                                                        <li key={i} className="flex items-center text-[10px] uppercase text-muted-foreground font-body">
                                                            <div className="w-1 h-1 mr-2 rounded-full bg-primary"></div>
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <motion.div
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.97 }}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        className="w-full text-xs font-normal uppercase font-body"
                                                    >
                                                        <Link href="/signup">
                                                            Customize Now
                                                        </Link>
                                                    </Button>
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    </StaggerItem>
                                ))}
                            </StaggerContainer>
                            <motion.div
                                className="mt-12 text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                viewport={{ once: true }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button asChild className="text-xs font-normal uppercase font-body">
                                        <Link href="/signup">
                                            Start Customizing Your Business
                                        </Link>
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </div>
                    </MotionSection>

                    {/* APK Download Section */}
                    <MotionSection
                        id="mobile-app"
                        className="py-20 bg-gradient-to-br from-primary/5 via-background to-primary/10"
                        direction="up"
                    >
                        <div className="container px-4 mx-auto md:px-6">
                            <StaggerContainer
                                className="mb-12 text-center"
                                staggerChildren={0.2}
                            >
                                <StaggerItem>
                                    <h2 className="text-3xl font-normal tracking-tighter uppercase sm:text-4xl md:text-5xl font-body">
                                        Take LORO Mobile With You
                                    </h2>
                                </StaggerItem>
                                <StaggerItem>
                                    <p className="mt-4 text-xs uppercase text-muted-foreground font-body md:text-xs">
                                        Download the LORO Android app and manage your business operations on the go. 100% offline capability with real-time sync when connected.
                                    </p>
                                </StaggerItem>
                            </StaggerContainer>

                            <div className="grid items-center gap-8 md:grid-cols-2">
                                <StaggerContainer
                                    className="space-y-6"
                                    staggerChildren={0.15}
                                >
                                    <StaggerItem>
                                        <h3 className="text-2xl font-normal uppercase font-body">
                                            Everything You Need in Your Pocket
                                        </h3>
                                    </StaggerItem>
                                    <StaggerItem direction="left">
                                        <div className="flex items-start gap-4">
                                            <motion.div
                                                className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0"
                                                whileHover={{
                                                    scale: 1.1,
                                                    backgroundColor: 'rgba(42, 111, 71, 0.2)',
                                                }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <span className="text-lg">📱</span>
                                            </motion.div>
                                            <div>
                                                <h4 className="mb-2 text-lg font-normal uppercase font-body">
                                                    Native Android Experience
                                                </h4>
                                                <p className="text-xs uppercase text-muted-foreground font-body">
                                                    Optimized for Android devices with intuitive navigation and smooth performance.
                                                </p>
                                            </div>
                                        </div>
                                    </StaggerItem>
                                    <StaggerItem direction="left">
                                        <div className="flex items-start gap-4">
                                            <motion.div
                                                className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0"
                                                whileHover={{
                                                    scale: 1.1,
                                                    backgroundColor: 'rgba(42, 111, 71, 0.2)',
                                                }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <span className="text-lg">🔄</span>
                                            </motion.div>
                                            <div>
                                                <h4 className="mb-2 text-lg font-normal uppercase font-body">
                                                    Offline-First Design
                                                </h4>
                                                <p className="text-xs uppercase text-muted-foreground font-body">
                                                    Work seamlessly without internet connection. Data syncs automatically when you're back online.
                                                </p>
                                            </div>
                                        </div>
                                    </StaggerItem>
                                    <StaggerItem direction="left">
                                        <div className="flex items-start gap-4">
                                            <motion.div
                                                className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0"
                                                whileHover={{
                                                    scale: 1.1,
                                                    backgroundColor: 'rgba(42, 111, 71, 0.2)',
                                                }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <span className="text-lg">📍</span>
                                            </motion.div>
                                            <div>
                                                <h4 className="mb-2 text-lg font-normal uppercase font-body">
                                                    GPS & Location Tracking
                                                </h4>
                                                <p className="text-xs uppercase text-muted-foreground font-body">
                                                    Real-time GPS tracking for field teams with route optimization and check-in capabilities.
                                                </p>
                                            </div>
                                        </div>
                                    </StaggerItem>

                                    <StaggerItem>
                                        <motion.div
                                            className="flex gap-4 pt-6"
                                            whileHover={{ scale: 1.02 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex-1"
                                            >
                                                <Button
                                                    asChild
                                                    size="lg"
                                                    className="w-full text-xs font-normal uppercase font-body bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                                                >
                                                    <a
                                                        href="https://storage.googleapis.com/crmapplications/resources/apk.apk"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-2"
                                                    >
                                                        <span>📱</span>
                                                        <span>Download Android APK</span>
                                                    </a>
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    </StaggerItem>
                                </StaggerContainer>

                                <StaggerItem direction="right">
                                    <motion.div
                                        className="relative flex items-center justify-center"
                                        initial={{ opacity: 0, x: 50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.8 }}
                                        viewport={{ once: true }}
                                    >
                                        {/* Phone mockup */}
                                        <div className="relative">
                                            <motion.div
                                                className="relative z-10"
                                                whileHover={{ scale: 1.02, rotate: 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Image
                                                    src="/images/covers/mobile.png"
                                                    alt="LORO Mobile App on Android"
                                                    width={300}
                                                    height={600}
                                                    className="shadow-2xl rounded-3xl"
                                                />
                                            </motion.div>

                                            {/* Floating app icons */}
                                            <motion.div
                                                className="absolute flex items-center justify-center w-16 h-16 bg-green-500 shadow-lg -top-4 -left-4 rounded-xl"
                                                animate={{
                                                    y: [0, -10, 0],
                                                    rotate: [0, 5, 0],
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Number.POSITIVE_INFINITY,
                                                    repeatType: 'reverse',
                                                }}
                                            >
                                                <span className="text-2xl text-white">📊</span>
                                            </motion.div>

                                            <motion.div
                                                className="absolute flex items-center justify-center w-16 h-16 bg-blue-500 shadow-lg -bottom-6 -right-6 rounded-xl"
                                                animate={{
                                                    y: [0, 10, 0],
                                                    rotate: [0, -5, 0],
                                                }}
                                                transition={{
                                                    duration: 4,
                                                    repeat: Number.POSITIVE_INFINITY,
                                                    repeatType: 'reverse',
                                                    delay: 1,
                                                }}
                                            >
                                                <span className="text-2xl text-white">🎯</span>
                                            </motion.div>

                                            <motion.div
                                                className="absolute flex items-center justify-center bg-purple-500 rounded-full shadow-lg top-1/3 -right-8 w-14 h-14"
                                                animate={{
                                                    x: [0, 10, 0],
                                                    scale: [1, 1.1, 1],
                                                }}
                                                transition={{
                                                    duration: 2.5,
                                                    repeat: Number.POSITIVE_INFINITY,
                                                    repeatType: 'reverse',
                                                    delay: 0.5,
                                                }}
                                            >
                                                <span className="text-xl text-white">📱</span>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                </StaggerItem>
                            </div>

                            {/* App features grid */}
                            <StaggerContainer
                                className="grid gap-6 mt-16 md:grid-cols-3"
                                staggerChildren={0.1}
                            >
                                {[
                                    {
                                        icon: '⚡',
                                        title: 'Lightning Fast',
                                        description: 'Optimized performance with instant app loading and smooth transitions.'
                                    },
                                    {
                                        icon: '🔒',
                                        title: 'Secure & Private',
                                        description: 'End-to-end encryption with biometric authentication support.'
                                    },
                                    {
                                        icon: '🌐',
                                        title: 'Works Everywhere',
                                        description: 'Full functionality even in areas with poor or no internet connectivity.'
                                    }
                                ].map((feature, index) => (
                                    <StaggerItem key={index} direction="up">
                                        <motion.div
                                            className="p-6 text-center border shadow-sm bg-card/50 backdrop-blur-sm rounded-xl border-border"
                                            whileHover={{
                                                y: -5,
                                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <motion.div
                                                className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10"
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <span className="text-3xl">{feature.icon}</span>
                                            </motion.div>
                                            <h3 className="mb-2 text-lg font-normal uppercase font-body">
                                                {feature.title}
                                            </h3>
                                            <p className="text-xs uppercase text-muted-foreground font-body">
                                                {feature.description}
                                            </p>
                                        </motion.div>
                                    </StaggerItem>
                                ))}
                            </StaggerContainer>
                        </div>
                    </MotionSection>

                    <MotionSection
                        id="pricing"
                        className="py-20"
                        direction="up"
                    >
                        <div className="container px-4 mx-auto md:px-6">
                            <StaggerContainer
                                className="mb-12 text-center"
                                staggerChildren={0.2}
                            >
                                <StaggerItem>
                                    <h2 className="text-3xl font-normal tracking-tighter uppercase sm:text-4xl md:text-5xl font-body">
                                        Transparent Pricing for Every Business
                                    </h2>
                                </StaggerItem>
                                <StaggerItem>
                                    <p className="mt-4 text-xs uppercase text-muted-foreground font-body md:text-xs">
                                        Choose the plan that fits your team size and needs. All prices in South African Rands, per user per month.
                                    </p>
                                </StaggerItem>
                            </StaggerContainer>
                            <StaggerContainer
                                className="grid gap-8 md:grid-cols-3"
                                staggerChildren={0.15}
                            >
                                <StaggerItem direction="up">
                                    <motion.div
                                        className="h-full p-6 border shadow-sm bg-card rounded-xl border-border"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-6">
                                            <motion.div
                                                className="flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-primary/10"
                                                whileHover={{
                                                    scale: 1.1,
                                                    rotate: 5,
                                                }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <span className="text-2xl">
                                                    🚀
                                                </span>
                                            </motion.div>
                                            <h3 className="text-xl font-normal uppercase font-body">
                                                Basic Plan
                                            </h3>
                                            <p className="mt-2 text-3xl font-normal font-body">
                                                R99
                                            </p>
                                            <p className="text-xs uppercase text-muted-foreground font-body">
                                                per user/month
                                            </p>
                                        </div>
                                        <ul className="mb-6 space-y-2">
                                            {[
                                                'Lead creation & tracking (up to 500)',
                                                'Basic expense claims workflow',
                                                'Activity logging & notes',
                                                'Real-time tracking (up to 5 users)',
                                                'Client profile management',
                                                'Basic task management',
                                                'Standard reports (CSV/Excel)',
                                                'Stock level visibility',
                                                'Basic product catalog',
                                            ].map((feature, i) => (
                                                <motion.li
                                                    key={i}
                                                    className="flex items-start"
                                                    initial={{
                                                        opacity: 0,
                                                        x: -20,
                                                    }}
                                                    whileInView={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.3,
                                                        delay: 0.3 + i * 0.05,
                                                    }}
                                                    viewport={{ once: true }}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="24"
                                                        height="24"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="w-4 h-4 mr-2 mt-0.5 text-green-500 shrink-0"
                                                    >
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                    <span className="text-[10px] font-normal uppercase font-body">{feature}</span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                        <motion.div
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            <Button
                                                variant="outline"
                                                className="w-full text-xs font-normal uppercase font-body"
                                            >
                                                <Link href="/signup?plan=basic">
                                                    Start Basic Plan
                                                </Link>
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                </StaggerItem>
                                <StaggerItem
                                    direction="up"
                                    className="mt-4 md:mt-0"
                                >
                                    <motion.div
                                        className="relative h-full p-6 border-2 shadow-lg bg-card rounded-xl border-primary"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <motion.div
                                            className="absolute px-4 py-1 text-xs font-normal uppercase transform -translate-x-1/2 rounded-full -top-4 left-1/2 bg-primary text-primary-foreground font-body"
                                            initial={{ y: -10, opacity: 0 }}
                                            whileInView={{ y: 0, opacity: 1 }}
                                            transition={{
                                                duration: 0.5,
                                                delay: 0.2,
                                            }}
                                            viewport={{ once: true }}
                                        >
                                            Most Popular
                                        </motion.div>
                                        <div className="mb-6">
                                            <motion.div
                                                className="flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-primary/10"
                                                whileHover={{
                                                    scale: 1.1,
                                                    rotate: 5,
                                                }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <span className="text-2xl">
                                                    ⭐
                                                </span>
                                            </motion.div>
                                            <h3 className="text-xl font-normal uppercase font-body">
                                                Premium Plan
                                            </h3>
                                            <p className="mt-2 text-3xl font-normal font-body">
                                                R199
                                            </p>
                                            <p className="text-xs uppercase text-muted-foreground font-body">
                                                per user/month
                                            </p>
                                        </div>
                                        <ul className="mb-6 space-y-2">
                                            {[
                                                'Everything in Basic Plan',
                                                'Unlimited lead storage',
                                                'Advanced approval workflows',
                                                'Unlimited user tracking',
                                                'Geofencing & route alerts',
                                                'Client portal access',
                                                'Quotation PDF generation',
                                                'Custom report builder',
                                                'Priority 24/7 support',
                                                'Subtasks & priority tagging',
                                            ].map((feature, i) => (
                                                <motion.li
                                                    key={i}
                                                    className="flex items-start"
                                                    initial={{
                                                        opacity: 0,
                                                        x: -20,
                                                    }}
                                                    whileInView={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.3,
                                                        delay: 0.3 + i * 0.05,
                                                    }}
                                                    viewport={{ once: true }}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="24"
                                                        height="24"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="w-4 h-4 mr-2 mt-0.5 text-green-500 shrink-0"
                                                    >
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                    <span className="text-[10px] font-normal uppercase font-body">{feature}</span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                        <motion.div
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            <Button className="w-full text-xs font-normal uppercase font-body">
                                                <Link href="/signup?plan=premium">
                                                    Get Premium
                                                </Link>
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                </StaggerItem>
                                <StaggerItem
                                    direction="up"
                                    className="mt-8 md:mt-0"
                                >
                                    <motion.div
                                        className="h-full p-6 border shadow-sm bg-card rounded-xl border-border"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-6">
                                            <motion.div
                                                className="flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-primary/10"
                                                whileHover={{
                                                    scale: 1.1,
                                                    rotate: 5,
                                                }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <span className="text-2xl">
                                                    🏢
                                                </span>
                                            </motion.div>
                                            <h3 className="text-xl font-normal uppercase font-body">
                                                Enterprise Plan
                                            </h3>
                                            <p className="mt-2 text-3xl font-normal font-body">
                                                R399
                                            </p>
                                            <p className="text-xs uppercase text-muted-foreground font-body">
                                                per user/month
                                            </p>
                                        </div>
                                        <ul className="mb-6 space-y-2">
                                            {[
                                                'Everything in Premium Plan',
                                                'Audit logs & SSO integration',
                                                'Custom user permissions',
                                                'Workflow automation',
                                                'API access for integrations',
                                                'Bulk actions & mass updates',
                                                'Custom branding on PDFs',
                                                'Unlimited attachments/data',
                                                'Dedicated account manager',
                                                'SLA-guaranteed support',
                                            ].map((feature, i) => (
                                                <motion.li
                                                    key={i}
                                                    className="flex items-start"
                                                    initial={{
                                                        opacity: 0,
                                                        x: -20,
                                                    }}
                                                    whileInView={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.3,
                                                        delay: 0.3 + i * 0.05,
                                                    }}
                                                    viewport={{ once: true }}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="24"
                                                        height="24"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="w-4 h-4 mr-2 mt-0.5 text-green-500 shrink-0"
                                                    >
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                    <span className="text-[10px] font-normal uppercase font-body">{feature}</span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                        <motion.div
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            <Button
                                                variant="outline"
                                                className="w-full text-xs font-normal uppercase font-body"
                                            >
                                                <Link href="/contact">
                                                    Contact Sales
                                                </Link>
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                </StaggerItem>
                            </StaggerContainer>
                            <motion.div
                                className="mt-12 text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                viewport={{ once: true }}
                            >
                                <p className="mb-4 text-xs uppercase text-muted-foreground font-body">
                                    All plans include free trial • Annual billing saves up to 20% • No setup fees
                                </p>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button asChild variant="outline" className="text-xs font-normal uppercase font-body">
                                        <Link href="/pricing-comparison">
                                            Compare All Features
                                        </Link>
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </div>
                    </MotionSection>
                </main>

                {/* FAQ Section */}
                <MotionSection id="faq" className="py-20" direction="up">
                    <div className="container px-4 mx-auto md:px-6">
                        <StaggerContainer
                            className="mb-12 text-center"
                            staggerChildren={0.2}
                        >
                            <StaggerItem>
                                <h2 className="text-3xl font-normal tracking-tighter uppercase sm:text-4xl md:text-5xl font-body">
                                    Frequently Asked Questions
                                </h2>
                            </StaggerItem>
                            <StaggerItem>
                                <p className="mt-4 text-xs uppercase text-muted-foreground font-body md:text-xs">
                                    Find answers to common questions about Loro CRM
                                </p>
                            </StaggerItem>
                        </StaggerContainer>

                        {/* FAQ Categories */}
                        <div className="max-w-4xl mx-auto space-y-12">
                            {/* General FAQs */}
                            <div>
                                <h3 className="mb-6 text-2xl font-normal text-center uppercase font-body">General</h3>
                        <StaggerContainer
                                    className="grid gap-4 md:gap-6"
                            staggerChildren={0.1}
                        >
                            {[
                                {
                                            icon: '💰',
                                            question: 'Can I switch plans later?',
                                            answer: 'Yes! Upgrades and downgrades are prorated automatically. You can change plans anytime through your account dashboard or by contacting our support team.',
                                        },
                                        {
                                            icon: '🆓',
                                            question: 'Is there a free trial?',
                                            answer: 'Yes—Basic plan trials are available for all new users. For Premium and Enterprise trial options, please contact our sales team who can set up a customized trial period.',
                                        },
                                        {
                                            icon: '❌',
                                            question: 'How do I cancel my subscription?',
                                            answer: 'You can cancel anytime by going to Account > Subscription in your dashboard or by contacting our support team. We have no long-term contracts, so you\'re free to cancel whenever needed.',
                                        },
                                        {
                                            icon: '📊',
                                            question: 'What happens to my data if I cancel?',
                                            answer: 'Your data remains accessible for 30 days after cancellation, giving you time to export everything you need. After 30 days, data is permanently deleted from our servers.',
                                        },
                                    ].map((faq, index) => (
                                        <StaggerItem key={index} direction="up">
                                            <motion.div
                                                className="p-6 rounded-lg shadow-sm bg-card"
                                                whileHover={{
                                                    y: -5,
                                                    boxShadow:
                                                        '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                                }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <motion.div
                                                        className="flex items-center justify-center w-12 h-12 mt-1 rounded-xl bg-primary/10 shrink-0"
                                                        whileHover={{
                                                            scale: 1.1,
                                                            rotate: 5,
                                                        }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <span className="text-2xl">
                                                            {faq.icon}
                                                        </span>
                                                    </motion.div>
                                                    <div className="flex-1">
                                                        <h4 className="mb-2 text-lg font-normal uppercase font-body">
                                                            {faq.question}
                                                        </h4>
                                                        <p className="text-xs uppercase text-muted-foreground font-body">
                                                            {faq.answer}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </StaggerItem>
                                    ))}
                                </StaggerContainer>
                            </div>

                            {/* Technical FAQs */}
                            <div>
                                <h3 className="mb-6 text-2xl font-normal text-center uppercase font-body">Technical</h3>
                                <StaggerContainer
                                    className="grid gap-4 md:gap-6"
                                    staggerChildren={0.1}
                                >
                                    {[
                                        {
                                            icon: '🔒',
                                            question: 'Is my data secure?',
                                            answer: 'Absolutely! All data is encrypted both in transit and at rest using bank-grade security protocols. Enterprise plans include additional audit logs and compliance features.',
                                        },
                                        {
                                            icon: '📱',
                                            question: 'Can I use Loro offline?',
                                            answer: 'Yes! Our mobile app supports limited offline functionality including drafting journals, creating leads, and viewing client information. Data automatically syncs when you\'re back online.',
                                        },
                                        {
                                            icon: '📍',
                                            question: 'How often is location tracking updated?',
                                            answer: 'Location tracking typically updates every 2-5 minutes for optimal battery life and accuracy. Enterprise customers can adjust this frequency based on their specific needs.',
                                },
                                {
                                    icon: '🔗',
                                            question: 'Do you offer API access for integrations?',
                                            answer: 'Yes! Enterprise plans include full API access for custom integrations with your existing business systems. Our development team can assist with integration planning.',
                                        },
                                    ].map((faq, index) => (
                                        <StaggerItem key={index} direction="up">
                                            <motion.div
                                                className="p-6 rounded-lg shadow-sm bg-card"
                                                whileHover={{
                                                    y: -5,
                                                    boxShadow:
                                                        '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                                }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <motion.div
                                                        className="flex items-center justify-center w-12 h-12 mt-1 rounded-xl bg-primary/10 shrink-0"
                                                        whileHover={{
                                                            scale: 1.1,
                                                            rotate: 5,
                                                        }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <span className="text-2xl">
                                                            {faq.icon}
                                                        </span>
                                                    </motion.div>
                                                    <div className="flex-1">
                                                        <h4 className="mb-2 text-lg font-normal uppercase font-body">
                                                            {faq.question}
                                                        </h4>
                                                        <p className="text-xs uppercase text-muted-foreground font-body">
                                                            {faq.answer}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </StaggerItem>
                                    ))}
                                </StaggerContainer>
                            </div>

                            {/* Billing FAQs */}
                            <div>
                                <h3 className="mb-6 text-2xl font-normal text-center uppercase font-body">Billing</h3>
                                <StaggerContainer
                                    className="grid gap-4 md:gap-6"
                                    staggerChildren={0.1}
                                >
                                    {[
                                        {
                                            icon: '💳',
                                            question: 'What payment methods do you accept?',
                                            answer: 'We accept all major credit and debit cards including Visa, Mastercard, and American Express. Enterprise customers can also arrange invoicing and bank transfer options.',
                                        },
                                        {
                                            icon: '📅',
                                            question: 'Are there discounts for annual billing?',
                                            answer: 'Yes! Annual plans save up to 20% compared to monthly billing. The exact discount varies by tier, and you can switch to annual billing anytime from your account dashboard.',
                                        },
                                        {
                                            icon: '↩️',
                                            question: 'Can I get a refund?',
                                            answer: 'Refund requests are evaluated on a case-by-case basis. Please contact our billing team if you have concerns about your subscription or need assistance.',
                                        },
                                        {
                                            icon: '🏪',
                                            question: 'Do you offer custom pricing for large teams?',
                                            answer: 'Yes! For teams over 50 users or organizations with specific requirements, we offer custom pricing and packages. Contact our sales team for a personalized quote.',
                                },
                            ].map((faq, index) => (
                                <StaggerItem key={index} direction="up">
                                    <motion.div
                                        className="p-6 rounded-lg shadow-sm bg-card"
                                        whileHover={{
                                            y: -5,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <motion.div
                                                className="flex items-center justify-center w-12 h-12 mt-1 rounded-xl bg-primary/10 shrink-0"
                                                whileHover={{
                                                    scale: 1.1,
                                                    rotate: 5,
                                                }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <span className="text-2xl">
                                                    {faq.icon}
                                                </span>
                                            </motion.div>
                                            <div className="flex-1">
                                                        <h4 className="mb-2 text-lg font-normal uppercase font-body">
                                                    {faq.question}
                                                        </h4>
                                                <p className="text-xs uppercase text-muted-foreground font-body">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                            </div>
                        </div>

                        {/* Contact CTA */}
                        <motion.div
                            className="mt-16 text-center"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <p className="mb-4 text-sm uppercase text-muted-foreground font-body">
                                Still have questions? We're here to help!
                            </p>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button asChild className="text-xs font-normal uppercase font-body">
                                    <Link href="/contact">
                                        Contact Support
                                    </Link>
                                </Button>
                            </motion.div>
                        </motion.div>
                    </div>
                </MotionSection>

                {/* Membership Section */}
                <MotionSection
                    className="py-16 bg-primary text-primary-foreground"
                    direction="none"
                >
                    <div className="container px-4 mx-auto md:px-6">
                        <StaggerContainer
                            className="mb-8 text-center"
                            staggerChildren={0.2}
                        >
                            <StaggerItem>
                                <h2 className="text-3xl font-normal tracking-tighter uppercase font-body">
                                    Join Membership And
                                    <br />
                                    Connect To Every Member
                                </h2>
                            </StaggerItem>
                            <StaggerItem>
                                <p className="max-w-2xl mx-auto mt-4 text-xs text-white uppercase font-body">
                                    Level up your networking with our premium
                                    membership. Get access to exclusive
                                    templates, advanced analytics, and
                                    networking events.
                                </p>
                            </StaggerItem>
                        </StaggerContainer>
                        <motion.div
                            className="max-w-md mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            viewport={{ once: true }}
                        >
                            <motion.div
                                className="flex"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="rounded-r-none bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
                                />
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        variant="secondary"
                                        className="text-xs font-normal uppercase rounded-l-none font-body"
                                    >
                                        Subscribe
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div>
                </MotionSection>

                <MotionSection
                    className="py-12 border-t bg-muted/30"
                    direction="none"
                >
                    <div className="container px-4 mx-auto md:px-6">
                        <div className="flex flex-col justify-between mb-8 md:flex-row">
                            <StaggerContainer
                                className="mb-8 md:mb-0"
                                staggerChildren={0.1}
                            >
                                <StaggerItem>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-xl font-normal uppercase font-body">
                                            LORO CRM
                                        </span>
                                    </div>
                                </StaggerItem>
                                <StaggerItem>
                                    <div className="flex space-x-4">
                                        {[
                                            'twitter',
                                            'instagram',
                                            'linkedin',
                                        ].map((social, index) => (
                                            <motion.div
                                                key={social}
                                                whileHover={{
                                                    scale: 1.2,
                                                    rotate: 5,
                                                }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Link
                                                    href="#"
                                                    className="text-muted-foreground hover:text-foreground"
                                                >
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                        className="w-5 h-5"
                                                    >
                                                        {social === 'twitter' && (
                                                            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                                        )}
                                                        {social === 'instagram' && (
                                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                                        )}
                                                        {social === 'linkedin' && (
                                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                                        )}
                                                    </svg>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </div>
                                </StaggerItem>
                            </StaggerContainer>
                            <StaggerContainer
                                className="grid grid-cols-2 gap-8 md:grid-cols-4"
                                staggerChildren={0.1}
                            >
                                {['Account', 'Help', 'Company', 'Legal'].map(
                                    (category, categoryIndex) => (
                                        <StaggerItem
                                            key={category}
                                            direction="up"
                                        >
                                            <h3 className="mb-4 text-xs font-normal uppercase font-body">
                                                {category}
                                            </h3>
                                            <ul className="space-y-2">
                                                {[
                                                    category === 'Account'
                                                        ? [
                                                              'Dashboard',
                                                              'Settings',
                                                              'Billing',
                                                          ]
                                                        : category === 'Help'
                                                          ? [
                                                                'Support',
                                                                'FAQ',
                                                                'Resources',
                                                            ]
                                                          : category ===
                                                              'Company'
                                                            ? [
                                                                  'About',
                                                                  'Careers',
                                                                  'Contact',
                                                              ]
                                                            : [
                                                                  'Privacy',
                                                                  'Terms',
                                                                  'Cookies',
                                                              ],
                                                ][0].map((item, itemIndex) => (
                                                    <motion.li
                                                        key={item}
                                                        initial={{
                                                            opacity: 0,
                                                            x: -10,
                                                        }}
                                                        whileInView={{
                                                            opacity: 1,
                                                            x: 0,
                                                        }}
                                                        transition={{
                                                            duration: 0.3,
                                                            delay:
                                                                0.2 +
                                                                itemIndex * 0.1,
                                                        }}
                                                        viewport={{
                                                            once: true,
                                                        }}
                                                    >
                                                        <Link
                                                            href="#"
                                                            className="text-xs text-muted-foreground hover:text-foreground font-body"
                                                        >
                                                            {item}
                                                        </Link>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </StaggerItem>
                                    ),
                                )}
                            </StaggerContainer>
                        </div>
                        <motion.div
                            className="pt-8 text-center border-t"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <p className="text-xs font-normal uppercase text-muted-foreground font-body">
                                © {new Date().getFullYear()} LORO CRM. All rights
                                reserved.
                            </p>
                        </motion.div>
                    </div>
                </MotionSection>

                <ScrollToTop />
            </div>
        </PageTransition>
    );
}

