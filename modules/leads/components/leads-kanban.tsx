'use client';

import { Lead, LeadStatus, StatusColors } from '@/lib/types/lead';
import { useCallback, memo } from 'react';
import { LeadCard } from './lead-card';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LeadsKanbanProps {
    leadsByStatus: Record<LeadStatus, Lead[]>;
    onUpdateLeadStatus: (leadId: number, newStatus: string, reason?: string, description?: string, nextStep?: string) => void;
    onUpdateLead: (leadId: number, updateData: any) => void;
    onDeleteLead: (leadId: number) => void;
    onAddLead?: () => void;
}

// Memoized lead card to prevent unnecessary re-renders
const MemoizedLeadCard = memo(LeadCard);

// Memoized empty state component
const EmptyColumn = memo(() => (
    <div className="flex items-center justify-center h-24 text-[10px] font-normal uppercase border border-dashed rounded-md border-border text-muted-foreground font-body animate-fade-in">
        No leads in this column
    </div>
));

export function LeadsKanban({
    leadsByStatus,
    onUpdateLeadStatus,
    onUpdateLead,
    onDeleteLead,
    onAddLead,
}: LeadsKanbanProps) {

    const renderColumn = useCallback(
        (status: LeadStatus, title: string, count: number, id: string) => {
            const leads = leadsByStatus[status] || [];
            const colors = StatusColors[status];

            return (
                <div className="flex-1 min-w-[280px] max-w-[320px] flex flex-col" id={id}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <div
                                className={cn(
                                    'px-2 py-0.5 rounded text-[10px] font-normal flex items-center flex-row justify-between',
                                    colors.bg,
                                    colors.text,
                                )}
                            >
                                <span className="uppercase font-body">
                                    {title}
                                </span>
                                <span className="ml-2 px-1.5 py-0.5 bg-background/30 rounded-full font-body uppercase text-xl">
                                    {count}
                                </span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6"
                            onClick={() => onAddLead?.()}
                            id="add-lead-button"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                    <div className="space-y-3 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-240px)] pr-1 pb-2">
                        {leads?.map((lead, index) => (
                            <MemoizedLeadCard
                                key={lead?.uid}
                                lead={lead}
                                onUpdateStatus={onUpdateLeadStatus}
                                onUpdate={onUpdateLead}
                                onDelete={onDeleteLead}
                                index={index}
                                id={status === LeadStatus.PENDING && index === 0 ? "lead-card-example" : undefined}
                            />
                        ))}
                        {leads?.length === 0 && <EmptyColumn />}
                    </div>
                </div>
            );
        },
        [leadsByStatus, onUpdateLeadStatus, onUpdateLead, onDeleteLead, onAddLead],
    );

    return (
        <div
            className="flex flex-row items-start w-full h-full gap-2 overflow-x-scroll overflow-y-hidden"
            id="leads-kanban"
            data-drag-drop-area="true"
        >
            {/* PENDING */}
            {renderColumn(
                LeadStatus.PENDING,
                'Pending',
                leadsByStatus[LeadStatus.PENDING]?.length || 0,
                'pending-leads-column',
            )}
            {/* APPROVED */}
            {renderColumn(
                LeadStatus.APPROVED,
                'Approved',
                leadsByStatus[LeadStatus.APPROVED]?.length || 0,
                'approved-leads-column',
            )}
            {/* REVIEW */}
            {renderColumn(
                LeadStatus.REVIEW,
                'Review',
                leadsByStatus[LeadStatus.REVIEW]?.length || 0,
                'review-leads-column',
            )}
            {/* DECLINED */}
            {renderColumn(
                LeadStatus.DECLINED,
                'Declined',
                leadsByStatus[LeadStatus.DECLINED]?.length || 0,
                'declined-leads-column',
            )}
            {/* CANCELLED */}
            {renderColumn(
                LeadStatus.CANCELLED,
                'Cancelled',
                leadsByStatus[LeadStatus.CANCELLED]?.length || 0,
                'cancelled-leads-column',
            )}
            {/* CONVERTED */}
            {renderColumn(
                LeadStatus.CONVERTED,
                'Converted to Clients',
                leadsByStatus[LeadStatus.CONVERTED]?.length || 0,
                'converted-leads-column',
            )}
        </div>
    );
}
