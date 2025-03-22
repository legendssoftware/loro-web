'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    ChartSpline,
    CalendarCheck2,
    Power,
    Users,
    HandCoins,
    Handshake,
    ShoppingBag,
    KeySquare,
    BriefcaseBusiness,
    Images,
    MapPin,
    Settings,
    LayoutList,
    Warehouse,
    CalendarRange,
} from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useRBAC } from '@/hooks/use-rbac';
import { AccessLevel } from '@/types/auth';
import toast from 'react-hot-toast';

interface SideDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

// Navigation items with role-based access control information
const navigationItems = [
    {
        title: 'Dashboard',
        icon: <ChartSpline size={18} strokeWidth={1.5} />,
        href: '/',
        description: 'Overview dashboard and statistics',
        // Everyone can access the dashboard home
        feature: 'dashboard',
    },
    {
        title: 'Assets',
        icon: <LayoutList size={18} strokeWidth={1.5} />,
        href: '/assets',
        description: 'View & manage company assets',
        // Only admin can access assets
        allowedRoles: [AccessLevel.ADMIN],
    },
    {
        title: 'Leads',
        icon: <Handshake size={18} strokeWidth={1.5} />,
        href: '/leads',
        description: 'Manage potential customers',
        // Basic users can access leads
        feature: 'leads',
    },
    {
        title: 'Attendance',
        icon: <CalendarRange size={18} strokeWidth={1.5} />,
        href: '/attendance',
        description: 'View & manage employee attendance',
        // Only admin, manager, supervisor can access attendance
        allowedRoles: [
            AccessLevel.ADMIN,
            AccessLevel.MANAGER,
            AccessLevel.SUPERVISOR,
        ],
    },
    {
        title: 'Staff',
        icon: <Users size={18} strokeWidth={1.5} />,
        href: '/staff',
        description: 'Manage team members',
        // Only admins, managers, and supervisors can access staff
        allowedRoles: [
            AccessLevel.ADMIN,
            AccessLevel.MANAGER,
            AccessLevel.SUPERVISOR,
            AccessLevel.HR,
        ],
    },
    {
        title: 'Tasks',
        icon: <CalendarCheck2 size={18} strokeWidth={1.5} />,
        href: '/tasks',
        description: 'Track work assignments',
        // Basic users can access tasks
        feature: 'tasks',
    },
    {
        title: 'Claims',
        icon: <HandCoins size={18} strokeWidth={1.5} />,
        href: '/claims',
        description: 'Handle employee claims',
        // Basic users can access claims
        feature: 'claims',
    },
    {
        title: 'Journals',
        icon: <Images size={18} strokeWidth={1.5} />,
        href: '/journals',
        description: 'Manage journal entries',
        // All authenticated users can access journals
        feature: 'journal',
    },
    {
        title: 'Map View',
        icon: <MapPin size={18} strokeWidth={1.5} />,
        href: '/map',
        description: 'View check-ins, tasks, events and team locations',
        // All authenticated users can access the map
        feature: 'dashboard',
    },
    {
        title: 'Shop',
        icon: <ShoppingBag size={18} strokeWidth={1.5} />,
        href: '/quotations',
        description: 'Manage purchase transactions, orders and payments',
        // Basic users can access quotations
        feature: 'quotations',
    },
    {
        title: 'Clients',
        icon: <BriefcaseBusiness size={18} strokeWidth={1.5} />,
        href: '/clients',
        description: 'View & manage clients',
        // Only admin, manager, supervisor can access clients
        allowedRoles: [
            AccessLevel.ADMIN,
            AccessLevel.MANAGER,
            AccessLevel.SUPERVISOR,
        ],
    },
    {
        title: 'Inventory',
        icon: <Warehouse size={18} strokeWidth={1.5} />,
        href: '/inventory',
        description: 'Track product stock levels',
        // Only admin, manager can access inventory
        allowedRoles: [AccessLevel.ADMIN, AccessLevel.MANAGER],
    },
    {
        title: 'Settings',
        icon: <Settings size={18} strokeWidth={1.5} />,
        href: '/settings',
        description: 'Manage system settings',
        // Only admin can access settings
        allowedRoles: [AccessLevel.ADMIN],
    },
];

