'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ThumbsUp, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ThankYouPage: React.FC = () => {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-primary/10">
                <ThumbsUp className="w-8 h-8 text-primary" strokeWidth={1.5} />
            </div>
            <h1 className="mb-2 text-xl font-normal uppercase font-body">
                Thank You for Your Feedback!
            </h1>
            <p className="text-xs uppercase text-muted-foreground font-body">
                We appreciate you taking the time to share your thoughts with
                us. Your feedback is valuable and helps us improve our services.
            </p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <Button
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 text-xs font-light uppercase h-9 font-body"
                >
                    <Home className="w-4 h-4" strokeWidth={1.5} />
                    <p className="text-xs uppercase text-muted-foreground font-body">
                        Return Home
                    </p>
                </Button>
                <Button
                    onClick={() => router.push('/feedback')}
                    className="flex items-center gap-2 text-xs font-light uppercase h-9 font-body"
                >
                    <p className="text-xs uppercase text-muted-foreground font-body">
                        Submit Another Feedback
                    </p>
                </Button>
            </div>
        </div>
    );
};

export default ThankYouPage;
