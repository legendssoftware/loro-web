import React from 'react';
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

            <FeedbackForm />
        </div>
    );
};

export default FeedbackPage;
