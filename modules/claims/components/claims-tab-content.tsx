import { memo } from 'react';
import { AppLoader } from '@/components/loaders/page-loader';
import { ClaimsKanban } from './claims-kanban';
import { Claim, ClaimStatus } from '@/lib/types/claim';
import { FolderMinus } from 'lucide-react';

interface ClaimsTabContentProps {
    activeTab: string;
    isLoading: boolean;
    error: Error | null;
    claimsByStatus: Record<ClaimStatus, Claim[]>;
    onUpdateClaimStatus: (claimId: number, newStatus: string) => void;
    onDeleteClaim: (claimId: number) => void;
    onAddClaim: () => void;
}

// Main Claims tab content component
const ClaimsContent = memo(
    ({
        claimsByStatus,
        onUpdateClaimStatus,
        onDeleteClaim,
        onAddClaim,
    }: Omit<ClaimsTabContentProps, 'activeTab' | 'isLoading' | 'error'>) => {
        return (
            <div className="flex flex-col w-full h-full overflow-hidden">
                <div className="flex-1 w-full overflow-hidden">
                    <ClaimsKanban
                        claimsByStatus={claimsByStatus}
                        onUpdateStatus={onUpdateClaimStatus}
                        onDelete={onDeleteClaim}
                        onAddClaim={onAddClaim}
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
                <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                    Activating soon
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
function ClaimsTabContentComponent({
    activeTab,
    isLoading,
    error,
    claimsByStatus,
    onUpdateClaimStatus,
    onDeleteClaim,
    onAddClaim,
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
                    onUpdateClaimStatus={onUpdateClaimStatus}
                    onDeleteClaim={onDeleteClaim}
                    onAddClaim={onAddClaim}
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
