'use client';

import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface FloatingPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    maxVisiblePages?: number;
}

export function FloatingPagination({
    currentPage,
    totalPages,
    onPageChange,
    maxVisiblePages = 5,
}: FloatingPaginationProps) {
    // Ensure current page is always valid
    const [localCurrentPage, setLocalCurrentPage] = useState(currentPage);

    // Update local state when prop changes
    useEffect(() => {
        setLocalCurrentPage(currentPage);
    }, [currentPage]);

    // Calculate visible page numbers
    const visiblePages = useMemo(() => {
        const pages: (number | 'ellipsis')[] = [];

        if (totalPages <= maxVisiblePages) {
            // If total pages is less than max visible, show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            // Calculate start and end of the middle section
            let startPage = Math.max(
                2,
                localCurrentPage - Math.floor(maxVisiblePages / 2) + 1,
            );
            let endPage = Math.min(
                totalPages - 1,
                startPage + maxVisiblePages - 3,
            );

            // Adjust if we're near the end
            if (endPage >= totalPages - 1) {
                startPage = Math.max(2, totalPages - maxVisiblePages + 2);
                endPage = totalPages - 1;
            }

            // Add ellipsis before middle section if needed
            if (startPage > 2) {
                pages.push('ellipsis');
            }

            // Add middle section
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            // Add ellipsis after middle section if needed
            if (endPage < totalPages - 1) {
                pages.push('ellipsis');
            }

            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }

        return pages;
    }, [localCurrentPage, totalPages, maxVisiblePages]);

    // Handle page change
    const handlePageChange = (page: number) => {
        if (page !== localCurrentPage && page >= 1 && page <= totalPages) {
            setLocalCurrentPage(page);
            onPageChange(page);
        }
    };

    // Skip to previous or next page
    const goToPreviousPage = () => {
        if (localCurrentPage > 1) {
            handlePageChange(localCurrentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (localCurrentPage < totalPages) {
            handlePageChange(localCurrentPage + 1);
        }
    };

    // If there are no pages or only one page, don't show pagination
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="fixed flex items-center gap-1 px-4 py-2 transform -translate-x-1/2 border rounded-full shadow-md bottom-4 left-1/2 bg-card">
            {/* Previous button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousPage}
                disabled={localCurrentPage === 1}
                className="w-8 h-8"
            >
                <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Page numbers */}
            {visiblePages.map((page, index) =>
                page === 'ellipsis' ? (
                    <span key={`ellipsis-${index}`} className="px-2">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </span>
                ) : (
                    <Button
                        key={page}
                        variant={
                            page === localCurrentPage ? 'default' : 'ghost'
                        }
                        size="icon"
                        onClick={() => handlePageChange(page as number)}
                        className={`w-8 h-8 font-normal text-[10px] font-body ${
                            page === localCurrentPage
                                ? 'bg-primary text-white'
                                : 'bg-transparent text-muted-foreground'
                        }`}
                    >
                        {page}
                    </Button>
                ),
            )}

            {/* Next button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={goToNextPage}
                disabled={localCurrentPage === totalPages}
                className="w-8 h-8"
            >
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
    );
}
