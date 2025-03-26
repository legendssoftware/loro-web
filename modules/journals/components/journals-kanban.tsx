'use client';

import { Journal, JournalStatus, StatusColors } from '@/lib/types/journal';
import { useCallback, memo } from 'react';
import { JournalCard } from './journal-card';
import { cn } from '@/lib/utils';

interface JournalsKanbanProps {
    journalsByStatus: Record<JournalStatus, Journal[]>;
    onUpdateJournalStatus: (journalId: number, newStatus: string) => void;
    onDeleteJournal: (journalId: number) => void;
    onViewDetails?: (journal: Journal) => void;
    onAddJournal?: () => void;
}

// Memoized journal card to prevent unnecessary re-renders
const MemoizedJournalCard = memo(JournalCard);

// Memoized empty state component
const EmptyColumn = memo(() => (
    <div className="flex items-center justify-center h-24 text-[10px] font-thin uppercase border border-dashed rounded-md border-border text-muted-foreground font-body animate-fade-in">
        No journals in this column
    </div>
));

export function JournalsKanban({
    journalsByStatus,
    onUpdateJournalStatus,
    onDeleteJournal,
    onViewDetails,
    onAddJournal,
}: JournalsKanbanProps) {
    const renderColumn = useCallback(
        (status: JournalStatus, title: string, count: number) => {
            const journals = journalsByStatus[status] || [];
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
                            <span className="ml-2 px-1.5 py-0.5 bg-background/30 rounded-full font-body uppercase text-sm">
                                {count}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-3 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-240px)] pr-1 pb-2">
                        {journals?.map((journal, index) => (
                            <MemoizedJournalCard
                                key={journal?.uid}
                                journal={journal}
                                onUpdateStatus={onUpdateJournalStatus}
                                onDelete={onDeleteJournal}
                                onViewDetails={onViewDetails}
                                index={index}
                            />
                        ))}
                        {journals?.length === 0 && <EmptyColumn />}
                    </div>
                </div>
            );
        },
        [
            journalsByStatus,
            onUpdateJournalStatus,
            onDeleteJournal,
            onViewDetails,
            onAddJournal,
        ],
    );

    return (
        <div className="flex flex-row items-start w-full h-full gap-2 overflow-x-scroll overflow-y-hidden">
            {renderColumn(
                JournalStatus.PENDING_REVIEW,
                'Pending',
                journalsByStatus[JournalStatus.PENDING_REVIEW]?.length || 0,
            )}
            {renderColumn(
                JournalStatus.DRAFT,
                'Draft',
                journalsByStatus[JournalStatus.DRAFT]?.length || 0,
            )}
            {renderColumn(
                JournalStatus.REJECTED,
                'Rejected',
                journalsByStatus[JournalStatus.REJECTED]?.length || 0,
            )}
            {renderColumn(
                JournalStatus.ARCHIVED,
                'Archived',
                journalsByStatus[JournalStatus.ARCHIVED]?.length || 0,
            )}
            {renderColumn(
                JournalStatus.PUBLISHED,
                'Published',
                journalsByStatus[JournalStatus.PUBLISHED]?.length || 0,
            )}
        </div>
    );
}
