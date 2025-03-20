'use client';

import React, { Suspense } from 'react';
import { FeedbackForm } from './components/feedback-form';

export default function FeedbackPage() {
    return (
        <div
            className="relative flex flex-col items-center justify-center w-full min-h-screen"
            style={{
                backgroundImage:
                    'url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rcRWmJ3wUamu61uy3uz2BHS5rxJP3t.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'bottom center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Dark Overlay */}
            <div className="absolute inset-0 z-10 w-full h-full bg-black/70 backdrop-blur-sm" />

            {/* Content */}
            <div className="relative z-20 w-full max-w-3xl px-4 py-10 mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-2xl font-normal text-center text-white uppercase sm:text-3xl font-heading">
                        Thank You!
                    </h1>
                    <p className="text-xs uppercase text-white/70 font-body">
                        Please share your thoughts and suggestions to help us
                        improve.
                    </p>
                </div>

                <Suspense
                    fallback={
                        <div className="w-full p-8 space-y-4 text-center rounded-lg bg-white/5 backdrop-blur-md">
                            <div className="flex flex-col items-center justify-center gap-4">
                                <span className="animate-spin">
                                    <svg
                                        className="w-8 h-8 text-primary"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                </span>
                                <p className="text-sm text-white/70">
                                    Loading feedback form...
                                </p>
                            </div>
                        </div>
                    }
                >
                    <FeedbackForm />
                </Suspense>
            </div>
        </div>
    );
}
