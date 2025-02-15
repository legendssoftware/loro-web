import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LORO CRM | Enterprise-Grade Business Management Solution',
  description: 'LORO CRM - Your all-in-one business command center. Manage tasks, staff, quotations, claims, leads, and inventory with real-time updates and seamless integration.',
  keywords: 'CRM, business management, task management, staff management, quotations, claims management, lead tracking, inventory management, real-time updates',
  openGraph: {
    title: 'LORO CRM - Enterprise Business Command Center',
    description: 'Streamline your business operations with our comprehensive mobile-first platform',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LORO CRM - Business Management Solution',
    description: 'Complete control over your business operations with real-time updates',
    images: ['/twitter-image.png'],
  },
};

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 