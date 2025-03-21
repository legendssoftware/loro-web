'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ThankYouPage() {
    const searchParams = useSearchParams();
    const action = searchParams.get('action');
    const [status, setStatus] = useState<'approved' | 'declined' | 'processed'>(
        action === 'approve'
            ? 'approved'
            : action === 'decline'
              ? 'declined'
              : 'processed',
    );

    return (
        <div className="container flex flex-col h-screen max-w-5xl px-4 py-16 mx-auto">
            <div className="flex items-center justify-center mb-8">
                <h1 className="text-2xl font-bold text-primary">LORO</h1>
            </div>

            <div className="flex flex-col items-center justify-center flex-1 max-w-2xl mx-auto text-center">
                {status === 'approved' ? (
                    <CheckCircle className="w-24 h-24 mb-6 text-green-500" />
                ) : status === 'declined' ? (
                    <XCircle className="w-24 h-24 mb-6 text-red-500" />
                ) : (
                    <CheckCircle className="w-24 h-24 mb-6 text-blue-500" />
                )}

                <h1 className="mb-4 text-3xl font-bold">
                    {status === 'approved'
                        ? 'Quotation Approved'
                        : status === 'declined'
                          ? 'Quotation Declined'
                          : 'Response Recorded'}
                </h1>

                <p className="mb-8 text-lg text-muted-foreground">
                    {status === 'approved'
                        ? 'Thank you for approving the quotation. We will process your order and be in touch shortly.'
                        : status === 'declined'
                          ? 'Thank you for your response. We have recorded that you declined this quotation.'
                          : 'Thank you for your response to our quotation.'}
                </p>

                <div className="mb-6 text-sm text-muted-foreground">
                    {status === 'approved' ? (
                        <p>
                            Our team will contact you soon with the next steps.
                            If you have any questions, please don't hesitate to
                            reach out to us.
                        </p>
                    ) : status === 'declined' ? (
                        <p>
                            If you'd like to discuss alternatives or have any
                            questions, please feel free to contact us.
                        </p>
                    ) : (
                        <p>
                            If you have any questions about your response or
                            need to make changes, please contact us.
                        </p>
                    )}
                </div>

                <div>
                    <Link href="https://loro.co.za" target="_blank">
                        <Button size="lg" variant="outline" className="px-8">
                            Return to Website
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
