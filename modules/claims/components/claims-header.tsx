import { memo } from 'react';
import { ClaimsFilter } from './claims-filter';
import { ClaimFilterParams } from '@/lib/types/claim';

interface ClaimsHeaderProps {
    onApplyFilters: (filters: ClaimFilterParams) => void;
    onClearFilters: () => void;
    onAddClaim?: () => void;
}

function ClaimsHeaderComponent({
    onApplyFilters,
    onClearFilters,
}: ClaimsHeaderProps) {
    return (
        <div className="flex items-center justify-end gap-2 px-2">
            <ClaimsFilter
                onApplyFilters={onApplyFilters}
                onClearFilters={onClearFilters}
            />
        </div>
    );
}

export const ClaimsHeader = memo(ClaimsHeaderComponent);
