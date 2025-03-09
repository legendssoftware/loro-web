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

function ClaimsHeaderComponent({ onApplyFilters, onClearFilters, onAddClaim }: ClaimsHeaderProps) {
    return (
        <div className='flex-shrink-0 px-8 py-3 border-b border-border/10'>
            <div className='flex items-center justify-between w-full'>
                <ClaimsFilter onApplyFilters={onApplyFilters} onClearFilters={onClearFilters} />
                <Button onClick={onAddClaim} className='ml-4' size='sm'>
                    <PlusCircle className='w-4 h-4 mr-2' />
                    <p className='text-xs font-normal uppercase font-body'>Add Claim</p>
                </Button>
            </div>
        </div>
    );
}

export const ClaimsHeader = memo(ClaimsHeaderComponent);
