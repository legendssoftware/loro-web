import '../../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import type { Metadata } from 'next';
import { Urbanist } from 'next/font/google';
import { ThemeProvider } from '@/providers/theme-provider';

const urbanist = Urbanist({
    variable: '--font-urbanist',
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
    title: 'LORO CRM | Review Quotation',
    description: 'Review and respond to your quotation',
};

// This layout is for unauthenticated pages (no top nav or sidebar)
export default function ReviewQuotationLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div
            className={`${urbanist.variable} font-urbanist antialiased bg-black min-h-screen`}
        >
            <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                forcedTheme="dark"
                disableTransitionOnChange
            >
                <main className="w-full min-h-screen">{children}</main>
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
        </div>
    );
}
