'use client';

import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { SideDrawer } from './side-drawer';
import { shouldHideNav, shouldShowNav, isLandingPage, isDashboardPage } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/use-app-store';
import { useInteractiveTour } from '@/hooks/use-interactive-tour';
import {
    LayoutDashboardIcon,
    Power,
    PhoneCall,
    HelpCircle,
    PlayCircle,
} from 'lucide-react';
import { ThemeToggler } from '@/modules/navigation/theme.toggler';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useHelp } from '@/hooks/use-help';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useState, useMemo } from 'react';

export function TopNav() {
    const pathname = usePathname();
    const { signOut, profileData, accessToken, isAuthenticated, isLoading } =
        useAuthStore();
    const { isDrawerOpen, setDrawerOpen } =
        useAppStore();
    const [helpDropdownOpen, setHelpDropdownOpen] = useState(false);
    const { startTour } = useInteractiveTour();

    // Always call the hook, regardless of authentication status
    const {
        startCall: originalStartCall,
        endCall,
        isCallActive,
        isCallInitializing,
        retryLastCall,
        lastError,
        formattedTimeRemaining,
    } = useHelp({
        onError: (error) => {
            // You can add additional error handling behavior here
            // This will be called in addition to the default error handling
            // For example, you could log errors to an analytics service
            if (process.env.NODE_ENV === 'development') {
                console.error('TopNav - Voice assistant error:', error);
            }
        },
    });

    // Wrap startCall to only work when authenticated
    const startCall = () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to use the voice assistant', {
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
                icon: '❌',
            });
            return;
        }

        originalStartCall();
        setHelpDropdownOpen(false);
    };

    const handleStartTour = () => {
        startTour();
        setHelpDropdownOpen(false);
    };

    // Check if navigation should be hidden on this route
    const hideNav = shouldHideNav(pathname);

    // Check if this is the landing page
    const isLanding = isLandingPage(pathname);

    // Check if this is the dashboard page
    const isDashboard = isDashboardPage(pathname);

    // Only show nav on dashboard and other authenticated routes
    if (hideNav && !isDashboard) {
        return null;
    }

    // Show loading state while auth is initializing
    if (isLoading && isDashboard) {
        return (
            <div className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-transparent mb-5">
                <div className="flex justify-between items-center px-2 h-16">
                    <div className="flex gap-2 justify-between items-center w-full md:w-auto">
                        <span className="text-sm font-normal uppercase font-body text-foreground">
                            Loading navigation...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Check if user is a client by examining profileData or JWT token
    const isClient =
        profileData?.accessLevel === 'client' ||
        (() => {
            if (accessToken) {
                try {
                    const base64Url = accessToken.split('.')[1];
                    const base64 = base64Url
                        .replace(/-/g, '+')
                        .replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(
                        atob(base64)
                            .split('')
                            .map(
                                (c) =>
                                    '%' +
                                    ('00' + c.charCodeAt(0).toString(16)).slice(
                                        -2,
                                    ),
                            )
                            .join(''),
                    );
                    const payload = JSON.parse(jsonPayload);
                    return payload.role === 'client';
                } catch (e) {
                    return false;
                }
            }
            return false;
        })();

    // Get user initials for avatar display (dynamic for both clients and users)
    const userInitials = useMemo(() => {
        if (isClient) {
            // For clients, use the client name
            if (profileData?.name) {
                const nameParts = profileData.name.split(' ');
                if (nameParts.length >= 2) {
                    return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
                }
                return profileData.name.charAt(0).toUpperCase();
            }
            return 'C';
        } else {
            // For users, use name and surname
            if (profileData?.name && profileData?.surname) {
                return `${profileData.name.charAt(0)}${profileData.surname.charAt(0)}`.toUpperCase();
            }
            return 'U';
        }
    }, [profileData, isClient]);

    const handleSignOut = async () => {
        try {
            signOut();

            const toastId = toast.success(`Cheers ${profileData?.name} `, {
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
                icon: '👋',
            });

            await new Promise((resolve) => setTimeout(resolve, 2000));
            toast.remove(toastId);

            window.location.href = '/';
        } catch {
            toast.error('Failed to sign out', {
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
                icon: '❌',
            });
        }
    };

    return (
        <>
            <div className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-transparent mb-5">
                <div className="flex justify-between items-center px-2 h-16">
                    <div className="flex gap-2 justify-between items-center w-full md:w-auto">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer"
                            onClick={() => setDrawerOpen(true)}
                        >
                            <LayoutDashboardIcon
                                strokeWidth={1.5}
                                size={23}
                                id="tour-step-side-drawer-trigger"
                            />
                        </Button>
                        <div
                            className="flex gap-3 items-center"
                            id="tour-step-report-toggle"
                        >
                            {isClient ? (
                                <span className="px-2 py-1 text-xs font-thin uppercase rounded-md text-primary font-body bg-primary/10">
                                    {profileData?.name || 'Client Portal'}
                                </span>
                            ) : (
                                <span className="text-xs font-normal uppercase font-body text-foreground">
                                    {profileData?.branch?.name}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="hidden gap-4 items-center md:flex">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSignOut}
                            className="text-red-500 cursor-pointer hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                        >
                            <Power
                                className="w-5 h-5"
                                id="tour-step-sign-out"
                            />
                            <span className="sr-only">Sign out</span>
                        </Button>

                        {/* Help Dropdown Menu */}
                        <DropdownMenu
                            open={helpDropdownOpen}
                            onOpenChange={setHelpDropdownOpen}
                        >
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`relative text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20 ${isCallActive && 'bg-red-100 dark:bg-red-900/20 text-red-500'}`}
                                >
                                    <HelpCircle
                                        strokeWidth={1.2}
                                        size={20}
                                        id="tour-step-help-trigger"
                                    />
                                    {isCallActive && (
                                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-LORO" />
                                    )}
                                    <span className="sr-only">
                                        Help & Support
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="mt-2 w-56"
                            >
                                <DropdownMenuLabel>
                                    Help & Support
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {isCallActive ? (
                                    <DropdownMenuItem
                                        onClick={endCall}
                                        className="p-3 cursor-pointer"
                                    >
                                        <PhoneCall className="mr-2 w-4 h-4 animate-LORO" />
                                        <span>
                                            End Call{' '}
                                            {formattedTimeRemaining &&
                                                `(${formattedTimeRemaining})`}
                                        </span>
                                    </DropdownMenuItem>
                                ) : lastError ? (
                                    <DropdownMenuItem
                                        onClick={retryLastCall}
                                        disabled={isCallInitializing}
                                        className="p-3 cursor-pointer"
                                    >
                                        <PhoneCall className="mr-2 w-4 h-4" />
                                        <span>Retry Call</span>
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem
                                        onClick={startCall}
                                        disabled={isCallInitializing}
                                        className="p-3 cursor-pointer"
                                    >
                                        <PhoneCall className="mr-2 w-4 h-4" />
                                        <span>Call for Assistance</span>
                                        {isCallInitializing && (
                                            <span className="ml-2 w-2 h-2 bg-amber-500 rounded-full animate-LORO" />
                                        )}
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={handleStartTour}
                                    className="p-3 cursor-pointer"
                                >
                                    <PlayCircle
                                        className="mr-2 w-4 h-4"
                                        id="tour-step-start-tour"
                                    />
                                    <span>Start Interactive Tour</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <div>
                            <ThemeToggler />
                        </div>
                        <div className="relative">
                            <Avatar
                                className="w-8 h-8 ring-2 ring-primary"
                                id="tour-step-avatar"
                            >
                                {/* Show client logo if available, otherwise show user photoURL */}
                                {(isClient && (profileData as any)?.logo) || profileData?.photoURL ? (
                                    <AvatarImage
                                        src={isClient ? (profileData as any)?.logo : profileData?.photoURL}
                                        alt={
                                            isClient
                                                ? profileData?.name || profileData?.email
                                                : `${profileData?.name} ${profileData?.surname}`
                                        }
                                    />
                                ) : null}
                                <AvatarFallback
                                    className={`${isClient ? 'bg-primary' : 'bg-black'} text-white text-[10px] font-body uppercase`}
                                >
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute right-0 bottom-0 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-16" />
            <SideDrawer
                isOpen={isDrawerOpen}
                onClose={() => setDrawerOpen(false)}
            />
        </>
    );
}