export function SideDrawer({ isOpen, onClose }: SideDrawerProps) {
    const pathname = usePathname();
    const { profileData, signOut } = useAuthStore();
    const { hasRole, hasPermission } = useRBAC();

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

    const LicenseInfo = () => {
        if (!profileData?.licenseInfo) {
            return null;
        }

        const { plan, status } = profileData?.licenseInfo;
        const isActive = status.toLowerCase() === 'active';

        return (
            <div className="px-2 py-4 border-t border-border/10">
                <div className="relative group">
                    <div className="flex items-center justify-center p-3 rounded bg-accent/30">
                        <KeySquare
                            size={18}
                            className={cn(
                                'transition-colors',
                                isActive ? 'text-emerald-500' : 'text-red-500',
                            )}
                        />
                    </div>
                    <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-background border rounded-md shadow-md font-body whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none transform origin-left scale-95 translate-x-[-10px] group-hover:scale-100 group-hover:translate-x-0">
                        <p className="text-[10px] font-medium text-card-foreground uppercase">
                            License Info
                        </p>
                        <p className="text-[8px] text-muted-foreground uppercase">
                            Current plan: {plan}
                        </p>
                        <p className="text-[8px] text-muted-foreground uppercase">
                            Status:{' '}
                            <span
                                className={cn(
                                    isActive
                                        ? 'text-emerald-500'
                                        : 'text-red-500',
                                )}
                            >
                                {status}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
                side="left"
                className={cn(
                    'flex flex-col w-[80px] h-[95vh] my-auto md:h-[98vh] md:my-[1vh] mx-4 rounded',
                    'border shadow-lg p-0 gap-0',
                )}
            >
                <SheetHeader className="flex items-center justify-between p-6 border-b border-border/10">
                    <SheetTitle asChild>
                        <span className="text-sm font-bold uppercase font-body text-card-foreground">
                            LORO
                        </span>
                    </SheetTitle>
                </SheetHeader>
                <div className="flex-1 p-2">
                    <div className="flex flex-col space-y-1">
                        {/* Filter the navigation items based on user permissions */}
                        {navigationItems.map((item) => {
                            const isActive = pathname === item.href;

                            // Skip rendering this item if user doesn't have permission
                            if (
                                item.allowedRoles &&
                                !hasRole(item.allowedRoles)
                            ) {
                                return null;
                            }

                            if (item.feature && !hasPermission(item.feature)) {
                                return null;
                            }

                            return (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    onClick={onClose}
                                >
                                    <div className="relative group">
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                'w-full justify-center gap-3 font-body text-[10px] text-card-foreground font-normal h-12 rounded-xl',
                                                'hover:border-primary/30 hover:text-accent-foreground hover:bg-transparent hover:border ease-in-out duration-500',
                                                isActive &&
                                                    'border-primary border text-primary bg-primary/5',
                                            )}
                                        >
                                            {item.icon}
                                        </Button>
                                        <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-background border rounded-md shadow-md text-[10px] font-body uppercase whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none transform origin-left scale-95 translate-x-[-10px] group-hover:scale-100 group-hover:translate-x-0">
                                            <p className="text-sm font-medium uppercase text-card-foreground">
                                                {item.title}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
                <div className="flex flex-col gap-2 p-2 md:hidden">
                    <div className="relative group">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSignOut}
                            className="flex items-center justify-center w-full h-12 text-red-500 bg-red-500/10 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl"
                        >
                            <Power className="w-5 h-5" />
                        </Button>
                        <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-background border rounded-md shadow-md text-[10px] font-body uppercase whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none transform origin-left scale-95 translate-x-[-10px] group-hover:scale-100 group-hover:translate-x-0 text-red-500">
                            <p className="text-[10px] font-medium text-red-500 uppercase">
                                Sign out
                            </p>
                            <p className="text-[8px] text-muted-foreground">
                                End your current session
                            </p>
                        </div>
                    </div>
                </div>
                {profileData?.licenseInfo && <LicenseInfo />}
                <div className="p-6 mt-auto border-t border-border/10">
                    <p className="text-[8px] font-body uppercase text-center text-card-foreground font-normal">
                        Legend Systems
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    );
}
