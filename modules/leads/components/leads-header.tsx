import { LeadFilterParams } from '@/lib/types/lead';
import { LeadsFilter } from './leads-filter';

interface LeadsHeaderProps {
    onApplyFilters: (filters: LeadFilterParams) => void;
    onClearFilters: () => void;
    onAddLead: () => void;
    onImportClick?: () => void;
}

export function LeadsHeader({ onApplyFilters, onClearFilters, onAddLead, onImportClick }: LeadsHeaderProps) {
    return (
        <div className="flex items-center justify-end px-2">
            <LeadsFilter 
                onApplyFilters={onApplyFilters} 
                onClearFilters={onClearFilters}
                onImportClick={onImportClick}
            />
        </div>
    );
}
