import { LeadFilterParams } from '@/lib/types/lead';
import { LeadsFilter } from './leads-filter';

interface LeadsHeaderProps {
    onApplyFilters: (filters: LeadFilterParams) => void;
    onClearFilters: () => void;
    onAddLead: () => void;
}

export function LeadsHeader({ onApplyFilters, onClearFilters, onAddLead }: LeadsHeaderProps) {
    return (
        <div className="flex items-center justify-between px-8 py-4">
            <LeadsFilter onApplyFilters={onApplyFilters} onClearFilters={onClearFilters} />
        </div>
    );
}
