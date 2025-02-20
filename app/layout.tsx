import type { Metadata, Viewport } from 'next';
import { Unbounded } from 'next/font/google';
import '../styles/globals.css';
import { ThemeProvider } from '@/providers/theme-provider';
import { LayoutProvider } from '@/providers/layout.provider';
import { TopNav } from '@/components/navigation/top-nav';
import { AlertBanner } from '@/components/ui/alert-banner';
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
    ],
    authors: [{ name: 'Brandon Nhlanhla Nkawu' }],
    openGraph: {
        title: 'CRM Dashboard | Modern Customer Management',
        description: 'Streamline your customer relationships with our powerful CRM platform',
        type: 'website',
        siteName: 'CRM Dashboard',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'CRM Dashboard | Modern Customer Management',
        description: 'Streamline your customer relationships with our powerful CRM platform',
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
        <html lang='en' suppressHydrationWarning>
            <body className={`${unbounded.variable} font-unbounded antialiased bg-background relative`}>
                <ThemeProvider attribute='class' disableTransitionOnChange>
                    <LayoutProvider>
                        <TopNav />
                        <main>{children}</main>
                    </LayoutProvider>
                    <Toaster
                        position='top-right'
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
                <AlertBanner />
            </body>
        </html>
    );
}
