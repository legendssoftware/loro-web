'use client';

import React, { Suspense } from 'react';
import { FeedbackForm } from './components/feedback-form';

const FeedbackPage: React.FC = () => {
    return (
        <div className="container py-8 mx-auto">
            <div className="flex flex-col items-center justify-center max-w-3xl gap-2 mx-auto mb-8 text-center">
                <h1 className="text-xl font-normal uppercase font-body">
                    Share Your Feedback
                </h1>
                <p className="text-xs uppercase text-muted-foreground font-body">
                    We value your opinion and are committed to continuously
                    improving our services.
                </p>
            </div>

            <Suspense fallback={<div className="flex items-center justify-center w-full h-64"><div className="w-8 h-8 border-4 rounded-full border-primary border-t-transparent animate-spin"></div></div>}>
                <FeedbackForm />
            </Suspense>
        </div>
    );
};

export default FeedbackPage;
