'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quotation, StatusColors } from '@/lib/types/quotation';
import { OrderStatus } from '@/lib/enums/status.enums';
import { memo, useState, useCallback } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    MoreHorizontal,
    Trash2,
    FileText,
    User,
    Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuotationCardProps {
    quotation: Quotation;
    onDragStart: (quotationId: number) => void;
    index?: number;
}

function QuotationCardComponent({
    quotation,
    onDragStart,
    index = 0,
}: QuotationCardProps) {
    const { onOpen } = useQuotationDetailsModal();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

    // Handle status change via dropdown
    const handleStatusChange = (newStatus: OrderStatus) => {
        // Implement status change later
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
                <div className="flex items-center justify-between mb-2">
                    {/* Amount & Title */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium uppercase truncate text-card-foreground font-body">
                            #{quotation.quotationNumber}
                        </h3>
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
                    {/* Actions menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="p-1 rounded-full hover:bg-muted">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <h3 className="px-2 py-1.5 text-xs font-medium">
                                Change Status
                            </h3>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(OrderStatus.PENDING);
                                }}
                            >
                                <span className="text-[10px] font-normal uppercase font-body">
                                    Pending
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(OrderStatus.INPROGRESS);
                                }}
                            >
                                <span className="text-[10px] font-normal uppercase font-body">
                                    In Progress
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(OrderStatus.APPROVED);
                                }}
                            >
                                <span className="text-[10px] font-normal uppercase font-body">
                                    Approved
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(OrderStatus.REJECTED);
                                }}
                            >
                                <span className="text-[10px] font-normal uppercase font-body">
                                    Rejected
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(OrderStatus.COMPLETED);
                                }}
                            >
                                <span className="text-[10px] font-normal uppercase font-body">
                                    Completed
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDeleteDialogOpen(true);
                                }}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                <span className="text-[10px] font-normal uppercase font-body">
                                    Delete
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                            <AvatarImage src={quotation.client?.photo || ''} />
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
        </>
    );
}

export default memo(QuotationCardComponent);
export { QuotationCardComponent as QuotationCard };
