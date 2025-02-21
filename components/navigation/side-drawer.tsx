'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Building2, ChartSpline, Power, Settings } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSessionStore } from '@/store/use-session-store';
import toast from 'react-hot-toast';

interface SideDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const navigationItems = [
    {
        title: 'Overview',
        icon: <ChartSpline size={18} strokeWidth={1.5} />,
        href: '/',
    },
    {
        title: 'MY OFFICE',
        icon: <Building2 size={18} strokeWidth={1.5} />,
        href: '/my-office',
    },
    {
        title: 'Settings',
        icon: <Settings size={18} strokeWidth={1.5} />,
        href: '/settings',
    },
];

export function SideDrawer({ isOpen, onClose }: SideDrawerProps) {
    const pathname = usePathname();
    const { profileData, signOut } = useSessionStore();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await signOut();
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
            router.push('/landing-page');
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

    const LicenseInfo = () => {
        if (!profileData?.licenseInfo) {
            return null;
        }

        const { plan, status } = profileData?.licenseInfo;

        return (
            <div className='px-2 py-4 border-t border-border/10'>
                <div className='flex flex-col gap-2 p-3 rounded bg-accent/30'>
                    <div className='flex items-center justify-between'>
                        <div className='flex flex-row items-center gap-1'>
                            <div className='flex flex-col gap-0.5'>
                                <p className='text-[10px] font-body text-muted-foreground uppercase'>My PLAN</p>
                                <p className='text-[11px] font-body font-medium text-card-foreground uppercase'>
                                    {plan}
                                </p>
                            </div>
                        </div>
                        <div
                            className={cn(
                                'w-3 h-3 rounded-full',
                                status.toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-red-500',
                            )}
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
                side='left'
                className={cn(
                    'flex flex-col w-[200px] h-[95vh] my-auto md:h-[98vh] md:my-[1vh] mx-4 rounded-3xl',
                    'border shadow-lg p-0 gap-0',
                )}
            >
                <SheetHeader className='flex items-center justify-between p-6 border-b border-border/10'>
                    <SheetTitle asChild>
                        <span className='text-xl font-bold uppercase font-body text-card-foreground'>LORO CRM</span>
                    </SheetTitle>
                </SheetHeader>
                <div className='flex-1 px-4 py-2'>
                    <div className='flex flex-col space-y-1'>
                        {navigationItems.map(item => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.title} href={item.href} onClick={onClose}>
                                    <Button
                                        variant='ghost'
                                        className={cn(
                                            'w-full justify-start gap-3 font-body text-[10px] text-card-foreground font-normal h-12 rounded-xl',
                                            'hover:bg-accent hover:text-accent-foreground',
                                            'dark:hover:bg-accent/50 dark:hover:text-accent-foreground',
                                            isActive && 'bg-background',
                                            isActive && 'dark:bg-background',
                                        )}
                                    >
                                        {item.icon}
                                        <span className='text-[10px] font-body font-normal uppercase'>
                                            {item.title}
                                        </span>
                                    </Button>
                                </Link>
                            );
                        })}
                    </div>
                </div>
                <div className='flex flex-col gap-2 p-2 md:hidden'>
                    <Button
                        variant='ghost'
                        size='icon'
                        onClick={handleSignOut}
                        className='flex items-center justify-between w-full px-4 py-6 text-red-500 bg-red-500/10 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20'
                    >
                        <span className='text-white uppercase text-[10px] font-body'>Sign out</span>
                        <Power className='w-5 h-5' />
                    </Button>
                </div>
                {profileData?.licenseInfo && <LicenseInfo />}
                <div className='p-6 mt-auto border-t border-border/10'>
                    <p className='text-[10px] font-body uppercase text-center text-card-foreground font-normal'>
                        POWERED BY LORO CRM
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    );
}
