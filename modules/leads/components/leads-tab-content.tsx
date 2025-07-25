import { memo } from 'react';
import { AppHoneycombLoader } from '@/components/loaders/honeycomb-loader';
import { LeadsKanban } from './leads-kanban';
import { Lead, LeadStatus } from '@/lib/types/lead';
import { FolderMinus } from 'lucide-react';

interface LeadsTabContentProps {
    activeTab: string;
    isLoading: boolean;
    error: Error | null;
    leadsByStatus: Record<LeadStatus, Lead[]>;
    onUpdateLeadStatus: (leadId: number, newStatus: string) => void;
    onUpdateLead: (leadId: number, updateData: any) => void;
    onDeleteLead: (leadId: number) => void;
    onAddLead: () => void;
}

// Main Leads tab content component
const LeadsContent = memo(
    ({
        leadsByStatus,
        onUpdateLeadStatus,
        onUpdateLead,
        onDeleteLead,
        onAddLead,
    }: Omit<LeadsTabContentProps, 'activeTab' | 'isLoading' | 'error'>) => {
        return (
            <div className="flex flex-col w-full h-full overflow-hidden">
                <div className="flex-1 w-full overflow-hidden">
                    <LeadsKanban
                        leadsByStatus={leadsByStatus}
                        onUpdateLeadStatus={onUpdateLeadStatus}
                        onUpdateLead={onUpdateLead}
                        onDeleteLead={onDeleteLead}
                        onAddLead={onAddLead}
                    />
                </div>
            </div>
        );
    },
);

// Loading component
const LoadingContent = memo(() => {
    return (
        <div className="flex items-center justify-center flex-1 w-full h-full">
            <AppHoneycombLoader size="sm" />
        </div>
    );
});

LoadingContent.displayName = 'LoadingContent';

// Error component
const ErrorContent = memo(() => {
    return (
        <div className="h-full overflow-hidden">
            <div className="flex flex-col items-center justify-center h-full gap-2">
                <FolderMinus
                    className="text-red-500"
                    size={50}
                    strokeWidth={1}
                />
                <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                    Please re-try
                </p>
            </div>
        </div>
    );
});

ErrorContent.displayName = 'ErrorContent';

// Main component that switches between tab contents
function LeadsTabContentComponent({
    activeTab,
    isLoading,
    error,
    leadsByStatus,
    onUpdateLeadStatus,
    onUpdateLead,
    onDeleteLead,
    onAddLead,
}: LeadsTabContentProps) {
    // If loading, show loader
    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-full h-96">
                <AppHoneycombLoader />
            </div>
        );
    }

    // If error, show error message
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-96">
                <FolderMinus
                    className="w-16 h-16 text-red-500"
                    strokeWidth={1.2}
                />
                <p className="text-xs font-thin uppercase font-body">
                    {error.message || 'Failed to load leads data.'}
                </p>
            </div>
        );
    }

    switch (activeTab) {
        case 'leads':
            return (
                <LeadsContent
                    leadsByStatus={leadsByStatus}
                    onUpdateLeadStatus={onUpdateLeadStatus}
                    onUpdateLead={onUpdateLead}
                    onDeleteLead={onDeleteLead}
                    onAddLead={onAddLead}
                />
            );
        default:
            return null;
    }
}

export const LeadsTabContent = memo(LeadsTabContentComponent);
