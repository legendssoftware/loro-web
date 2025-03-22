import { AppLoader } from '@/components/ui/app-loader';
import ReviewQuotationPage from '@/modules/quotations/review-quotation/page';
import { Suspense } from 'react';

export default function ReviewQuotation() {
    return (
        <Suspense fallback={<AppLoader />}>
            <ReviewQuotationPage />
        </Suspense>
    );
}
