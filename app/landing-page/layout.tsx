import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'LORO CRM | Comprehensive Enterprise Resource Planning & CRM System',
    description:
        'LORO CRM is a unified platform for managing customers, operations, sales, and resources across web and mobile interfaces. Work seamlessly online and offline with our modern, enterprise-grade solution designed for maximum flexibility.',
    keywords:
        'CRM, enterprise resource planning, ERP, business management, offline-first, mobile CRM, field operations, task management, route optimization, location tracking, client management, sales pipeline, lead tracking, inventory management, multi-tenant',
    openGraph: {
        title: 'LORO CRM - Unified Enterprise Management System',
        description: 'The comprehensive business platform that works seamlessly online and offline for field and office staff',
        type: 'website',
        images: ['/og-image.png'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'LORO CRM - Online & Offline Business Management',
        description: 'Comprehensive CRM system with web dashboard and mobile app for modern businesses',
        images: ['/twitter-image.png'],
    },
};

export default function LandingPageLayout({ children }: { children: React.ReactNode }) {
    return children;
}
