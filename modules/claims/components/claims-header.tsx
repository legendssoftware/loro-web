import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
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
    onAddClaim,
}: ClaimsHeaderProps) {
    return (
        <div className="flex items-center justify-end gap-2 px-2">
            <ClaimsFilter
                onApplyFilters={onApplyFilters}
                onClearFilters={onClearFilters}
            />
            <Button onClick={onAddClaim} size="sm">
                <PlusCircle className="w-4 h-4 mr-2" />
                <p className="font-normal uppercase text-[10px] font-body">
                    Add Claim
                </p>
            </Button>
        </div>
    );
}

export const ClaimsHeader = memo(ClaimsHeaderComponent);
