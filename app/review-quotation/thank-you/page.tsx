import { AppLoader } from '@/components/ui/app-loader';
import ThankYouPage from '@/modules/quotations/review-quotation/thank-you-page';
import { Suspense } from 'react';

export default function ThankYou() {
    return (
        <Suspense fallback={<AppLoader />}>
            <ThankYouPage />
        </Suspense>
    );
}
