'use client';

import { memo } from 'react';
import { AppHoneycombLoader } from '@/components/loaders/honeycomb-loader';
import { JournalsKanban } from './journals-kanban';
import { Journal, JournalStatus } from '@/lib/types/journal';
import { FolderMinus } from 'lucide-react';

interface JournalsTabContentProps {
    activeTab: string;
    isLoading: boolean;
    error: Error | null;
    journalsByStatus: Record<JournalStatus, Journal[]>;
    onUpdateJournalStatus: (journalId: number, newStatus: string) => void;
    onDeleteJournal: (journalId: number) => void;
    onViewDetails?: (journal: Journal) => void;
    onAddJournal: () => void;
}

// Main Journals tab content component
const JournalsContent = memo(
    ({
        journalsByStatus,
        onUpdateJournalStatus,
        onDeleteJournal,
        onViewDetails,
        onAddJournal,
    }: Omit<JournalsTabContentProps, 'activeTab' | 'isLoading' | 'error'>) => {
        return (
            <div className="flex flex-col w-full h-full overflow-hidden">
                <div className="flex-1 w-full overflow-hidden">
                    <JournalsKanban
                        journalsByStatus={journalsByStatus}
                        onUpdateJournalStatus={onUpdateJournalStatus}
                        onDeleteJournal={onDeleteJournal}
                        onViewDetails={onViewDetails}
                        onAddJournal={onAddJournal}
                    />
                </div>
            </div>
        );
    },
);

JournalsContent.displayName = 'JournalsContent';

// Reports tab content
const ReportsContent = memo(() => {
    return (
        <div className="h-full overflow-hidden">
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
        <div className="h-full overflow-hidden">
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                    Activating soon
                </p>
            </div>
        </div>
    );
});

AnalyticsContent.displayName = 'AnalyticsContent';

// Error content
const ErrorContent = memo(() => {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <FolderMinus className="w-16 h-16 mb-4 text-muted-foreground" />
            <p className="text-sm font-normal uppercase text-muted-foreground font-body">
                Failed to load journals
            </p>
            <p className="text-xs font-normal text-muted-foreground font-body">
                Please try again later
            </p>
        </div>
    );
});

ErrorContent.displayName = 'ErrorContent';

// Loading component
const LoadingContent = memo(() => {
    return (
        <div className="flex items-center justify-center flex-1 w-full h-full">
            <AppHoneycombLoader size="sm" />
        </div>
    );
});

LoadingContent.displayName = 'LoadingContent';

// Main component that conditionally renders the right content based on state
export function JournalsTabContent({
    activeTab,
    isLoading,
    error,
    journalsByStatus,
    onUpdateJournalStatus,
    onDeleteJournal,
    onViewDetails,
    onAddJournal,
}: JournalsTabContentProps) {
    if (isLoading) {
        return <LoadingContent />;
    }

    if (error) {
        return <ErrorContent />;
    }

    if (activeTab === 'journals') {
        return (
            <JournalsContent
                journalsByStatus={journalsByStatus}
                onUpdateJournalStatus={onUpdateJournalStatus}
                onDeleteJournal={onDeleteJournal}
                onViewDetails={onViewDetails}
                onAddJournal={onAddJournal}
            />
        );
    }

    if (activeTab === 'reports') {
        return <ReportsContent />;
    }

    if (activeTab === 'analytics') {
        return <AnalyticsContent />;
    }

    return null;
}
