import type { Metadata, Viewport } from 'next';
import { Unbounded } from 'next/font/google';
import '../styles/globals.css';
import { ThemeProvider } from '@/providers/theme-provider';
import { LayoutProvider } from '@/providers/layout.provider';
import { TopNav } from '@/components/navigation/top-nav';
import { Toaster } from 'react-hot-toast';

const unbounded = Unbounded({
    variable: '--font-unbounded',
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
    title: 'LORO CRM | All-in-One Enterprise Solution for Field Management, HR, Sales & Customer Relationship Management',
    description:
        'Transform your business operations with LORO CRM - the ultimate integrated platform for customer relationship management, field service automation, employee monitoring, sales pipeline optimization, HR management, and real-time reporting. Our comprehensive solution works seamlessly online and offline, offering unparalleled visibility into your workforce productivity, customer interactions, and business performance metrics. Trusted by industry leaders for streamlining operations and driving revenue growth.',
    keywords: [
        // CRM Core
        'CRM', 'customer relationship management', 'client management system', 'customer database',
        'contact management software', 'customer tracking', 'client interaction tracking',
        'customer segmentation', 'customer journey mapping', 'omnichannel CRM',

        // Sales Management
        'sales pipeline', 'lead management', 'lead generation', 'lead qualification',
        'sales automation', 'sales forecasting', 'opportunity management', 'deal closing',
        'sales analytics', 'revenue optimization', 'quote management', 'proposal automation',
        'sales territory management', 'account-based selling', 'upselling tools',

        // Field Management & Monitoring
        'field service management', 'field service automation', 'field service software',
        'field workforce tracking', 'mobile workforce management', 'technician dispatching',
        'field employee monitoring', 'GPS tracking system', 'route optimization',
        'field data collection', 'offline field operations', 'mobile field reporting',
        'field service KPIs', 'technician productivity', 'service appointment scheduling',

        // Employee & HR Management
        'employee monitoring', 'staff management system', 'attendance tracking',
        'performance management', 'HR analytics', 'employee productivity tracking',
        'time tracking software', 'workforce management', 'staff scheduling',
        'employee reporting system', 'team management solution', 'remote worker monitoring',
        'employee task management', 'staff training tracking', 'talent management',

        // Reporting & Analytics
        'business intelligence dashboard', 'automated reporting', 'real-time analytics',
        'performance metrics', 'KPI tracking', 'data visualization', 'custom business reports',
        'executive dashboards', 'operational insights', 'business performance monitoring',
        'predictive analytics', 'trend analysis', 'reporting automation',

        // Industry-Specific
        'CRM South Africa', 'field service CRM', 'enterprise CRM solution',
        'SMB customer management', 'industry-specific CRM', 'scalable CRM platform',
        'inventory management CRM', 'quotation management system', 'claims management',
        'field service management software', 'mobile CRM app',

        // Technical Features
        'offline-capable CRM', 'cloud-based CRM', 'mobile CRM solution',
        'integrated business platform', 'API-enabled CRM', 'customizable CRM',
        'secure customer data platform', 'multi-device CRM', 'location-based services',
    ],
    authors: [
        {
            name: 'Brandon Nhlanhla Nkawu',
            url: 'https://www.linkedin.com/in/brandonnkawu/',
        },
    ],
    openGraph: {
        title: 'LORO CRM | Complete Business Management Platform for Field Operations, HR & Sales',
        description:
            'Revolutionize your business operations with our comprehensive CRM solution featuring advanced field monitoring, employee reporting, sales automation, and complete HR management capabilities - all in one powerful platform that works online and offline.',
        type: 'website',
        siteName: 'LORO CRM Platform',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'LORO CRM | Enterprise Management Solution for Field Teams, Sales & HR',
        description:
            'Maximize operational efficiency with our all-in-one CRM platform offering comprehensive field monitoring, employee reporting, sales tracking, and HR management capabilities for modern businesses.',
    },
    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    category: 'Business Software',
    applicationName: 'LORO CRM',
    referrer: 'origin-when-cross-origin',
    creator: 'LORO CRM Team',
    publisher: 'LORO CRM',
};

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: 'white' },
        { media: '(prefers-color-scheme: dark)', color: '#000' },
    ],
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link
                    rel="stylesheet"
                    href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
                    integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
                    crossOrigin=""
                />
            </head>
            <body
                className={`${unbounded.variable} font-unbounded antialiased bg-background relative`}
            >
                <ThemeProvider attribute="class" disableTransitionOnChange>
                    <LayoutProvider>
                        <div className="z-[2000] relative">
                            <TopNav />
                        </div>
                        <main>{children}</main>
                    </LayoutProvider>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: '#333',
                                color: '#fff',
                                zIndex: 9999999,
                                fontSize: '14px',
                                fontWeight: '500',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                            },
                            success: {
                                style: {
                                    background: '#10B981',
                                },
                                iconTheme: {
                                    primary: '#ffffff',
                                    secondary: '#10B981',
                                },
                            },
                            error: {
                                style: {
                                    background: '#EF4444',
                                },
                                iconTheme: {
                                    primary: '#ffffff',
                                    secondary: '#EF4444',
                                },
                            },
                        }}
                        containerStyle={{
                            zIndex: 9999999,
                            position: 'fixed',
                            top: '1.5rem',
                            right: '1.5rem',
                        }}
                    />
                </ThemeProvider>
            </body>
        </html>
    );
}
