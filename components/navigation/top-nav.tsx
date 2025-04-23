'use client';

import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { SideDrawer } from './side-drawer';
import { isAuthRoute } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/use-app-store';
import { LayoutDashboardIcon, Power, PhoneCall } from 'lucide-react';
import { ThemeToggler } from '@/modules/navigation/theme.toggler';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useHelp } from '@/hooks/use-help';

export function TopNav() {
    const pathname = usePathname();
    const { signOut, profileData, accessToken, isAuthenticated } =
        useAuthStore();
    const { isDrawerOpen, setDrawerOpen } = useAppStore();

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
        }
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
    };

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

    // Get user display info based on whether they're a client or regular user
    const userInitials = isClient
        ? profileData?.email
            ? profileData.email.substring(0, 2).toUpperCase()
            : 'CL'
        : profileData
          ? `${profileData.name?.[0]}${profileData.surname?.[0]}`.toUpperCase()
          : 'UU';

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

            window.location.href = '/landing-page';
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

    if (isAuthRoute(pathname)) {
        return null;
    }

    return (
        <>
            <div className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-transparent mb-5">
                <div className="flex items-center justify-between h-16 px-2">
                    <div className="flex items-center justify-between w-full gap-2 md:w-auto">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer"
                            onClick={() => setDrawerOpen(true)}
                        >
                            <LayoutDashboardIcon strokeWidth={1.5} size={23} />
                        </Button>
                        <div className="flex items-center gap-2">
                            {isClient ? (
                                <span className="text-xs font-thin uppercase text-primary font-body">
                                    Client Portal
                                </span>
                            ) : (
                                <span className="text-xs font-normal uppercase font-body">
                                    {profileData?.branch?.name}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="items-center hidden gap-4 md:flex">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSignOut}
                            className="text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                        >
                            <Power className="w-5 h-5" />
                            <span className="sr-only">Sign out</span>
                        </Button>
                        {isCallActive ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 w-auto px-2"
                                onClick={endCall}
                            >
                                <PhoneCall
                                    strokeWidth={1.2}
                                    size={20}
                                    className="animate-pulse mr-1"
                                />
                                {formattedTimeRemaining && (
                                    <span className="text-xs">{formattedTimeRemaining}</span>
                                )}
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                <span className="sr-only">
                                    End Assistant Call
                                </span>
                            </Button>
                        ) : lastError ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/20"
                                onClick={retryLastCall}
                                disabled={isCallInitializing}
                            >
                                <PhoneCall strokeWidth={1.2} size={20} />
                                <span className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full" />
                                <span className="sr-only">Retry Assistant Call</span>
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20"
                                onClick={startCall}
                                disabled={isCallInitializing}
                            >
                                <PhoneCall strokeWidth={1.2} size={20} />
                                {isCallInitializing && (
                                    <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                )}
                                <span className="sr-only">Voice Assistant</span>
                            </Button>
                        )}
                        <ThemeToggler />
                        <div className="relative">
                            <Avatar className="w-8 h-8 ring-2 ring-primary">
                                {profileData?.photoURL && (
                                    <AvatarImage
                                        src={profileData?.photoURL}
                                        alt={
                                            isClient
                                                ? profileData?.email
                                                : `${profileData?.name} ${profileData?.surname}`
                                        }
                                    />
                                )}
                                <AvatarFallback
                                    className={`${isClient ? 'bg-primary' : 'bg-black'} text-white text-[10px] font-body uppercase`}
                                >
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white" />
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
