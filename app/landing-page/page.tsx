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
    ArrowRight,
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
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Target,
    CheckSquare,
    ShoppingCart,
    MapPin,
    BarChart3,
    Cpu,
    LayoutTemplate,
    Settings,
    Layers,
    Users,
    PlayCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
// Import required Swiper modules
import { Pagination, Autoplay } from 'swiper/modules';

// Update the constants for call time management to use environment variables with fallbacks
const CALL_MAX_DURATION_MS =
    parseInt(process.env.NEXT_PUBLIC_MAX_CALL_DURATION_MINUTES || '5', 10) *
    60 *
    1000; // Default: 5 minutes
const WARNING_TIME_REMAINING_MS =
    parseInt(process.env.NEXT_PUBLIC_CALL_WARNING_SECONDS || '60', 10) * 1000; // Default: 60 seconds

// Define the new FAQ data array
const faqData = [
    {
        value: 'faq-offline-tracking',
        question:
            "Can Loro track my field team's location even without internet?",
        answer: 'Yes! Loro\'s mobile app offers offline GPS tracking. Location data is stored on the device when offline and syncs automatically once a connection is re-established. Ensure mobile users grant "Always Allow" location permissions for best results.',
    },
    {
        value: 'faq-roles',
        question:
            'How does Loro handle different user roles like managers and field workers?',
        answer: 'Loro uses Role-Based Access Control (RBAC). Predefined roles (Admin, Manager, Worker, Client) determine what features and data each user can access, ensuring appropriate permissions for tasks like claim approvals or mobile app usage.',
    },
    {
        value: 'faq-client-login',
        question: 'Can clients log in to Loro? What can they do?',
        answer: 'Yes, Loro supports separate logins for external clients. Depending on configuration, they might use the mobile app or dashboard to view product catalogs, manage quotations (including in-app chat), track orders, and access shared information.',
    },
    {
        value: 'faq-reporting',
        question: 'What kind of reporting is available in Loro?',
        answer: 'Loro offers comprehensive reporting via the dashboard, covering Leads, Sales, Tasks, User Activity, Inventory, and Claims. Reports feature charts, data tables, and filtering options. Simplified personal metrics are available on the mobile app.',
    },
    {
        value: 'faq-shop-quotation',
        question: 'How does the Shop/Quotation system work?',
        answer: 'Users can browse products, add items to a cart (mobile/dashboard), and submit it as a quotation request. Dashboard users review, modify, and approve quotations, which can then be converted into orders. The system includes features like in-quotation chat.',
    },
    {
        value: 'faq-integrations',
        question: 'Does Loro support integrations like WhatsApp or SMS?',
        answer: 'Currently, Loro offers integrated email for reports/notifications and an in-app chat for Quotations. Direct WhatsApp/SMS integration is not confirmed as an active feature at this time, though it may be considered for future updates.',
    },
    {
        value: 'faq-inventory',
        question: 'Can I manage inventory with Loro?',
        answer: 'Yes, the dashboard includes an Inventory Management module linked to the Shop/Products. You can track stock levels, make adjustments, view valuation reports, and potentially set low-stock alerts. Mobile users typically see stock availability on product pages.',
    },
];

// Define data for the enhanced features grid
const enhancedFeaturesData = [
    {
        icon: Cpu,
        title: 'AI-Powered Assistance',
        description:
            'Get personalized recommendations and insights with AI-powered tools helping you create a polished, professional workflow effortlessly.',
    },
    {
        icon: LayoutTemplate,
        title: 'Customizable Interface',
        description:
            "Choose from a wide range of professionally designed layouts and easily customize fonts, colors, and elements to reflect your brand's identity.",
    },
    {
        icon: Settings,
        title: 'Seamless Integrations',
        description:
            'Easily connect with your favorite apps and services for a unified website and operations experience, enhancing overall productivity.',
    },
    {
        icon: Layers,
        title: 'Responsive Design',
        description:
            'Create websites and access dashboards that look stunning and function perfectly on any device, from desktops to smartphones.',
    },
    {
        icon: BarChart3,
        title: 'Realtime Insights',
        description:
            'Empower your organization with real-time insights for everything important, helping you conquer your unique business goals.',
    },
    {
        icon: Users,
        title: 'Role-Based Access',
        description:
            'Manage permissions effectively with predefined roles (Admin, Manager, Worker, Client) ensuring data security and appropriate access levels.',
    },
];

