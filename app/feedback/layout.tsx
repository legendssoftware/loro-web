import type { Metadata } from 'next';
import { Urbanist } from 'next/font/google';
import '../../styles/globals.css';
import { ThemeProvider } from '@/providers/theme-provider';
import { Toaster } from 'react-hot-toast';

const urbanist = Urbanist({
    variable: '--font-urbanist',
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
    title: 'LORO CRM | Feedback',
    description: 'Share your feedback with us to help improve our service',
};

// This layout is for unauthenticated pages (no top nav or sidebar)
export default function FeedbackLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${urbanist.variable} font-urbanist antialiased`}>
                <ThemeProvider attribute="class" disableTransitionOnChange>
                    {children}
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
