'use client';

import { usePathname } from 'next/navigation';

export function AlertBanner() {
    const pathname = usePathname();
    
    // Define auth/public pages where banner should NOT show
    const authPages = [
        '/sign-in',
        '/sign-up',
        '/forgot-password',
        '/new-password',
        '/verify-email',
        '/verify-otp',
        '/landing-page',
        '/review-quotation',
        '/feedback'
    ];
    
    // Don't show banner on auth/public pages
    if (authPages.some(page => pathname?.startsWith(page))) {
        return null;
    }
    
    // Don't show on root path (which might be landing page)
    if (pathname === '/') {
        return null;
    }

    return (
        <div className='fixed bottom-0 left-0 right-0 z-50 w-full mx-auto bg-red-600 border-t border-red-700 rounded-none'>
            <div className='container px-4 py-3 mx-auto'>
                <div className='items-center justify-center w-full text-sm font-medium text-center'>
                    <p className='text-sm font-semibold text-white uppercase font-body'>🚧 System Maintenance</p>
                    <p className='text-xs leading-none font-normal mt-0.5 text-white font-body'>
                        The system is undergoing maintenance until Tuesday morning. Some features may be temporarily unavailable.
                    </p>
                </div>
            </div>
        </div>
    );
}