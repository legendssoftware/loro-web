'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { QuotationsFilter } from './quotations-filter';
import { QuotationFilterParams } from '@/lib/types/quotation';

interface QuotationsHeaderProps {
    onApplyFilters: (filters: QuotationFilterParams) => void;
    onClearFilters: () => void;
    onAddQuotation?: () => void;
}

function QuotationsHeaderComponent({
    onApplyFilters,
    onClearFilters,
    onAddQuotation,
}: QuotationsHeaderProps) {
    return (
        <div className="flex-shrink-0 px-8 py-3 border-b border-border/10">
            <div className="flex items-center justify-between w-full">
                <QuotationsFilter
                    onApplyFilters={onApplyFilters}
                    onClearFilters={onClearFilters}
                />
            </div>
        </div>
    );
}

export const QuotationsHeader = memo(QuotationsHeaderComponent);
