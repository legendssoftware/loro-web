'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quotation, StatusColors } from '@/lib/types/quotation';
import { memo, useState, useCallback } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useQuotationDetailsModal } from '@/hooks/use-modal-store';
import {
    CreditCard,
    Calendar,
    Clock,
    User,
    Package,
    FileDown,
    PhoneCall,
    Mail,
    MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
} from '@/components/ui/sheet';

interface QuotationCardProps {
    quotation: Quotation;
    onDragStart: (quotationId: number) => void;
    index?: number;
}

// Define action types for the sheets
type ActionType = 'call' | 'email' | 'message' | null;

function QuotationCardComponent({
    quotation,
    onDragStart,
    index = 0,
}: QuotationCardProps) {
    const { onOpen } = useQuotationDetailsModal();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [activeSheet, setActiveSheet] = useState<ActionType>(null);

    // Use CSS variables for animation delay
    const cardStyle = {
        '--quotation-delay': `${Math.min(index * 50, 500)}ms`,
    } as React.CSSProperties;

    const getClientInitials = useCallback(() => {
        if (!quotation.client?.name) return 'CL';
        const nameParts = quotation.client.name.trim().split(' ');
        return nameParts.length > 1
            ? `${nameParts[0][0]}${nameParts[1][0]}`
            : nameParts[0].substring(0, 2);
    }, [quotation.client?.name]);

    const handleDragStart = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', quotation.uid.toString());
            onDragStart(quotation.uid);
        },
        [onDragStart, quotation.uid],
    );

    const handleClick = useCallback(() => {
        onOpen(quotation);
    }, [onOpen, quotation]);

    const handleActionClick = useCallback(
        (e: React.MouseEvent, action: ActionType) => {
            e.stopPropagation(); // Prevent the card click event
            setActiveSheet(action);
        },
        [],
    );

    const closeSheet = useCallback(() => {
        setActiveSheet(null);
    }, []);

    // Get sheet title based on action type
    const getSheetTitle = () => {
        switch (activeSheet) {
            case 'call':
                return `Call Client`;
            case 'email':
                return `Email Client`;
            case 'message':
                return `Message Client`;
            default:
                return '';
        }
    };

    // Get sheet description based on action type
    const getSheetDescription = () => {
        switch (activeSheet) {
            case 'call':
                return 'Call this client directly from the app using templates';
            case 'email':
                return 'Send an email to this client using predefined templates';
            case 'message':
                return 'Send a message to this client using predefined templates';
            default:
                return '';
        }
    };

    return (
        <>
            <div
                className="p-3 overflow-hidden border rounded-md shadow-sm cursor-pointer bg-card border-border/50 hover:shadow-md animate-claim-appear"
                style={cardStyle}
                draggable
                onDragStart={handleDragStart}
                onClick={handleClick}
            >
                <div className="flex items-center justify-between w-full mb-2">
                    {/* Amount & Title */}
                    <div className="flex-1 w-full min-w-0">
                        <div className="flex items-center justify-between w-full gap-2">
                            <h3 className="text-sm font-medium uppercase truncate text-card-foreground font-body">
                                #{quotation?.quotationNumber}
                            </h3>
                            <div className="flex items-center gap-2">
                                {quotation.pdfURL && (
                                    <Link
                                        href={quotation.pdfURL}
                                        target="_blank"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <FileDown
                                            size={18}
                                            strokeWidth={1.5}
                                            className="cursor-pointer text-muted-foreground/50 hover:text-muted-foreground"
                                        />
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge
                                variant="outline"
                                className={cn(
                                    'text-[9px] font-normal uppercase font-body px-4 py-1 border-0',
                                    StatusColors[quotation.status].bg,
                                    StatusColors[quotation.status].text,
                                )}
                            >
                                {quotation.status.toUpperCase()}
                            </Badge>
                        </div>
                    </div>
                </div>
                {/* Quotation Details */}
                <div className="mt-2 space-y-4 text-xs text-muted-foreground">
                    {/* Client Info */}
                    <div className="flex items-center mb-2">
                        <User className="w-4 h-4 mr-1 text-blue-600" />
                        <span className="text-[12px] font-normal uppercase font-body text-blue-600">
                            {quotation.client?.name || 'No Client'}
                        </span>
                    </div>
                    {/* Total Amount */}
                    <div className="flex items-center mb-2">
                        <CreditCard className="w-4 h-4 mr-1" />
                        <span className="text-[12px] font-normal font-body">
                            {formatCurrency(quotation.totalAmount)}
                        </span>
                    </div>
                    {/* Quotation Meta Information */}
                    <div className="grid grid-cols-2 gap-1">
                        {/* Items Count */}
                        <div className="flex items-center">
                            <Package className="w-3 h-3 mr-1" />
                            <span className="text-[10px] font-normal uppercase font-body">
                                X {quotation.totalItems}
                            </span>
                        </div>
                        {/* Created Date */}
                        <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span className="text-[10px] font-normal uppercase font-body">
                                {formatDate(quotation.quotationDate)}
                            </span>
                        </div>
                        {/* Valid Until (if available) */}
                        {quotation.validUntil && (
                            <div className="flex items-center col-span-2">
                                <Clock className="w-3 h-3 mr-1" />
                                <span className="text-[10px] font-normal uppercase font-body">
                                    Valid Until:{' '}
                                    {formatDate(quotation.validUntil)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                {/* Client avatar at the bottom */}
                {quotation.client && (
                    <div className="flex items-center justify-start gap-1 pt-2 mt-2 border-t border-border/20">
                        <Avatar className="border h-9 w-9 border-primary">
                            <AvatarImage
                                src={quotation.client?.logo || ''}
                                className="object-contain p-1"
                            />
                            <AvatarFallback className="text-[10px] font-thin font-body">
                                {getClientInitials()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] font-normal text-muted-foreground font-body">
                            {quotation.client.name}
                        </span>
                    </div>
                )}
            </div>
            {/* Delete confirmation dialog */}
            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the quotation.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => {
                                // Implement delete functionality later
                                setIsDeleteDialogOpen(false);
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Action Sheets */}
            <Sheet
                open={activeSheet !== null}
                onOpenChange={(open) => !open && setActiveSheet(null)}
            >
                <SheetContent side="right" className="sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="text-xs font-normal uppercase font-body">
                            {getSheetTitle()}
                        </SheetTitle>
                        <SheetDescription className="text-[10px] font-normal font-body">
                            {getSheetDescription()}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-6">
                        {activeSheet === 'call' && (
                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg border-border bg-background/50">
                                    <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                        Call Templates
                                    </h3>
                                    <p className="text-[10px] text-muted-foreground font-body">
                                        You will be able to use predefined call
                                        scripts and templates to ensure
                                        consistent communication with clients.
                                    </p>
                                </div>

                                <div className="flex items-center p-3 border rounded-lg border-border">
                                    <PhoneCall className="w-5 h-5 mr-3 text-primary" />
                                    <div>
                                        <p className="text-xs font-medium font-body">
                                            {quotation.client?.phone ||
                                                'No phone available'}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground font-body">
                                            Click to call directly
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSheet === 'email' && (
                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg border-border bg-background/50">
                                    <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                        Email Templates
                                    </h3>
                                    <p className="text-[10px] text-muted-foreground font-body">
                                        You will be able to select from various
                                        email templates designed for different
                                        stages of the client communication
                                        process.
                                    </p>
                                </div>

                                <div className="flex items-center p-3 border rounded-lg border-border">
                                    <Mail className="w-5 h-5 mr-3 text-primary" />
                                    <div>
                                        <p className="text-xs font-medium font-body">
                                            {quotation.client?.email ||
                                                'No email available'}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground font-body">
                                            Send personalized emails
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSheet === 'message' && (
                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg border-border bg-background/50">
                                    <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                        Message Templates
                                    </h3>
                                    <p className="text-[10px] text-muted-foreground font-body">
                                        You will be able to send text messages
                                        using predefined templates, making
                                        communication with clients efficient and
                                        consistent.
                                    </p>
                                </div>

                                <div className="flex items-center p-3 border rounded-lg border-border">
                                    <MessageSquare className="w-5 h-5 mr-3 text-primary" />
                                    <div>
                                        <p className="text-xs font-medium font-body">
                                            {quotation.client?.phone ||
                                                'No phone available'}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground font-body">
                                            Send personalized messages
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <SheetFooter>
                        <SheetClose asChild>
                            <Button
                                variant="outline"
                                className="text-xs font-normal uppercase font-body"
                            >
                                Close
                            </Button>
                        </SheetClose>
                        <Button
                            type="button"
                            disabled
                            className="text-xs font-normal text-white uppercase font-body"
                        >
                            Coming Soon
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}

export default memo(QuotationCardComponent);
export { QuotationCardComponent as QuotationCard };
