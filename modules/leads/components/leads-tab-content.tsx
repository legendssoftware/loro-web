import { memo } from 'react';
import { AppLoader } from '@/components/loaders/page-loader';
import { LeadsKanban } from './leads-kanban';
import { TaskPagination } from '@/components/ui/pagination';
import { Lead, LeadStatus } from '@/lib/types/lead';

interface LeadsTabContentProps {
    activeTab: string;
    isLoading: boolean;
    error: Error | null;
    leadsByStatus: Record<LeadStatus, Lead[]>;
    pagination: {
        page: number;
        totalPages: number;
    };
    onUpdateLeadStatus: (leadId: number, newStatus: string) => void;
    onDeleteLead: (leadId: number) => void;
    onAddLead: () => void;
    onPageChange: (page: number) => void;
}

// Main Leads tab content component
const LeadsContent = memo(
    ({
        leadsByStatus,
        pagination,
        onUpdateLeadStatus,
        onDeleteLead,
        onAddLead,
        onPageChange,
    }: Omit<LeadsTabContentProps, 'activeTab' | 'isLoading' | 'error'>) => {
        return (
            <div className='flex flex-col h-full overflow-hidden'>
                <div className='flex-1 overflow-hidden'>
                    <LeadsKanban
                        leadsByStatus={leadsByStatus}
                        onUpdateLeadStatus={onUpdateLeadStatus}
                        onDeleteLead={onDeleteLead}
                        onAddLead={onAddLead}
                    />
                </div>
                <div className='px-4 py-3'>
                    <TaskPagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={onPageChange}
                    />
                </div>
            </div>
        );
    },
);

LeadsContent.displayName = 'LeadsContent';

// Reports tab content
const ReportsContent = memo(() => {
    return (
        <div className='h-full overflow-hidden'>
            <div className='flex flex-col items-center justify-center h-full'>
                <p className='text-lg font-thin uppercase font-body'>Lead Reports</p>
                <p className='text-xs font-thin uppercase text-muted-foreground font-body'>
                    Lead reports functionality activating soon
                </p>
            </div>
        </div>
    );
});

ReportsContent.displayName = 'ReportsContent';

// Analytics tab content
const AnalyticsContent = memo(() => {
    return (
        <div className='w-full h-full overflow-hidden'>
            <div className='flex flex-col items-center justify-center w-full h-full'>
                <p className='text-lg font-thin uppercase font-body'>Lead Analytics</p>
                <p className='text-xs font-thin uppercase text-muted-foreground font-body'>
                    Lead analytics functionality activating soon
                </p>
            </div>
        </div>
    );
});

AnalyticsContent.displayName = 'AnalyticsContent';

// Loading component
const LoadingContent = memo(() => {
    return (
        <div className='flex items-center justify-center flex-1 w-full h-full'>
            <AppLoader />
        </div>
    );
});

LoadingContent.displayName = 'LoadingContent';

// Error component
const ErrorContent = memo(() => {
    return (
        <div className='py-12 text-center'>
            <p className='text-xs font-normal uppercase text-destructive font-body'>
                Failed to load leads. Please try again.
            </p>
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
    pagination,
    onUpdateLeadStatus,
    onDeleteLead,
    onAddLead,
    onPageChange,
}: LeadsTabContentProps) {
    if (isLoading) {
        return <LoadingContent />;
    }

    if (error) {
        return <ErrorContent />;
    }

    switch (activeTab) {
        case 'leads':
            return (
                <LeadsContent
                    leadsByStatus={leadsByStatus}
                    pagination={pagination}
                    onUpdateLeadStatus={onUpdateLeadStatus}
                    onDeleteLead={onDeleteLead}
                    onAddLead={onAddLead}
                    onPageChange={onPageChange}
                />
            );
        case 'reports':
            return <ReportsContent />;
        case 'analytics':
            return <AnalyticsContent />;
        default:
            return null;
    }
}

export const LeadsTabContent = memo(LeadsTabContentComponent);
