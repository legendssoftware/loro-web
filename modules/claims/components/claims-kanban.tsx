'use client';

import { Claim, ClaimStatus, StatusColors } from '@/lib/types/claim';
import { useCallback, memo } from 'react';
import { ClaimCard } from './claim-card';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ClaimsKanbanProps {
    claimsByStatus: Record<ClaimStatus, Claim[]>;
    onUpdateStatus: (claimId: number, newStatus: string) => void;
    onDelete: (claimId: number) => void;
    onAddClaim?: () => void;
}

// Memoized claim card to prevent unnecessary re-renders
const MemoizedClaimCard = memo(ClaimCard);

// Memoized empty state component
const EmptyColumn = memo(() => (
    <div className="flex items-center justify-center h-24 text-[10px] font-normal uppercase border border-dashed rounded-md border-border text-muted-foreground font-body animate-fade-in">
        No claims in this column
    </div>
));

export function ClaimsKanban({
    claimsByStatus,
    onUpdateStatus,
    onDelete,
    onAddClaim,
}: ClaimsKanbanProps) {
    const renderColumn = useCallback(
        (status: ClaimStatus, title: string, count: number) => {
            const claims = claimsByStatus[status] || [];
            const colors = StatusColors[status];

            return (
                <div className="flex-1 min-w-[280px] max-w-[320px] flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <div
                            className={cn(
                                'px-2 py-0.5 rounded text-[10px] font-normal flex items-center flex-row justify-between',
                                colors.bg,
                                colors.text,
                            )}
                        >
                            <span className="uppercase font-body">{title}</span>
                            <span className="ml-2 px-1.5 py-0.5 bg-background/30 rounded-full font-body uppercase text-xl">
                                {count}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6"
                            onClick={() => onAddClaim?.()}
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                    <div className="space-y-3 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-240px)] pr-1 pb-2">
                        {claims.map((claim, index) => (
                            <MemoizedClaimCard
                                key={claim?.uid}
                                claim={claim}
                                onUpdateStatus={onUpdateStatus}
                                onDelete={onDelete}
                                index={index}
                            />
                        ))}
                        {claims?.length === 0 && <EmptyColumn />}
                    </div>
                </div>
            );
        },
        [claimsByStatus, onUpdateStatus, onDelete, onAddClaim],
    );

    return (
        <div className="flex flex-row items-start w-full h-full gap-2 overflow-x-scroll overflow-y-hidden">
            {renderColumn(
                ClaimStatus.PENDING,
                'Pending',
                claimsByStatus[ClaimStatus.PENDING]?.length || 0,
            )}
            {renderColumn(
                ClaimStatus.APPROVED,
                'Approved',
                claimsByStatus[ClaimStatus.APPROVED]?.length || 0,
            )}
            {renderColumn(
                ClaimStatus.REJECTED,
                'Rejected',
                claimsByStatus[ClaimStatus.REJECTED]?.length || 0,
            )}
            {renderColumn(
                ClaimStatus.PAID,
                'Paid',
                claimsByStatus[ClaimStatus.PAID]?.length || 0,
            )}
            {renderColumn(
                ClaimStatus.CANCELLED,
                'Cancelled',
                claimsByStatus[ClaimStatus.CANCELLED]?.length || 0,
            )}
            {renderColumn(
                ClaimStatus.DECLINED,
                'Declined',
                claimsByStatus[ClaimStatus.DECLINED]?.length || 0,
            )}
        </div>
    );
}
