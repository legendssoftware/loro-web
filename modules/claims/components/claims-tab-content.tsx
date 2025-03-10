import { memo } from 'react';
import { AppLoader } from '@/components/loaders/page-loader';
import { ClaimsKanban } from './claims-kanban';
import { TaskPagination } from '@/components/ui/pagination';
import { Claim, ClaimStatus } from '@/lib/types/claim';

interface ClaimsTabContentProps {
    activeTab: string;
    isLoading: boolean;
    error: Error | null;
    claimsByStatus: Record<ClaimStatus, Claim[]>;
    pagination: {
        page: number;
        totalPages: number;
    };
    onUpdateClaimStatus: (claimId: number, newStatus: string) => void;
    onDeleteClaim: (claimId: number) => void;
    onAddClaim: () => void;
    onPageChange: (page: number) => void;
}

// Main Claims tab content component
const ClaimsContent = memo(
    ({
        claimsByStatus,
        pagination,
        onUpdateClaimStatus,
        onDeleteClaim,
        onAddClaim,
        onPageChange,
    }: Omit<ClaimsTabContentProps, 'activeTab' | 'isLoading' | 'error'>) => {
        return (
            <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-hidden">
                    <ClaimsKanban
                        claimsByStatus={claimsByStatus}
                        onUpdateStatus={onUpdateClaimStatus}
                        onDelete={onDeleteClaim}
                        onAddClaim={onAddClaim}
                    />
                </div>
                <div className="px-4 py-3">
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

ClaimsContent.displayName = 'ClaimsContent';

// Reports tab content
const ReportsContent = memo(() => {
    return (
        <div className="w-full h-full overflow-hidden">
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-lg font-thin uppercase font-body">
                    Claim Reports
                </p>
                <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                    Claims reports functionality activating soon
                </p>
            </div>
        </div>
    );
});

ReportsContent.displayName = 'ReportsContent';

// Analytics tab content
const AnalyticsContent = memo(() => {
    return (
        <div className="w-full h-full overflow-hidden">
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-lg font-thin uppercase font-body">
                    Claim Analytics
                </p>
                <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                    Claims analytics functionality activating soon
                </p>
            </div>
        </div>
    );
});

AnalyticsContent.displayName = 'AnalyticsContent';

// Loading component
const LoadingContent = memo(() => {
    return (
        <div className="flex items-center justify-center flex-1 w-full h-full">
            <AppLoader />
        </div>
    );
});

LoadingContent.displayName = 'LoadingContent';

// Error component
const ErrorContent = memo(() => {
    return (
        <div className="py-12 text-center">
            <p className="text-xs font-normal uppercase text-destructive font-body">
                Failed to load claims. Please try again.
            </p>
        </div>
    );
});

ErrorContent.displayName = 'ErrorContent';

// Main component that switches between tab contents
function ClaimsTabContentComponent({
    activeTab,
    isLoading,
    error,
    claimsByStatus,
    pagination,
    onUpdateClaimStatus,
    onDeleteClaim,
    onAddClaim,
    onPageChange,
}: ClaimsTabContentProps) {
    if (isLoading) {
        return <LoadingContent />;
    }

    if (error) {
        return <ErrorContent />;
    }

    switch (activeTab) {
        case 'claims':
            return (
                <ClaimsContent
                    claimsByStatus={claimsByStatus}
                    pagination={pagination}
                    onUpdateClaimStatus={onUpdateClaimStatus}
                    onDeleteClaim={onDeleteClaim}
                    onAddClaim={onAddClaim}
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

export const ClaimsTabContent = memo(ClaimsTabContentComponent);
