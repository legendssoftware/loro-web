'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { CheckCircle, Clock, FileText, XCircle } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { OrderStatus } from '@/lib/enums/status.enums';
import axios from 'axios';

interface QuotationItem {
    quantity: number;
    product: {
        uid: number;
        name: string;
        sku?: string;
        productRef?: string;
    };
    unitPrice: number;
    totalPrice: number;
}

interface Quotation {
    uid: number;
    quotationNumber: string;
    totalAmount: number;
    totalItems: number;
    status: OrderStatus;
    quotationDate: string;
    validUntil: string;
    client: {
        uid: number;
        name: string;
        email: string;
    };
    quotationItems: QuotationItem[];
    notes?: string;
}

interface ValidationResponse {
    valid: boolean;
    quotation?: Quotation;
    message: string;
    actionPerformed?: boolean;
    actionResult?: {
        success: boolean;
        message: string;
    };
}

export default function ReviewQuotationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const action = searchParams.get('action');

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [quotation, setQuotation] = useState<Quotation | null>(null);
    const [comments, setComments] = useState('');

    useEffect(() => {
        if (!token) {
            setError(
                'No token provided. Please check your link and try again.',
            );
            setIsLoading(false);
            return;
        }

        const validateToken = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get<ValidationResponse>(
                    `${process.env.NEXT_PUBLIC_API_URL}/shop/quotation/validate-review-token`,
                    {
                        params: { token, action },
                    },
                );

                if (response.data.valid && response.data.quotation) {
                    setQuotation(response.data.quotation);

                    // If an action was performed automatically (via direct link)
                    if (
                        response.data.actionPerformed &&
                        response.data.actionResult?.success
                    ) {
                        // Redirect to thank you page
                        router.push(
                            `/review-quotation/thank-you?action=${action}`,
                        );
                        return;
                    }
                } else {
                    setError(response.data.message);
                }
            } catch (err) {
                setError('Failed to validate token. Please try again later.');
                console.error('Token validation error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        validateToken();
    }, [token, action, router]);

    const handleResponse = async (status: OrderStatus) => {
        if (!token) return;

        try {
            setIsSubmitting(true);
            const response = await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/shop/quotation/update-status-by-token`,
                {
                    token,
                    status,
                    comments: comments.trim() || undefined,
                },
            );

            if (response.data.success) {
                // Redirect to thank you page
                const action =
                    status === OrderStatus.APPROVED ? 'approve' : 'decline';
                router.push(`/review-quotation/thank-you?action=${action}`);
            } else {
                toast.error(
                    response.data.message ||
                        'Failed to update quotation status',
                );
            }
        } catch (err) {
            toast.error('An error occurred while processing your response');
            console.error('Submit error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const isExpired = () => {
        if (!quotation?.validUntil) return false;
        const validUntil = new Date(quotation.validUntil);
        const now = new Date();
        return validUntil < now;
    };

    const isAlreadyProcessed = () => {
        if (!quotation?.status) return false;
        return [
            OrderStatus.APPROVED,
            OrderStatus.REJECTED,
            OrderStatus.COMPLETED,
            OrderStatus.CANCELLED,
        ].includes(quotation.status);
    };

    if (isLoading) {
        return (
            <div className="container max-w-5xl px-4 py-16 mx-auto">
                <div className="flex items-center justify-center mb-8">
                    <Image
                        src="/images/logos/loro-logo-white.png"
                        alt="LORO Logo"
                        width={120}
                        height={50}
                        className="w-auto h-10"
                    />
                </div>
                <Card className="w-full max-w-4xl mx-auto">
                    <CardHeader>
                        <Skeleton className="w-3/4 h-8 mb-2" />
                        <Skeleton className="w-1/2 h-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Skeleton className="w-full h-24" />
                            <Skeleton className="w-full h-12" />
                            <Skeleton className="w-full h-12" />
                            <Skeleton className="w-full h-12" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="w-32 h-10 mr-4" />
                        <Skeleton className="w-32 h-10" />
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container max-w-5xl px-4 py-16 mx-auto">
                <div className="flex items-center justify-center mb-8">
                    <Image
                        src="/images/logos/loro-logo-white.png"
                        alt="LORO Logo"
                        width={120}
                        height={50}
                        className="w-auto h-10"
                    />
                </div>
                <Card className="w-full max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl">Error</CardTitle>
                        <CardDescription>
                            We encountered an issue with this quotation review
                            link
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center py-8 text-center">
                            <XCircle className="w-16 h-16 mb-4 text-red-500" />
                            <p className="mb-2 text-muted-foreground">
                                {error}
                            </p>
                            <p className="text-sm">
                                If you believe this is a mistake, please contact
                                our support team.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!quotation) {
        return null;
    }

    return (
        <div className="container max-w-5xl px-4 py-16 mx-auto">
            <div className="flex items-center justify-center mb-8">
                <Image
                    src="/images/logos/loro-logo-white.png"
                    alt="LORO Logo"
                    width={120}
                    height={50}
                    className="w-auto h-10"
                />
            </div>

            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">
                                Quotation Review
                            </CardTitle>
                            <CardDescription>
                                Reference: {quotation.quotationNumber}
                            </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            {isExpired() && (
                                <div className="flex items-center px-3 py-1 text-xs text-red-500 rounded-full bg-red-500/20">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Expired
                                </div>
                            )}
                            {isAlreadyProcessed() && (
                                <div className="flex items-center px-3 py-1 text-xs text-blue-500 rounded-full bg-blue-500/20">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    {quotation.status.charAt(0).toUpperCase() +
                                        quotation.status.slice(1).toLowerCase()}
                                </div>
                            )}
                            {!isExpired() && !isAlreadyProcessed() && (
                                <div className="flex items-center px-3 py-1 text-xs text-green-500 rounded-full bg-green-500/20">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Active
                                </div>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="mb-1 text-muted-foreground">Date</p>
                            <p className="font-medium">
                                {formatDate(quotation.quotationDate)}
                            </p>
                        </div>
                        <div>
                            <p className="mb-1 text-muted-foreground">
                                Valid Until
                            </p>
                            <p className="font-medium">
                                {formatDate(quotation.validUntil)}
                            </p>
                        </div>
                        <div>
                            <p className="mb-1 text-muted-foreground">Client</p>
                            <p className="font-medium">
                                {quotation.client.name}
                            </p>
                        </div>
                        <div>
                            <p className="mb-1 text-muted-foreground">Email</p>
                            <p className="font-medium">
                                {quotation.client.email}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="flex items-center mb-3 text-sm font-medium">
                            <FileText className="w-4 h-4 mr-2" />
                            Quotation Items
                        </h3>
                        <div className="overflow-hidden border rounded-md">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-left">
                                            Item
                                        </th>
                                        <th className="px-4 py-3 font-medium text-center">
                                            Qty
                                        </th>
                                        <th className="px-4 py-3 font-medium text-right">
                                            Unit Price
                                        </th>
                                        <th className="px-4 py-3 font-medium text-right">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {quotation.quotationItems.map(
                                        (item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">
                                                        {item.product.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {item.product.sku ||
                                                            item.product
                                                                .productRef ||
                                                            `ID: ${item.product.uid}`}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {formatCurrency(
                                                        item.unitPrice,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {formatCurrency(
                                                        item.totalPrice,
                                                    )}
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                                <tfoot className="bg-muted/20">
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="px-4 py-3 font-medium text-right"
                                        >
                                            Total:
                                        </td>
                                        <td className="px-4 py-3 font-bold text-right">
                                            {formatCurrency(
                                                quotation.totalAmount,
                                            )}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {quotation.notes && (
                        <div>
                            <h3 className="mb-2 text-sm font-medium">Notes</h3>
                            <div className="p-3 text-sm rounded-md bg-muted/20">
                                {quotation.notes}
                            </div>
                        </div>
                    )}

                    {!isAlreadyProcessed() && !isExpired() && (
                        <div>
                            <h3 className="mb-2 text-sm font-medium">
                                Your Comments (Optional)
                            </h3>
                            <Textarea
                                placeholder="Add any comments or feedback you'd like to share..."
                                className="w-full"
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                            />
                        </div>
                    )}
                </CardContent>

                <CardFooter
                    className={`${isAlreadyProcessed() || isExpired() ? 'justify-center' : 'justify-between'} flex-wrap gap-4`}
                >
                    {isAlreadyProcessed() ? (
                        <p className="text-center text-muted-foreground">
                            This quotation has already been{' '}
                            {quotation.status.toLowerCase()}. For any changes,
                            please contact our support team.
                        </p>
                    ) : isExpired() ? (
                        <p className="text-center text-muted-foreground">
                            This quotation has expired. Please contact our sales
                            team for a new quotation.
                        </p>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    handleResponse(OrderStatus.REJECTED)
                                }
                                disabled={isSubmitting}
                                className="flex-1 sm:flex-none"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Decline
                            </Button>
                            <Button
                                onClick={() =>
                                    handleResponse(OrderStatus.APPROVED)
                                }
                                disabled={isSubmitting}
                                className="flex-1 sm:flex-none"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                            </Button>
                        </>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
