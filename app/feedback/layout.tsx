import type { Metadata } from 'next';
import { Unbounded, Poppins } from 'next/font/google';
import '../../styles/globals.css';
import { ThemeProvider } from '@/providers/theme-provider';
import { Toaster } from 'react-hot-toast';

const unbounded = Unbounded({
    variable: '--font-unbounded',
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const poppins = Poppins({
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin'],
    variable: '--font-poppins',
});

export const metadata: Metadata = {
    title: 'LORO CRM | Feedback',
    description: 'Share your feedback with us to help improve our service',
};

// This layout is for unauthenticated pages (no top nav or sidebar)
export default function FeedbackLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className={`${unbounded.variable} ${poppins.variable} font-unbounded antialiased bg-black min-h-screen`}>
            <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" disableTransitionOnChange>
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