// Define data for the mobile app showcase
const mobileFeaturesData = [
    {
        title: 'Leads On-the-Go',
        img: '/images/covers/mobileleads.png',
        alt: 'Mobile Leads Screen',
    },
    {
        title: 'Task Management',
        img: '/images/covers/taskdetail.png',
        alt: 'Mobile Tasks Screen',
    },
    {
        title: 'Claim Submission',
        img: '/images/covers/claims.png',
        alt: 'Mobile Claims Screen',
    },
    {
        title: 'Product Catalog',
        img: '/images/covers/product.png',
        alt: 'Mobile Shop Screen',
    },
    {
        title: 'Attendance',
        img: '/images/covers/home2.png',
        alt: 'Mobile Attendance Screen',
    },
    {
        title: 'Leads On-the-Go',
        img: '/images/covers/mobileleads.png',
        alt: 'Mobile Leads Screen',
    },
    {
        title: 'Task Management',
        img: '/images/covers/taskdetail.png',
        alt: 'Mobile Tasks Screen',
    },
    {
        title: 'Claim Submission',
        img: '/images/covers/claims.png',
        alt: 'Mobile Claims Screen',
    },
    {
        title: 'Product Catalog',
        img: '/images/covers/product.png',
        alt: 'Mobile Shop Screen',
    },
    {
        title: 'Attendance',
        img: '/images/covers/home2.png',
        alt: 'Mobile Attendance Screen',
    },
];

