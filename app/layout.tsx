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
    title: 'LORO CRM | Streamline your customer relationships with our powerful CRM platform',
    description:
        'Streamline your customer relationships with our powerful CRM platform. Features include contact management, sales pipeline tracking, and detailed analytics.',
    keywords: [
        'CRM',
        'customer relationship management',
        'sales pipeline',
        'lead management',
        'business dashboard',
        'customer tracking',
        'sales management',
        'business tools',
        'automated reporting',
        'attendance tracking',
        'location tracking',
        'CRM South Africa',
        'time management',
        'field management',
        'field service management',
        'field service automation',
        'field service software',
        'field service management software',
    ],
    authors: [
        {
            name: 'Brandon Nhlanhla Nkawu',
            url: 'https://www.linkedin.com/in/brandonnkawu/',
        },
    ],
    openGraph: {
        title: 'CRM Dashboard | Modern Customer Management',
        description:
            'Streamline your customer relationships with our powerful CRM platform',
        type: 'website',
        siteName: 'CRM Dashboard',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'CRM Dashboard | Modern Customer Management',
        description:
            'Streamline your customer relationships with our powerful CRM platform',
    },
    robots: {
        index: true,
        follow: true,
    },
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
                className={`${unbounded.variable} font-unbounded antialiased bg-background relative overflow-y-scroll`}
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
                            },
                            success: {
                                iconTheme: {
                                    primary: '#22c55e',
                                    secondary: '#fff',
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: '#ef4444',
                                    secondary: '#fff',
                                },
                            },
                        }}
                    />
                </ThemeProvider>
            </body>
        </html>
    );
}
