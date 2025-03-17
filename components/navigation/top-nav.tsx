'use client';

import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { SideDrawer } from './side-drawer';
import { isAuthRoute } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/use-app-store';
import { LayoutDashboardIcon, Power } from 'lucide-react';
import { ThemeToggler } from '@/modules/navigation/theme.toggler';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function TopNav() {
    const pathname = usePathname();
    const { signOut, profileData } = useAuthStore();
    const { isDrawerOpen, setDrawerOpen } = useAppStore();

    const userInitials = profileData ? `${profileData.name?.[0]}${profileData.surname?.[0]}`.toUpperCase() : 'UU';

    const handleSignOut = async () => {
        try {
            signOut();

            const toastId = toast.success('Session Ended', {
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

            await new Promise(resolve => setTimeout(resolve, 2000));
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
            <div className='fixed top-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-transparent mb-5'>
                <div className='flex items-center justify-between h-16 px-2'>
                    <div className='flex items-center justify-between w-full gap-2 md:w-auto'>
                        <Button
                            variant='ghost'
                            size='icon'
                            className='cursor-pointer'
                            onClick={() => setDrawerOpen(true)}
                        >
                            <LayoutDashboardIcon strokeWidth={1.5} size={23} />
                        </Button>
                        <span className='text-xs font-normal uppercase font-body'>{profileData?.branch?.name}</span>
                    </div>
                    <div className='items-center hidden gap-4 md:flex'>
                        <Button
                            variant='ghost'
                            size='icon'
                            onClick={handleSignOut}
                            className='text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20'
                        >
                            <Power className='w-5 h-5' />
                            <span className='sr-only'>Sign out</span>
                        </Button>
                        <ThemeToggler />
                        <div className='relative'>
                            <Avatar className='w-8 h-8 ring-2 ring-primary'>
                                {profileData?.photoURL && (
                                    <AvatarImage
                                        src={profileData?.photoURL}
                                        alt={`${profileData?.name} ${profileData?.surname}`}
                                    />
                                )}
                                <AvatarFallback className='bg-black text-white text-[10px] font-body uppercase'>
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>
                            <div className='absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white' />
                        </div>
                    </div>
                </div>
            </div>
            <div className='h-16' />
            <SideDrawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} />
        </>
    );
}