// Define data for the dashboard features tabs
const dashboardFeaturesData = [
    {
        value: 'leads',
        title: 'Lead Management',
        icon: Target,
        description:
            'Centralize potential customers, track progress with statuses & categories, visualize locations, and analyze conversion funnels.',
        img: '/images/covers/webleads.png',
        alt: 'Dashboard Leads Management',
    },
    {
        value: 'tasks',
        title: 'Task Coordination',
        icon: CheckSquare,
        description:
            'Create, assign, and monitor tasks with statuses, priorities, and deadlines. Utilize list, board, or calendar views for flexible workflow management.',
        img: '/images/covers/webtasks.png',
        alt: 'Dashboard Task Coordination',
    },
    {
        value: 'sales',
        title: 'Sales & Quotations',
        icon: ShoppingCart,
        description:
            'Manage products, generate quotations, process orders, and track fulfillment. Includes inventory linking and in-quotation chat features.',
        img: '/images/covers/salesweb.png',
        alt: 'Dashboard Sales and Quotations',
    },
    {
        value: 'tracking',
        title: 'Real-time Tracking',
        icon: MapPin,
        description:
            'Monitor field team locations in real-time on an interactive map. View user status, overlay client/task locations, and manage geofences.',
        img: '/images/covers/webtracking.png',
        alt: 'Dashboard Real-time Tracking',
    },
    {
        value: 'reporting',
        title: 'Reporting',
        icon: BarChart3,
        description:
            'Access comprehensive reports across all modules. Filter data, view charts and tables, analyze trends, and export data for deeper insights.',
        img: '/images/covers/reporting.png',
        alt: 'Dashboard Reporting and Analytics',
    },
];

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

    // State for dashboard tabs
    const [activeDashboardTab, setActiveDashboardTab] = useState(
        dashboardFeaturesData[0].value,
    );

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
                                        src="/images/covers/onboadingpage.png"
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

                {/* Dashboard Features Tabs Section */}
                <section className="py-16 bg-background">
                    <div className="container px-4 mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center"
                        >
                            <h2 className="mb-4 text-3xl font-normal uppercase md:text-4xl font-body">
                                Your Command Center
                            </h2>
                            <p className="max-w-2xl mx-auto mb-12 text-xs uppercase text-muted-foreground font-body">
                                Dive into the core functionalities that make
                                Loro CRM the central hub for your business
                                operations, from lead tracking to in-depth
                                reporting.
                            </p>
                        </motion.div>

                        <Tabs
                            defaultValue={dashboardFeaturesData[0].value}
                            className="w-full max-w-5xl mx-auto"
                            onValueChange={setActiveDashboardTab}
                        >
                            {/* Use flex-nowrap and overflow-x-auto for TabsList to ensure items stay on one line */}
                            <TabsList className="flex justify-start h-auto gap-2 p-1 overflow-x-auto bg-transparent flex-nowrap">
                                {dashboardFeaturesData.map((tab) => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        // Apply styles similar to lead-details-modal
                                        className={cn(
                                            'px-4 py-2 cursor-pointer transition-all duration-200 flex-shrink-0',
                                            'text-xs font-thin uppercase rounded-none font-body',
                                            // Ensure consistent height and alignment with borders
                                            'border-b-2',
                                            activeDashboardTab === tab.value
                                                ? 'border-primary text-primary' // Active: Colored border, primary text
                                                : 'border-transparent text-muted-foreground hover:text-foreground', // Inactive: Transparent border, muted text
                                            // Explicitly remove default shadcn/ui TabsTrigger active styles
                                            'data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none',
                                            'data-[state=inactive]:bg-transparent',
                                        )}
                                    >
                                        <tab.icon
                                            className="w-5 h-5 mr-2"
                                            strokeWidth={1.5}
                                        />
                                        <span>{tab.title}</span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {dashboardFeaturesData.map((tab) => (
                                <TabsContent
                                    key={tab.value}
                                    value={tab.value}
                                    className="mt-8"
                                >
                                    <motion.div
                                        key={activeDashboardTab} // Force re-animation on tab change
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className="flex flex-col items-center gap-8 p-6 rounded-lg bg-card md:flex-row"
                                    >
                                        <div className="flex-1 text-center md:text-left">
                                            <h3 className="mb-3 text-xl font-normal uppercase font-body">
                                                {tab.title}
                                            </h3>
                                            <p className="text-xs uppercase text-muted-foreground font-body">
                                                {tab.description}
                                            </p>
                                            {/* Optional Button */}
                                            <Button
                                                variant="link"
                                                className="mt-4 text-xs uppercase font-body"
                                            >
                                                Learn More{' '}
                                                <ArrowRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </div>
                                        <div className="relative flex-shrink-0 w-[200px] lg:w-[400px] h-[200px] lg:h-[400px] mt-4 overflow-hidden rounded-md aspect-video md:w-1/2 md:mt-0">
                                            <Image
                                                src={tab.img}
                                                alt={tab.alt}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    </motion.div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                </section>

                {/* Enhanced Features Section (Replaces the old simple one) */}
                <section className="py-16 bg-background">
                    <div className="container px-4 mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center"
                        >
                            <h2 className="mb-4 text-3xl font-normal uppercase md:text-4xl font-body">
                                Powerful Features to Simplify Your Workflow
                            </h2>
                            <p className="max-w-2xl mx-auto mb-12 text-xs uppercase text-muted-foreground font-body">
                                Loro CRM provides a comprehensive suite of tools
                                designed for efficiency, flexibility, and
                                control, both in the office and in the field.
                            </p>
                        </motion.div>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {enhancedFeaturesData.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.1,
                                    }}
                                >
                                    <Card className="flex flex-col h-full text-left transition-shadow duration-300 bg-card hover:shadow-lg">
                                        <CardHeader className="flex flex-row items-center space-x-4">
                                            <div className="p-3 rounded-full bg-primary/10">
                                                <feature.icon
                                                    className="w-6 h-6 text-primary"
                                                    strokeWidth={1.5}
                                                />
                                            </div>
                                            <CardTitle className="text-lg font-normal uppercase font-body">
                                                {feature.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <p className="text-xs uppercase text-muted-foreground font-body">
                                                {feature.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mobile App Showcase Section */}
                <section className="py-16 bg-gradient-to-r from-background to-background/90">
                    <div className="container px-4 mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center"
                        >
                            <h2 className="mb-4 text-3xl font-normal uppercase md:text-4xl font-body">
                                Glimpses of our Field Sales Management App
                            </h2>
                            <p className="max-w-2xl mx-auto mb-12 text-xs uppercase text-muted-foreground font-body">
                                Empower your field team with powerful tools
                                accessible anywhere, even offline. Manage leads,
                                tasks, claims, and more directly from the mobile
                                app.
                            </p>
                        </motion.div>
                        {/* Swiper Carousel replacing the grid layout */}
                        <div className="flex items-center justify-center px-4 py-8">
                            <Swiper
                                slidesPerView={1}
                                spaceBetween={20}
                                centeredSlides={true}
                                loop={true}
                                autoplay={{
                                    delay: 3500,
                                    disableOnInteraction: false,
                                }}
                                pagination={{
                                    clickable: true,
                                }}
                                breakpoints={{
                                    640: {
                                        slidesPerView: 2,
                                        spaceBetween: 2,
                                    },
                                    768: {
                                        slidesPerView: 3,
                                        spaceBetween: 3,
                                    },
                                    1024: {
                                        slidesPerView: 5,
                                        spaceBetween: 4,
                                    },
                                }}
                                modules={[Pagination, Autoplay, ]}
                                className="flex items-center justify-center w-full px-4 py-8 mySwiper mobile-showcase-swiper"
                            >
                                {mobileFeaturesData.map((item, index) => (
                                    <SwiperSlide
                                        key={index}
                                        className="transition-all duration-300"
                                    >
                                        <div className="relative overflow-hidden rounded-lg shadow-lg aspect-[9/16] p-2 mx-auto max-w-[250px] cursor-pointer transition-all duration-300">
                                            <Image
                                                src={item.img}
                                                alt={item.alt}
                                                fill
                                                className="object-contain"
                                            />
                                            {/* Title Overlay */}
                                            <div className="absolute left-0 w-full h-20 p-2 text-center transition-opacity duration-300 bg-primary -bottom-12">
                                                <span className="text-[10px] text-white uppercase font-body">
                                                    {item.title}
                                                </span>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        {/* Add custom styles for the Swiper carousel to make center item larger */}
                        <style jsx global>{`
                            /* Center slide effect */
                            .mobile-showcase-swiper .swiper-slide {
                                transition: transform 0.3s;
                                opacity: 0.6;
                                transform: scale(0.7);
                            }

                            .mobile-showcase-swiper .swiper-slide-active {
                                opacity: 1;
                                transform: scale(1.1);
                                z-index: 10;
                            }

                            .mobile-showcase-swiper .swiper-slide-prev,
                            .mobile-showcase-swiper .swiper-slide-next {
                                opacity: 0.8;
                                transform: scale(0.9);
                                z-index: 5;
                            }

                            /* Pagination styling */
                            .mobile-showcase-swiper .swiper-pagination-bullet {
                                background: var(--foreground);
                                opacity: 0.5;
                            }

                            .mobile-showcase-swiper
                                .swiper-pagination-bullet-active {
                                background: var(--primary);
                                opacity: 1;
                            }

                            /* Adjust spacing for better visual balance */
                            @media (min-width: 1024px) {
                                .mobile-showcase-swiper {
                                    padding: 2rem 3rem;
                                }
                            }
                        `}</style>
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
                            <Accordion
                                type="single"
                                collapsible
                                className="w-full max-w-4xl"
                            >
                                {faqData.map((faq) => (
                                    <AccordionItem
                                        key={faq.value}
                                        value={faq.value}
                                    >
                                        <AccordionTrigger className="font-normal text-left uppercase font-body">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-xs font-normal text-left font-body">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </motion.div>
                    </div>
                </section>

                {/* Video/Tutorial Section */}
                <section className="py-16 bg-gradient-to-r from-background to-background/90">
                    <div className="container px-4 mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="flex flex-col items-center gap-8 md:flex-row"
                        >
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="mb-4 text-3xl font-normal uppercase md:text-4xl font-body">
                                    See Loro In Action
                                </h2>
                                <p className="max-w-xl mx-auto mb-6 text-xs uppercase md:mx-0 text-muted-foreground font-body">
                                    Watch our quick overview video to understand
                                    how Loro CRM can transform your business
                                    workflows, boost productivity, and provide
                                    unparalleled flexibility for your entire
                                    team.
                                </p>
                                <Button className="text-xs font-normal text-white uppercase transition-colors bg-primary hover:bg-primary/90 font-body">
                                    <PlayCircle className="w-5 h-5 mr-2" />
                                    <span>Watch Demo Video</span>
                                </Button>
                            </div>
                            <div className="relative flex-1 w-full overflow-hidden rounded-lg shadow-xl aspect-video bg-muted group">
                                <Image
                                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rcRWmJ3wUamu61uy3uz2BHS5rxJP3t.png"
                                    alt="Loro CRM Demo Video Thumbnail"
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 bg-black/30 group-hover:bg-black/50">
                                    <PlayCircle className="w-16 h-16 text-white/80" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
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
                                TRY LORO NOW
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
