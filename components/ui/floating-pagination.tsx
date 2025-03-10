import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface FloatingPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export function FloatingPagination({
    currentPage,
    totalPages,
    onPageChange,
    className,
}: FloatingPaginationProps) {
    // Remove the condition that hides pagination when there's only one page
    // if (totalPages <= 1) {
    //   return null;
    // }

    const goToPrevPage = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    // Ensure minimum value for totalPages
    const displayTotalPages = Math.max(1, totalPages);
    const displayCurrentPage = Math.min(
        Math.max(1, currentPage),
        displayTotalPages,
    );

    return (
        <div
            className={cn(
                'fixed bottom-8 right-8 flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-border rounded-full px-3 py-2 shadow-md z-50',
                className,
            )}
        >
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={goToPrevPage}
                disabled={displayCurrentPage <= 1}
            >
                <ChevronLeft className="w-4 h-4" />
                <span className="sr-only">Previous page</span>
            </Button>

            <span className="text-sm font-thin font-body">
                {displayCurrentPage}/{displayTotalPages}
            </span>

            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={goToNextPage}
                disabled={displayCurrentPage >= displayTotalPages}
            >
                <ChevronRight className="w-4 h-4" />
                <span className="sr-only">Next page</span>
            </Button>
        </div>
    );
}
