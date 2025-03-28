'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageTransition } from '@/components/animations/page-transition';
import { useState } from 'react';
import {
    CreditCard,
    Settings as SettingsIcon,
    TimerOff,
    Bell,
    Palette,
} from 'lucide-react';

// Settings components
import AppearanceForm from '@/components/settings/appearance-form';
import BusinessHoursForm from '@/components/settings/business-hours-form';
import GeneralSettingsForm from '@/components/settings/general-settings-form';
import GeofenceSettingsForm from '@/components/settings/geofence-settings-form';
import NotificationsForm from '@/components/settings/notifications-form';

import { Button } from '@/components/ui/button';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');

    const renderSettingsContent = () => {
        switch (activeTab) {
            case 'general':
                return <GeneralSettingsForm />;
            case 'business-hours':
                return <BusinessHoursForm />;
            case 'appearance':
                return <AppearanceForm />;
            case 'geofence':
                return <GeofenceSettingsForm />;
            case 'notifications':
                return <NotificationsForm />;
            default:
                return <GeneralSettingsForm />;
        }
    };

    return (
        <ProtectedRoute>
            <PageTransition>
                <div className="px-4 py-4 md:px-6">
                    <h1 className="mb-2 text-xl font-medium uppercase font-body">
                        Settings
                    </h1>
                    <p className="mb-6 text-xs font-thin uppercase font-body text-muted-foreground">
                        Manage your organization settings, appearance, and
                        business hours.
                    </p>

                    <div className="flex flex-col gap-4 md:flex-row">
                        {/* Settings Navigation Sidebar */}
                        <div className="w-full md:w-60">
                            <nav className="flex flex-col space-y-1">
                                <Button
                                    variant={
                                        activeTab === 'general'
                                            ? 'default'
                                            : 'ghost'
                                    }
                                    className={`justify-start px-2 ${
                                        activeTab === 'general'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted/50'
                                    }`}
                                    onClick={() => setActiveTab('general')}
                                >
                                    <SettingsIcon
                                        size={22}
                                        strokeWidth={1.2}
                                        color="white"
                                        className="mr-2"
                                    />
                                    <span className="text-[10px] font-thin uppercase font-body text-white">
                                        General
                                    </span>
                                </Button>
                                <Button
                                    variant={
                                        activeTab === 'business-hours'
                                            ? 'default'
                                            : 'ghost'
                                    }
                                    className={`justify-start px-2 ${
                                        activeTab === 'business-hours'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted/50'
                                    }`}
                                    onClick={() =>
                                        setActiveTab('business-hours')
                                    }
                                >
                                    <TimerOff
                                        size={22}
                                        strokeWidth={1.2}
                                        color="white"
                                        className="mr-2"
                                    />
                                    <span className="text-[10px] font-thin uppercase font-body text-white">
                                        Business Hours
                                    </span>
                                </Button>
                                <Button
                                    variant={
                                        activeTab === 'appearance'
                                            ? 'default'
                                            : 'ghost'
                                    }
                                    className={`justify-start px-2 ${
                                        activeTab === 'appearance'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted/50'
                                    }`}
                                    onClick={() => setActiveTab('appearance')}
                                >
                                    <Palette
                                        size={22}
                                        strokeWidth={1.2}
                                        color="white"
                                        className="mr-2"
                                    />
                                    <span className="text-[10px] font-thin uppercase font-body text-white">
                                        Appearance
                                    </span>
                                </Button>
                                <Button
                                    variant={
                                        activeTab === 'geofence'
                                            ? 'default'
                                            : 'ghost'
                                    }
                                    className={`justify-start px-2 ${
                                        activeTab === 'geofence'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted/50'
                                    }`}
                                    onClick={() => setActiveTab('geofence')}
                                >
                                    <CreditCard
                                        size={22}
                                        strokeWidth={1.2}
                                        color="white"
                                        className="mr-2"
                                    />
                                    <span className="text-[10px] font-thin uppercase font-body text-white">
                                        Geofence
                                    </span>
                                </Button>
                                <Button
                                    variant={
                                        activeTab === 'notifications'
                                            ? 'default'
                                            : 'ghost'
                                    }
                                    className={`justify-start px-2 ${
                                        activeTab === 'notifications'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted/50'
                                    }`}
                                    onClick={() =>
                                        setActiveTab('notifications')
                                    }
                                >
                                    <Bell
                                        size={22}
                                        strokeWidth={1.2}
                                        color="white"
                                        className="mr-2"
                                    />
                                    <span className="text-[10px] font-thin uppercase font-body text-white">
                                        Notifications
                                    </span>
                                </Button>
                            </nav>
                        </div>

                        {/* Settings Content */}
                        <div className="flex-1">{renderSettingsContent()}</div>
                    </div>
                </div>
            </PageTransition>
        </ProtectedRoute>
    );
}
