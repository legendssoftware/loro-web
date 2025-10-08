'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PageTransition } from '@/components/animations/page-transition';
import {  Check, PhoneCall, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { MotionSection } from '@/components/animations/motion-section';
import { StaggerContainer } from '@/components/animations/stagger-container';
import { StaggerItem } from '@/components/animations/stagger-item';
import { FadeIn } from '@/components/animations/fade-in';
import { ScrollToTop } from '@/components/animations/scroll-to-top';
import { SmoothScroll } from '@/components/smooth-scroll';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, FileText, Download, Mail } from 'lucide-react';

// Update the constants for call time management to use environment variables with fallbacks
const CALL_MAX_DURATION_MS =
    parseInt(process.env.NEXT_PUBLIC_MAX_CALL_DURATION_MINUTES || '5', 10) *
    60 *
    1000; // Default: 5 minutes
const WARNING_TIME_REMAINING_MS =
    parseInt(process.env.NEXT_PUBLIC_CALL_WARNING_SECONDS || '60', 10) * 1000; // Default: 60 seconds

// Generate Report Section Component
const GenerateReportSection = () => {
    const [reportType, setReportType] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [specificDate, setSpecificDate] = useState<Date | undefined>(undefined);
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportSubTab, setReportSubTab] = useState('main_dashboard');

    // Report type options based on attendance controller routes
    const reportTypes = [
        { 
            value: 'morning_report', 
            label: 'Morning Attendance Report',
            description: 'Send automated morning attendance report via email',
            requiresUser: false,
            requiresDateRange: false,
            requiresSpecificDate: false,
            endpoint: 'POST /reports/morning/send'
        },
        { 
            value: 'evening_report', 
            label: 'Evening Attendance Report',
            description: 'Send automated evening attendance report via email',
            requiresUser: false,
            requiresDateRange: false,
            requiresSpecificDate: false,
            endpoint: 'POST /reports/evening/send'
        },
        { 
            value: 'organization_report', 
            label: 'Organization Report',
            description: 'Generate comprehensive organization-wide attendance report',
            requiresUser: false,
            requiresDateRange: true,
            requiresSpecificDate: false,
            endpoint: 'GET /report'
        },
        { 
            value: 'user_attendance_request', 
            label: 'User Attendance Report Request',
            description: 'Request attendance report for personal viewing via email',
            requiresUser: true,
            requiresDateRange: true,
            requiresSpecificDate: false,
            endpoint: 'POST /reports/request'
        },
        { 
            value: 'daily_checkins', 
            label: 'Daily Check-ins Report',
            description: 'Get all check-ins for a specific date',
            requiresUser: false,
            requiresDateRange: false,
            requiresSpecificDate: true,
            endpoint: 'GET /checkins/:date'
        },
        { 
            value: 'user_checkins', 
            label: 'User Check-ins Report',
            description: 'Get all check-ins for a specific user',
            requiresUser: true,
            requiresDateRange: false,
            requiresSpecificDate: false,
            endpoint: 'GET /user/:ref'
        },
        { 
            value: 'user_metrics', 
            label: 'User Attendance Metrics',
            description: 'Get detailed attendance metrics for a user with date range',
            requiresUser: true,
            requiresDateRange: true,
            requiresSpecificDate: false,
            endpoint: 'GET /metrics/:ref'
        },
        { 
            value: 'daily_stats', 
            label: 'Daily User Stats',
            description: 'Get daily attendance statistics for a specific user and date',
            requiresUser: true,
            requiresDateRange: false,
            requiresSpecificDate: true,
            endpoint: 'GET /daily-stats/:uid'
        }
    ];

    // Mock users data (in real app, this would come from API)
    const mockUsers = [
        { id: '1', name: 'John Doe', email: 'john.doe@company.com' },
        { id: '2', name: 'Jane Smith', email: 'jane.smith@company.com' },
        { id: '3', name: 'Mike Johnson', email: 'mike.johnson@company.com' },
        { id: '4', name: 'Sarah Wilson', email: 'sarah.wilson@company.com' },
        { id: '5', name: 'David Brown', email: 'david.brown@company.com' },
    ];

    const selectedReportType = reportTypes.find(rt => rt.value === reportType);

    const handleGenerateReport = async () => {
        if (!selectedReportType) {
            showErrorToast('Please select a report type', toast);
            return;
        }

        // Validate required fields
        if (selectedReportType.requiresUser && !selectedUser) {
            showErrorToast('Please select a user', toast);
            return;
        }

        if (selectedReportType.requiresDateRange && (!startDate || !endDate)) {
            showErrorToast('Please select both start and end dates', toast);
            return;
        }

        if (selectedReportType.requiresSpecificDate && !specificDate) {
            showErrorToast('Please select a date', toast);
            return;
        }

        setIsGenerating(true);

        try {
            // Simulate API call (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            showSuccessToast(`${selectedReportType.label} generated successfully! Check your email for the report.`, toast);
            
            // Reset form
            setReportType('');
            setSelectedUser('');
            setStartDate(undefined);
            setEndDate(undefined);
            setSpecificDate(undefined);
        } catch (error) {
            showErrorToast('Failed to generate report. Please try again.', toast);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="flex justify-between items-center mx-auto mb-4 max-w-4xl">
                    <div className="text-left">
                        <h2 className="text-2xl font-bold">Reports Dashboard</h2>
                        <p className="text-muted-foreground">Access comprehensive reports and analytics across different departments · Last updated {new Date().toLocaleTimeString()}</p>
                    </div>
                    <motion.button 
                        className="flex gap-2 items-center px-4 py-2 text-xs text-white rounded-lg transition-colors bg-primary hover:bg-primary/90"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.location.reload()}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </motion.button>
                </div>
            </div>

            {/* Sub-tabs for Reports */}
            <div className="flex justify-center">
                <div className="flex p-1 rounded-lg bg-muted">
                    <button
                        onClick={() => setReportSubTab('main_dashboard')}
                        className={`px-6 py-2 text-xs font-normal uppercase font-body rounded-md transition-colors ${
                            reportSubTab === 'main_dashboard'
                                ? 'bg-white shadow-sm text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Main Dashboard
                    </button>
                    <button
                        onClick={() => setReportSubTab('personal')}
                        className={`px-6 py-2 text-xs font-normal uppercase font-body rounded-md transition-colors ${
                            reportSubTab === 'personal'
                                ? 'bg-white shadow-sm text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Personal
                    </button>
                </div>
            </div>

            {/* Main Dashboard Content */}
            {reportSubTab === 'main_dashboard' && (
                <div>
                    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    {/* Report Type Selection */}
                    <motion.div 
                        className="p-6 rounded-xl border shadow-sm bg-card"
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="space-y-4">
                            <div className="flex gap-2 items-center">
                                <FileText size={20} className="text-primary" />
                                <h3 className="font-semibold">Report Type</h3>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="report-type">Select Report Type</Label>
                                <Select value={reportType} onValueChange={setReportType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a report type..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {reportTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedReportType && (
                                <div className="p-3 rounded-lg bg-muted">
                                    <p className="text-sm text-muted-foreground">{selectedReportType.description}</p>
                                    <p className="mt-1 text-xs text-primary">{selectedReportType.endpoint}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                {/* User Selection - Conditional */}
                {selectedReportType?.requiresUser && (
                    <motion.div 
                        className="p-6 rounded-xl border shadow-sm bg-card"
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.3 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="space-y-4">
                            <div className="flex gap-2 items-center">
                                <Mail size={20} className="text-green-600" />
                                <h3 className="font-semibold">User Selection</h3>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="user-select">Select User</Label>
                                <Select value={selectedUser} onValueChange={setSelectedUser}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a user..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mockUsers.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Date Range Selection - Conditional */}
                {selectedReportType?.requiresDateRange && (
                    <motion.div 
                        className="p-6 rounded-xl border shadow-sm bg-card"
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.3 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="space-y-4">
                            <div className="flex gap-2 items-center">
                                <CalendarIcon size={20} className="text-blue-600" />
                                <h3 className="font-semibold">Date Range</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <div className="flex gap-2 items-center">
                                        <Input 
                                            type="date"
                                            value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                                            onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : undefined)}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <div className="flex gap-2 items-center">
                                        <Input 
                                            type="date"
                                            value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                                            onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : undefined)}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Specific Date Selection - Conditional */}
                {selectedReportType?.requiresSpecificDate && (
                    <motion.div 
                        className="p-6 rounded-xl border shadow-sm bg-card"
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.3 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="space-y-4">
                            <div className="flex gap-2 items-center">
                                <CalendarIcon size={20} className="text-orange-600" />
                                <h3 className="font-semibold">Select Date</h3>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Report Date</Label>
                                <Input 
                                    type="date"
                                    value={specificDate ? format(specificDate, 'yyyy-MM-dd') : ''}
                                    onChange={(e) => setSpecificDate(e.target.value ? new Date(e.target.value) : undefined)}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
                </div>

                {/* Generate Button */}
                {selectedReportType && (
                    <motion.div 
                        className="flex justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Button 
                            onClick={handleGenerateReport}
                            disabled={isGenerating}
                            size="lg"
                            className="gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <motion.div
                                        className="w-4 h-4 rounded-full border-2 border-white border-t-transparent"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Download size={20} />
                                    Generate {selectedReportType.label}
                                </>
                            )}
                        </Button>
                    </motion.div>
                )}

                {/* Help Section */}
                <motion.div 
                    className="p-6 rounded-xl border shadow-sm bg-muted/50"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                >
                    <h3 className="flex gap-2 items-center mb-4 font-semibold">
                        <FileText size={20} className="text-primary" />
                        Report Types Guide
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <h4 className="text-sm font-medium">Automated Reports</h4>
                            <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                                <li>• Morning & Evening reports are sent automatically</li>
                                <li>• Organization reports provide comprehensive insights</li>
                                <li>• User attendance requests are emailed directly</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium">Data Reports</h4>
                            <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                                <li>• Daily check-ins show all activity for a date</li>
                                <li>• User metrics provide detailed analytics</li>
                                <li>• Daily stats show individual performance</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
                </div>
            )}

            {/* Personal Dashboard Content */}
            {reportSubTab === 'personal' && (
                <div className="py-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                    >
                        <div className="p-8 mx-auto max-w-2xl rounded-xl border shadow-sm bg-card">
                            <div className="flex gap-2 justify-center items-center mb-4">
                                <FileText size={24} className="text-primary" />
                                <h3 className="text-xl font-semibold">Personal Reports</h3>
                            </div>
                            
                            <p className="mb-6 text-muted-foreground">
                                Access your personal attendance analytics, performance metrics, and individual reports.
                            </p>
                            
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="p-4 rounded-lg bg-muted/50">
                                    <h4 className="mb-2 text-sm font-medium">📊 Your Analytics</h4>
                                    <ul className="space-y-1 text-xs text-muted-foreground">
                                        <li>• Personal attendance history</li>
                                        <li>• Performance metrics</li>
                                        <li>• Productivity insights</li>
                                    </ul>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/50">
                                    <h4 className="mb-2 text-sm font-medium">📋 Individual Reports</h4>
                                    <ul className="space-y-1 text-xs text-muted-foreground">
                                        <li>• Weekly summaries</li>
                                        <li>• Monthly performance</li>
                                        <li>• Goal tracking</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="p-4 mt-6 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-800">
                                    <strong>Coming Soon:</strong> Personal dashboard features will be available in the next update. 
                                    For now, use the Main Dashboard to generate all available reports.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {reportSubTab === 'generate_report' && (
                <div>
                    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    </div>
                </div>
            )}
        </div>
    );
};

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

    // Dashboard tab state
    const [activeTab, setActiveTab] = useState('generate_report');

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
                    <header className="sticky top-0 z-50 border-b backdrop-blur-sm bg-background/80">
                        <div className="container flex justify-between items-center px-4 mx-auto h-16">
                            <div className="flex gap-2 items-center">
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
                            <nav className="hidden gap-6 items-center md:flex">
                                <motion.div
                                    className="flex gap-6 items-center"
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
                                            className="text-xs font-normal text-amber-500 uppercase transition-colors cursor-pointer font-body hover:bg-amber-100 dark:hover:bg-amber-900/20"
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
                                className="hidden gap-4 items-center md:flex"
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
                            <div className="flex gap-2 items-center md:hidden">
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
                                                <div className="flex justify-between items-center p-4 border-b bg-background/80">
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
                                                        className="p-3 text-sm font-normal uppercase rounded-lg transition-colors font-body hover:bg-muted hover:text-primary"
                                                    >
                                                        Features
                                                    </Link>
                                                    <Link
                                                        href="#benefits"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        className="p-3 text-sm font-normal uppercase rounded-lg transition-colors font-body hover:bg-muted hover:text-primary"
                                                    >
                                                        Benefits
                                                    </Link>
                                                    <Link
                                                        href="#pricing"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        className="p-3 text-sm font-normal uppercase rounded-lg transition-colors font-body hover:bg-muted hover:text-primary"
                                                    >
                                                        Pricing
                                                    </Link>
                                                    <Link
                                                        href="#testimonials"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        className="p-3 text-sm font-normal uppercase rounded-lg transition-colors font-body hover:bg-muted hover:text-primary"
                                                    >
                                                        Testimonials
                                                    </Link>
                                                    <Link
                                                        href="#faq"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        className="p-3 text-sm font-normal uppercase rounded-lg transition-colors font-body hover:bg-muted hover:text-primary"
                                                    >
                                                        FAQ
                                                    </Link>

                                                    <div className="pt-4 space-y-2 border-t">
                                                        <Link
                                                            href="/sign-in"
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                            className="block p-3 text-sm font-normal uppercase rounded-lg transition-colors font-body hover:bg-muted hover:text-primary"
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
                                                                className="w-full text-xs font-normal text-amber-500 uppercase font-body hover:bg-amber-100 dark:hover:bg-amber-900/20"
                                                            >
                                                                <PhoneCall className="mr-2 w-4 h-4" />
                                                                <span>RETRY CALL</span>
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                onClick={startDemoCall}
                                                                disabled={isCallInitializing}
                                                                className="w-full text-xs font-normal uppercase font-body"
                                                            >
                                                                <PhoneCall className="mr-2 w-4 h-4" />
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
                            <div className="flex flex-col gap-2 justify-center items-center w-full text-center">
                                <StaggerContainer
                                    className="flex flex-col justify-center items-center space-y-4"
                                    staggerChildren={0.2}
                                >
                                        <StaggerItem
                                        className="space-y-3"
                                        direction="right"
                                    >
                                        <div className="flex justify-center items-center w-full">
                                            <Image src='/images/covers/hero.png' height={800} width={800} alt='Loro Dashboard'/>
                                        </div>
                                    </StaggerItem>
                                </StaggerContainer>
                                <StaggerContainer
                                    className="flex flex-col gap-3 items-center justify-center lg:gap-4 -mt-5 max-h-[600px] lg:max-h-none overflow-hidden w-full"
                                    delay={0.3}
                                    staggerChildren={0.15}
                                >
                                    <StaggerItem className="flex flex-col items-center space-y-2 w-full">
                                        <div className="overflow-hidden relative p-1 w-full h-32 sm:h-40 md:h-48">
                                            <AnimatePresence mode="wait">
                                                <motion.h1
                                                    key={currentPhraseIndex}
                                                    initial={{ y: 50, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    exit={{ y: -50, opacity: 0 }}
                                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                                    className="flex absolute inset-0 justify-center items-center text-2xl font-normal tracking-tighter text-center uppercase sm:text-3xl md:text-5xl xl:text-6xl/none font-body"
                                                >
                                                    {heroPhrases[currentPhraseIndex]}
                                                </motion.h1>
                                            </AnimatePresence>
                                        </div>
                                        <p className="max-w-[600px] text-xs uppercase text-muted-foreground font-body md:text-xs text-center mx-auto">
                                            Stop juggling multiple systems. Loro combines CRM, field service management, inventory tracking, quotation system, task management, and real-time analytics in one powerful platform.
                                        </p>
                                    </StaggerItem>
                                    <StaggerItem className="flex flex-col gap-2 min-[400px]:flex-row justify-center items-center">
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
                            </div>
                        </div>
                    </MotionSection>

                    {/* Video Player Section */}
                    <MotionSection className="py-12 md:py-16" direction="up">
                        <div className="container px-4 mx-auto md:px-6">
                            <div className="mx-auto max-w-4xl text-center">
                                <motion.h2
                                    className="mb-8 text-2xl font-normal tracking-tighter uppercase sm:text-3xl md:text-4xl font-body"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8 }}
                                    viewport={{ once: true }}
                                >
                                    DISCOVER LORO
                                </motion.h2>
                                <motion.div
                                    className="relative mx-auto max-w-5xl"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    viewport={{ once: true }}
                                >
                                    <div className="overflow-hidden relative rounded-lg border aspect-video bg-muted/50 border-border">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                                        <div className="flex absolute inset-0 justify-center items-center">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <motion.div
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="inline-block"
                                                    >
                                                        <button
                                                            className="flex justify-center items-center w-20 h-20 rounded-full shadow-lg transition-all duration-300 cursor-pointer bg-white/90 hover:bg-white hover:shadow-xl group"
                                                            type="button"
                                                            aria-label="Play video"
                                                        >
                                                            <div className="w-0 h-0 border-l-[12px] border-l-red-500 border-y-[8px] border-y-transparent ml-1" />
                                                        </button>
                                                    </motion.div>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-[90vw] max-h-[90vh] w-full h-full sm:max-w-[80vw] sm:max-h-[80vh] p-0">
                                                    <div className="relative w-full h-full">
                                                        <div className="overflow-hidden w-full h-full bg-black rounded-lg aspect-video">
                                                            <iframe
                                                                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1"
                                                                title="Discover Loro - Complete Business Management Platform"
                                                                className="w-full h-full"
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                                allowFullScreen
                                                            />
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent from-black/30" />
                                        <div className="absolute right-4 bottom-4 left-4 text-white">
                                            <p className="text-xs uppercase text-white/80 font-body">
                                                Watch how Loro transforms your business operations
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </MotionSection>

                    {/* Dashboard Section */}
                    <MotionSection className="py-16 md:py-24 bg-muted/30" direction="up">
                        <div className="container px-4 mx-auto md:px-6">
                            <StaggerContainer
                                className="mb-12 text-center"
                                staggerChildren={0.2}
                            >
                                <StaggerItem>
                                    <h2 className="text-3xl font-normal tracking-tighter uppercase sm:text-4xl md:text-5xl font-body">
                                        Dashboard Overview
                                    </h2>
                                </StaggerItem>
                                <StaggerItem>
                                    <p className="mt-4 text-xs uppercase text-muted-foreground font-body md:text-xs">
                                        Access comprehensive reports and analytics across different departments
                                    </p>
                                </StaggerItem>
                            </StaggerContainer>

                            <div className="mx-auto max-w-7xl">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <div className="overflow-hidden mb-8">
                                        <TabsList className="flex flex-wrap gap-1 justify-center p-1 w-full h-auto rounded-lg bg-muted">
                                            <TabsTrigger 
                                                value="personal" 
                                                className="flex-1 px-4 py-2 text-xs font-normal uppercase whitespace-nowrap rounded-md font-body min-w-fit"
                                            >
                                                Personal
                                            </TabsTrigger>
                                            <TabsTrigger 
                                                value="attendance" 
                                                className="flex-1 px-4 py-2 text-xs font-normal uppercase whitespace-nowrap rounded-md font-body min-w-fit"
                                            >
                                                Attendance
                                            </TabsTrigger>
                                            <TabsTrigger 
                                                value="sales" 
                                                className="flex-1 px-4 py-2 text-xs font-normal uppercase whitespace-nowrap rounded-md font-body min-w-fit"
                                            >
                                                Sales
                                            </TabsTrigger>
                                            <TabsTrigger 
                                                value="activities" 
                                                className="flex-1 px-4 py-2 text-xs font-normal uppercase whitespace-nowrap rounded-md font-body min-w-fit"
                                            >
                                                Activities
                                            </TabsTrigger>
                                            <TabsTrigger 
                                                value="generate_report" 
                                                className="flex-1 px-4 py-2 text-xs font-normal uppercase whitespace-nowrap rounded-md border font-body min-w-fit bg-primary/10 border-primary/20"
                                            >
                                                📊 Reports
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>

                                    {/* Personal Dashboard */}
                                    <TabsContent value="personal" className="space-y-6">
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                            <motion.div 
                                                className="p-6 rounded-xl border shadow-sm bg-card"
                                                whileHover={{ y: -5 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs font-normal uppercase text-muted-foreground font-body">My Tasks</p>
                                                        <p className="text-2xl font-normal font-body">12</p>
                                                        <p className="text-xs text-green-600 font-body">3 completed today</p>
                                                    </div>
                                                    <div className="p-3 bg-blue-100 rounded-lg">
                                                        <span className="text-xl">✅</span>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            <motion.div 
                                                className="p-6 rounded-xl border shadow-sm bg-card"
                                                whileHover={{ y: -5 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs font-normal uppercase text-muted-foreground font-body">My Leads</p>
                                                        <p className="text-2xl font-normal font-body">8</p>
                                                        <p className="text-xs text-blue-600 font-body">2 hot prospects</p>
                                                    </div>
                                                    <div className="p-3 bg-green-100 rounded-lg">
                                                        <span className="text-xl">🎯</span>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            <motion.div 
                                                className="p-6 rounded-xl border shadow-sm bg-card"
                                                whileHover={{ y: -5 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs font-normal uppercase text-muted-foreground font-body">Hours Today</p>
                                                        <p className="text-2xl font-normal font-body">7.5h</p>
                                                        <p className="text-xs text-green-600 font-body">0.5h overtime</p>
                                                    </div>
                                                    <div className="p-3 bg-purple-100 rounded-lg">
                                                        <span className="text-xl">⏰</span>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            <motion.div 
                                                className="p-6 rounded-xl border shadow-sm bg-card"
                                                whileHover={{ y: -5 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs font-normal uppercase text-muted-foreground font-body">Commission</p>
                                                        <p className="text-2xl font-normal font-body">R2,450</p>
                                                        <p className="text-xs text-green-600 font-body">+15% this month</p>
                                                    </div>
                                                    <div className="p-3 bg-yellow-100 rounded-lg">
                                                        <span className="text-xl">💰</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </TabsContent>

                                    {/* Attendance Dashboard */}
                                    <TabsContent value="attendance" className="space-y-6">
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                            <motion.div 
                                                className="p-6 rounded-xl border shadow-sm bg-card"
                                                whileHover={{ y: -5 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs font-normal uppercase text-muted-foreground font-body">Total Employees</p>
                                                        <p className="text-2xl font-normal font-body">0</p>
                                                        <p className="text-xs text-muted-foreground font-body">12 active today</p>
                                                    </div>
                                                    <div className="p-3 bg-blue-100 rounded-lg">
                                                        <span className="text-xl">👥</span>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            <motion.div 
                                                className="p-6 rounded-xl border shadow-sm bg-card"
                                                whileHover={{ y: -5 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs font-normal uppercase text-muted-foreground font-body">Active Today</p>
                                                        <p className="text-2xl font-normal font-body">12</p>
                                                        <p className="text-xs text-green-600 font-body">100% attendance rate</p>
                                                    </div>
                                                    <div className="p-3 bg-green-100 rounded-lg">
                                                        <span className="text-xl">✅</span>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            <motion.div 
                                                className="p-6 rounded-xl border shadow-sm bg-card"
                                                whileHover={{ y: -5 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs font-normal uppercase text-muted-foreground font-body">Total Work Hours</p>
                                                        <p className="text-2xl font-normal font-body">2.8h</p>
                                                        <p className="text-xs text-blue-600 font-body">0.2h avg per person</p>
                                                    </div>
                                                    <div className="p-3 bg-purple-100 rounded-lg">
                                                        <span className="text-xl">⏱️</span>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            <motion.div 
                                                className="p-6 rounded-xl border shadow-sm bg-card"
                                                whileHover={{ y: -5 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs font-normal uppercase text-muted-foreground font-body">Punctuality Rate</p>
                                                        <p className="text-2xl font-normal font-body">63.0%</p>
                                                        <p className="text-xs text-green-600 font-body">On-time arrivals today</p>
                                                    </div>
                                                    <div className="p-3 bg-orange-100 rounded-lg">
                                                        <span className="text-xl">🎯</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </TabsContent>

                                    {/* Sales Dashboard */}
                                    <TabsContent value="sales" className="space-y-6">
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                            <motion.div 
                                                className="p-6 rounded-xl border shadow-sm bg-card"
                                                whileHover={{ y: -5 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs font-normal uppercase text-muted-foreground font-body">Monthly Revenue</p>
                                                        <p className="text-2xl font-normal font-body">R45,230</p>
                                                        <p className="text-xs text-green-600 font-body">+23% from last month</p>
                                                    </div>
                                                    <div className="p-3 bg-green-100 rounded-lg">
                                                        <span className="text-xl">💰</span>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            <motion.div 
                                                className="p-6 rounded-xl border shadow-sm bg-card"
                                                whileHover={{ y: -5 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs font-normal uppercase text-muted-foreground font-body">New Leads</p>
                                                        <p className="text-2xl font-normal font-body">28</p>
                                                        <p className="text-xs text-blue-600 font-body">5 converted this week</p>
                                                    </div>
                                                    <div className="p-3 bg-blue-100 rounded-lg">
                                                        <span className="text-xl">🎯</span>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            <motion.div 
                                                className="p-6 rounded-xl border shadow-sm bg-card"
                                                whileHover={{ y: -5 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs font-normal uppercase text-muted-foreground font-body">Conversion Rate</p>
                                                        <p className="text-2xl font-normal font-body">32%</p>
                                                        <p className="text-xs text-green-600 font-body">Above target (25%)</p>
                                                    </div>
                                                    <div className="p-3 bg-purple-100 rounded-lg">
                                                        <span className="text-xl">📊</span>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            <motion.div 
                                                className="p-6 rounded-xl border shadow-sm bg-card"
                                                whileHover={{ y: -5 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs font-normal uppercase text-muted-foreground font-body">Active Deals</p>
                                                        <p className="text-2xl font-normal font-body">15</p>
                                                        <p className="text-xs text-orange-600 font-body">R125k pipeline value</p>
                                                    </div>
                                                    <div className="p-3 bg-yellow-100 rounded-lg">
                                                        <span className="text-xl">🤝</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </TabsContent>

                                    {/* Activities Dashboard */}
                                    <TabsContent value="activities" className="space-y-6">
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                            <motion.div 
                                                className="p-6 rounded-xl border shadow-sm bg-card"
                                                whileHover={{ y: -5 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs font-normal uppercase text-muted-foreground font-body">Total Tasks</p>
                                                        <p className="text-2xl font-normal font-body">47</p>
                                                        <p className="text-xs text-green-600 font-body">12 completed today</p>
                                                    </div>
                                                    <div className="p-3 bg-blue-100 rounded-lg">
                                                        <span className="text-xl">📋</span>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            <motion.div 
                                                className="p-6 rounded-xl border shadow-sm bg-card"
                                                whileHover={{ y: -5 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs font-normal uppercase text-muted-foreground font-body">Client Meetings</p>
                                                        <p className="text-2xl font-normal font-body">8</p>
                                                        <p className="text-xs text-blue-600 font-body">3 scheduled today</p>
                                                    </div>
                                                    <div className="p-3 bg-green-100 rounded-lg">
                                                        <span className="text-xl">👥</span>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            <motion.div 
                                                className="p-6 rounded-xl border shadow-sm bg-card"
                                                whileHover={{ y: -5 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs font-normal uppercase text-muted-foreground font-body">Follow-ups</p>
                                                        <p className="text-2xl font-normal font-body">23</p>
                                                        <p className="text-xs text-orange-600 font-body">6 overdue</p>
                                                    </div>
                                                    <div className="p-3 bg-orange-100 rounded-lg">
                                                        <span className="text-xl">📞</span>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            <motion.div 
                                                className="p-6 rounded-xl border shadow-sm bg-card"
                                                whileHover={{ y: -5 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs font-normal uppercase text-muted-foreground font-body">Productivity Score</p>
                                                        <p className="text-2xl font-normal font-body">87%</p>
                                                        <p className="text-xs text-green-600 font-body">Above team average</p>
                                                    </div>
                                                    <div className="p-3 bg-purple-100 rounded-lg">
                                                        <span className="text-xl">⭐</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </TabsContent>

                                    {/* Generate Report Dashboard */}
                                    <TabsContent value="generate_report" className="space-y-6">
                                        <GenerateReportSection />
                                    </TabsContent>
                                </Tabs>
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
                                    <p className="mx-auto mt-4 max-w-3xl text-xs uppercase text-muted-foreground font-body md:text-xs">
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
                                        className="p-6 h-full rounded-xl border shadow-sm bg-card border-border group"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 text-blue-600 bg-blue-100 rounded-full transition-transform duration-300 group-hover:scale-110">
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
                                                <div className="mr-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                                                Automated lead assignment
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="mr-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                                                Lead scoring & qualification
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="mr-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                                                Follow-up reminders
                                            </div>
                                        </div>
                                    </motion.div>
                                </StaggerItem>

                                <StaggerItem direction="up">
                                    <motion.div
                                        className="p-6 h-full rounded-xl border shadow-sm bg-card border-border group"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 text-green-600 bg-green-100 rounded-full transition-transform duration-300 group-hover:scale-110">
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
                                                <div className="mr-2 w-2 h-2 bg-green-500 rounded-full"></div>
                                                Visual pipeline management
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="mr-2 w-2 h-2 bg-green-500 rounded-full"></div>
                                                Revenue forecasting
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="mr-2 w-2 h-2 bg-green-500 rounded-full"></div>
                                                Deal probability tracking
                                            </div>
                                        </div>
                                    </motion.div>
                                </StaggerItem>

                                <StaggerItem direction="up">
                                    <motion.div
                                        className="p-6 h-full rounded-xl border shadow-sm bg-card border-border group"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 text-purple-600 bg-purple-100 rounded-full transition-transform duration-300 group-hover:scale-110">
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
                                                <div className="mr-2 w-2 h-2 bg-purple-500 rounded-full"></div>
                                                Smart task assignment
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="mr-2 w-2 h-2 bg-purple-500 rounded-full"></div>
                                                Priority & deadline tracking
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="mr-2 w-2 h-2 bg-purple-500 rounded-full"></div>
                                                Team collaboration tools
                                            </div>
                                        </div>
                                    </motion.div>
                                </StaggerItem>

                                <StaggerItem direction="up">
                                    <motion.div
                                        className="p-6 h-full rounded-xl border shadow-sm bg-card border-border group"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 text-orange-600 bg-orange-100 rounded-full transition-transform duration-300 group-hover:scale-110">
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
                                                <div className="mr-2 w-2 h-2 bg-orange-500 rounded-full"></div>
                                                Custom workflow builder
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="mr-2 w-2 h-2 bg-orange-500 rounded-full"></div>
                                                Trigger-based automation
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="mr-2 w-2 h-2 bg-orange-500 rounded-full"></div>
                                                Email & SMS automation
                                            </div>
                                        </div>
                                    </motion.div>
                                </StaggerItem>

                                <StaggerItem direction="up">
                                    <motion.div
                                        className="p-6 h-full rounded-xl border shadow-sm bg-card border-border group"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 text-indigo-600 bg-indigo-100 rounded-full transition-transform duration-300 group-hover:scale-110">
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
                                                <div className="mr-2 w-2 h-2 bg-indigo-500 rounded-full"></div>
                                                Custom dashboards
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="mr-2 w-2 h-2 bg-indigo-500 rounded-full"></div>
                                                Automated reporting
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="mr-2 w-2 h-2 bg-indigo-500 rounded-full"></div>
                                                Performance insights
                                            </div>
                                        </div>
                                    </motion.div>
                                </StaggerItem>

                                <StaggerItem direction="up">
                                    <motion.div
                                        className="p-6 h-full rounded-xl border shadow-sm bg-card border-border group"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 text-teal-600 bg-teal-100 rounded-full transition-transform duration-300 group-hover:scale-110">
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
                                                <div className="mr-2 w-2 h-2 bg-teal-500 rounded-full"></div>
                                                Offline functionality
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="mr-2 w-2 h-2 bg-teal-500 rounded-full"></div>
                                                Real-time GPS tracking
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="mr-2 w-2 h-2 bg-teal-500 rounded-full"></div>
                                                Native mobile apps
                                            </div>
                                        </div>
                                    </motion.div>
                                </StaggerItem>

                                <StaggerItem direction="up">
                                    <motion.div
                                        className="p-6 h-full rounded-xl border shadow-sm bg-card border-border group"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 text-rose-600 bg-rose-100 rounded-full transition-transform duration-300 group-hover:scale-110">
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
                                                <div className="mr-2 w-2 h-2 bg-rose-500 rounded-full"></div>
                                                Automated pricing
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="mr-2 w-2 h-2 bg-rose-500 rounded-full"></div>
                                                Custom templates
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="mr-2 w-2 h-2 bg-rose-500 rounded-full"></div>
                                                E-signature integration
                                            </div>
                                        </div>
                                    </motion.div>
                                </StaggerItem>

                                <StaggerItem direction="up">
                                    <motion.div
                                        className="p-6 h-full rounded-xl border shadow-sm bg-card border-border group"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 text-amber-600 bg-amber-100 rounded-full transition-transform duration-300 group-hover:scale-110">
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
                                                <div className="mr-2 w-2 h-2 bg-amber-500 rounded-full"></div>
                                                Real-time stock tracking
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="mr-2 w-2 h-2 bg-amber-500 rounded-full"></div>
                                                Automated reordering
                                            </div>
                                            <div className="flex items-center text-[10px] font-normal uppercase font-body">
                                                <div className="mr-2 w-2 h-2 bg-amber-500 rounded-full"></div>
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
                                        className="p-6 h-full rounded-xl border shadow-sm bg-card border-border"
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
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-muted-foreground font-body uppercase text-[10px]">Admin overhead</span>
                                                <span className="font-medium text-green-600 font-body uppercase text-[9px]">35% ↓</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-muted-foreground font-body uppercase text-[10px]">Fuel expenses</span>
                                                <span className="font-medium text-green-600 font-body uppercase text-[9px]">25% ↓</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
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
                                        className="p-6 h-full rounded-xl border shadow-sm bg-card border-border"
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
                                            <div className="flex justify-between items-center text-xs">
                                                 <span className="text-muted-foreground font-body uppercase text-[10px]">Lead conversion</span>
                                                <span className="font-medium text-blue-600 font-body uppercase text-[9px]">45% ↑</span>
                                                </div>
                                            <div className="flex justify-between items-center text-xs">
                                                 <span className="text-muted-foreground font-body uppercase text-[10px]">Quote speed</span>
                                                <span className="font-medium text-blue-600 font-body uppercase text-[9px]">3x faster</span>
                                        </div>
                                            <div className="flex justify-between items-center text-xs">
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
                                        className="p-6 h-full rounded-xl border shadow-sm bg-card border-border"
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
                                            <div className="flex justify-between items-center text-xs">
                                                 <span className="text-muted-foreground font-body uppercase text-[10px]">Travel time</span>
                                                <span className="font-medium text-purple-600 font-body uppercase text-[9px]">40% ↓</span>
                                        </div>
                                            <div className="flex justify-between items-center text-xs">
                                                 <span className="text-muted-foreground font-body uppercase text-[10px]">Quote generation</span>
                                              <span className="font-medium text-purple-600 font-body uppercase text-[9px]">60% faster</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
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
                                        className="p-6 h-full rounded-xl border shadow-sm bg-card border-border"
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
                                            <div className="flex justify-between items-center text-xs">
                                                 <span className="text-muted-foreground font-body uppercase text-[10px]">On-time delivery</span>
                                                <span className="font-medium text-orange-600 font-body uppercase text-[9px]">95%+</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                 <span className="text-muted-foreground font-body uppercase text-[10px]">Response time</span>
                                                <span className="font-medium text-orange-600 font-body uppercase text-[9px]">&lt;2 hours</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
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
                            <div className="grid gap-8 items-center md:grid-cols-2">
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
                                        <div className="flex gap-4 items-start">
                                            <motion.div
                                                className="flex justify-center items-center w-10 h-10 rounded-full bg-primary/10 shrink-0"
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
                                        <div className="flex gap-4 items-start">
                                            <motion.div
                                                className="flex justify-center items-center w-10 h-10 rounded-full bg-primary/10 shrink-0"
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
                                        <div className="flex gap-4 items-start">
                                            <motion.div
                                                className="flex justify-center items-center w-10 h-10 rounded-full bg-primary/10 shrink-0"
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
                                <div className="grid gap-8 items-center md:grid-cols-2">
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
                                            <div className="flex gap-4 items-start">
                                    <motion.div
                                                    className="flex justify-center items-center w-10 h-10 rounded-full bg-primary/10 shrink-0"
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
                                            <div className="flex gap-4 items-start">
                                    <motion.div
                                                    className="flex justify-center items-center w-10 h-10 rounded-full bg-primary/10 shrink-0"
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
                                            <div className="flex gap-4 items-start">
                                        <motion.div
                                                    className="flex justify-center items-center w-10 h-10 rounded-full bg-primary/10 shrink-0"
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
                                            className="p-6 h-full rounded-xl shadow-sm bg-card"
                                            whileHover={{
                                                y: -10,
                                                boxShadow:
                                                    '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="flex gap-4 items-center mb-4">
                                                <motion.div
                                                    className="flex justify-center items-center w-12 h-12 text-xl font-normal uppercase rounded-full font-body bg-primary/10 text-primary"
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
                                            className="overflow-hidden h-full rounded-xl shadow-sm bg-background"
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
                                                    className="flex absolute top-4 left-4 justify-center items-center w-16 h-16 rounded-xl backdrop-blur-sm bg-white/20"
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
                                                    <div className="flex gap-3 items-center mb-4">
                                                        <div className="w-8 h-8 rounded-full bg-primary/20"></div>
                                                        <div className="flex-1">
                                                            <div className="mb-1 w-full h-3 rounded bg-primary/10"></div>
                                                            <div className="w-2/3 h-2 rounded bg-primary/5"></div>
                                                        </div>
                                                    </div>
                                                    <div className="mb-4 space-y-2">
                                                        <div className="w-full h-2 rounded bg-primary/10"></div>
                                                        <div className="w-4/5 h-2 rounded bg-primary/10"></div>
                                                        <div className="w-3/4 h-2 rounded bg-primary/10"></div>
                                                    </div>
                                                    <div className="flex justify-between items-center">
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
                                                <div className="flex gap-3 items-center mb-3">
                                                    <motion.div
                                                        className="flex justify-center items-center w-10 h-10 rounded-lg bg-primary/10"
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
                                                            <div className="mr-2 w-1 h-1 rounded-full bg-primary"></div>
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
                                        className="p-6 h-full rounded-xl border shadow-sm bg-card border-border"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-6">
                                            <motion.div
                                                className="flex justify-center items-center mb-4 w-12 h-12 rounded-xl bg-primary/10"
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
                                        className="relative p-6 h-full rounded-xl border-2 shadow-lg bg-card border-primary"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <motion.div
                                            className="absolute -top-4 left-1/2 px-4 py-1 text-xs font-normal uppercase rounded-full transform -translate-x-1/2 bg-primary text-primary-foreground font-body"
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
                                                className="flex justify-center items-center mb-4 w-12 h-12 rounded-xl bg-primary/10"
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
                                        className="p-6 h-full rounded-xl border shadow-sm bg-card border-border"
                                        whileHover={{
                                            y: -10,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-6">
                                            <motion.div
                                                className="flex justify-center items-center mb-4 w-12 h-12 rounded-xl bg-primary/10"
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
                        <div className="mx-auto space-y-12 max-w-4xl">
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
                                                <div className="flex gap-4 items-start">
                                                    <motion.div
                                                        className="flex justify-center items-center mt-1 w-12 h-12 rounded-xl bg-primary/10 shrink-0"
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
                                                <div className="flex gap-4 items-start">
                                                    <motion.div
                                                        className="flex justify-center items-center mt-1 w-12 h-12 rounded-xl bg-primary/10 shrink-0"
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
                                        <div className="flex gap-4 items-start">
                                            <motion.div
                                                className="flex justify-center items-center mt-1 w-12 h-12 rounded-xl bg-primary/10 shrink-0"
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
                                <p className="mx-auto mt-4 max-w-2xl text-xs text-white uppercase font-body">
                                    Level up your networking with our premium
                                    membership. Get access to exclusive
                                    templates, advanced analytics, and
                                    networking events.
                                </p>
                            </StaggerItem>
                        </StaggerContainer>
                        <motion.div
                            className="mx-auto max-w-md"
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
                                    <div className="flex gap-2 items-center mb-4">
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

