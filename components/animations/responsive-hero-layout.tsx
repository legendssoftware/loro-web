"use client";

import { StaggerContainer } from '@/components/animations/stagger-container';
import { StaggerItem } from '@/components/animations/stagger-item';
import { StatsDisplay } from '@/components/animations/stats-display';
import { MobileScannerWidget } from '@/components/animations/mobile-scanner-widget';
import { UserCarousel } from '@/components/animations/user-carousel';
import { MobileHero } from '@/components/animations/mobile-hero';
import { useResponsiveTextSize } from '@/hooks/use-mobile';

// Use the UserProfile interface from the UserCarousel component
interface UserProfile {
    name: string;
    position: string;
    company: string;
    location: string;
    avatar: string;
    industry: string;
}

interface ResponsiveHeroLayoutProps {
    // Hero text props
    currentPhraseIndex: number;
    heroPhrases: string[];

    // Call functionality props
    isCallInitializing: boolean;
    isCallActive: boolean;
    connectionError: Error | null;
    formattedTimeRemaining: string | null;
    startDemoCall: () => void;

    // Data props
    liveStats: {
        totalUsers: number;
        cardsCreatedToday: number;
        activeSessions: number;
        revenueToday: number;
        growthPercentage: number;
        newUsersThisWeek: number;
    };
    diverseUsers: UserProfile[];

    className?: string;
}

export function ResponsiveHeroLayout({
    currentPhraseIndex,
    heroPhrases,
    isCallInitializing,
    isCallActive,
    connectionError,
    formattedTimeRemaining,
    startDemoCall,
    liveStats,
    diverseUsers,
    className = '',
}: ResponsiveHeroLayoutProps) {
    const { isMobile, isSmallMobile } = useResponsiveTextSize();

    // Layout configuration based on screen size
    const getGridLayout = () => {
        if (isSmallMobile) return 'grid-cols-1 gap-4'; // Single column on very small screens
        if (isMobile) return 'grid-cols-1 gap-4'; // Single column on mobile
        return 'grid-cols-1 lg:grid-cols-2 gap-8'; // Two columns on desktop
    };

    const getContainerPadding = () => {
        if (isSmallMobile) return 'px-2 py-4';
        if (isMobile) return 'px-4 py-6';
        return 'px-4 py-8 md:px-6 md:py-12';
    };

    const getMaxWidth = () => {
        if (isMobile) return 'max-w-md mx-auto'; // Constrain width on mobile
        return 'max-w-6xl mx-auto';
    };

    return (
        <div className={`${getContainerPadding()} ${className}`}>
            <div className={getMaxWidth()}>
                <div className={`grid ${getGridLayout()}`}>
                    {/* Left Column - Hero Content */}
                    <StaggerContainer
                        className="flex flex-col justify-center space-y-4"
                        staggerChildren={isMobile ? 0.1 : 0.2}
                    >
                        <MobileHero
                            currentPhraseIndex={currentPhraseIndex}
                            heroPhrases={heroPhrases}
                            isCallInitializing={isCallInitializing}
                            isCallActive={isCallActive}
                            connectionError={connectionError}
                            formattedTimeRemaining={formattedTimeRemaining}
                            startDemoCall={startDemoCall}
                        />
                    </StaggerContainer>

                    {/* Right Column - Analytics and Widgets */}
                    <StaggerContainer
                        className={`grid ${
                            isMobile
                                ? 'grid-cols-1 gap-3'
                                : 'grid-cols-1 gap-4'
                        }`}
                        staggerChildren={isMobile ? 0.05 : 0.1}
                    >
                        {/* User Carousel */}
                        <StaggerItem className="order-1">
                            <div className={`${
                                isSmallMobile
                                    ? 'h-20'
                                    : isMobile
                                        ? 'h-24'
                                        : 'h-32'
                            } overflow-hidden rounded-lg border`}>
                                <UserCarousel
                                    users={diverseUsers}
                                    interval={isMobile ? 4000 : 3500} // Slightly slower on mobile
                                />
                            </div>
                        </StaggerItem>

                        {/* Live Analytics */}
                        <StaggerItem className="order-2">
                            <div className={`${
                                isMobile ? 'space-y-2' : 'space-y-3'
                            }`}>
                                {/* Live Analytics Dashboard Widget */}
                                <div className={`overflow-hidden ${
                                    isSmallMobile
                                        ? 'max-h-20'
                                        : isMobile
                                            ? 'max-h-24'
                                            : 'max-h-24'
                                }`}>
                                    <StatsDisplay
                                        data={liveStats}
                                        className={isMobile ? 'mb-2' : 'mb-3'}
                                    />
                                </div>

                                {/* Scanner Widget */}
                                <MobileScannerWidget
                                    scanPercentage={75}
                                    growthPercentage="+12%"
                                />
                            </div>
                        </StaggerItem>
                    </StaggerContainer>
                </div>
            </div>
        </div>
    );
}
