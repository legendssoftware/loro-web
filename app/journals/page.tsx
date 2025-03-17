'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { JournalsTabGroup, JournalsTab } from '@/modules/journals/components/journals-tab-group';
import { JournalsTabContent } from '@/modules/journals/components/journals-tab-content';
import { JournalsHeader } from '@/modules/journals/components/journals-header';
import { JournalForm } from '@/modules/journals/components/journal-form';
import { JournalDetailsModal } from '@/modules/journals/components/journal-details-modal';
import { getJournals, updateJournal, deleteJournal, createJournal } from '@/lib/services/journal-api';
import { Journal, JournalStatus, JournalFilterParams, CreateJournalDto } from '@/lib/types/journal';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/animations/page-transition';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth-store';

export default function JournalsPage() {
    const router = useRouter();
    const { profileData } = useAuthStore();

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [journals, setJournals] = useState<Journal[]>([]);
    const [error, setError] = useState<Error | null>(null);
    const [activeTab, setActiveTab] = useState('journals');
    const [filterParams, setFilterParams] = useState<JournalFilterParams>({
        page: 1,
        limit: 500,
    });
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Define tabs for the journals page
    const tabs: JournalsTab[] = useMemo(
        () => [
            { id: 'journals', label: 'Journals' },
            { id: 'reports', label: 'Reports' },
            { id: 'analytics', label: 'Analytics' },
        ],
        [],
    );

    // Group journals by status
    const journalsByStatus = useMemo(() => {
        const grouped: Record<JournalStatus, Journal[]> = {
            [JournalStatus.PENDING_REVIEW]: [],
            [JournalStatus.PUBLISHED]: [],
            [JournalStatus.DRAFT]: [],
            [JournalStatus.REJECTED]: [],
            [JournalStatus.ARCHIVED]: [],
        };

        journals.forEach((journal) => {
            const status = journal.status as JournalStatus;
            if (grouped[status]) {
                grouped[status].push(journal);
            } else {
                // Default to PENDING_REVIEW if status is not recognized
                grouped[JournalStatus.PENDING_REVIEW].push(journal);
            }
        });

        return grouped;
    }, [journals]);

    // Fetch journals on component mount and when filters change
    useEffect(() => {
        const fetchJournals = async () => {
            try {
                setIsLoading(true);
                const result = await getJournals(filterParams);
                setJournals(result.data);
                setError(null);
            } catch (err) {
                setError(err as Error);
                console.error('Error fetching journals:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJournals();
    }, [filterParams]);

    // Update journal status handler
    const handleUpdateJournalStatus = useCallback(
        async (journalId: number, newStatus: string) => {
            try {
                const result = await updateJournal(journalId, {
                    status: newStatus as JournalStatus,
                });

                if (result.data) {
                    // Update the journals list with the updated journal
                    setJournals((prevJournals) =>
                        prevJournals.map((journal) =>
                            journal.uid === journalId
                                ? { ...journal, status: newStatus as JournalStatus }
                                : journal,
                        ),
                    );

                    toast.success('Journal updated successfully', {
                        id: `journal-update-${journalId}`,
                    });
                }
            } catch (err) {
                console.error('Error updating journal status:', err);
                toast.error('Failed to update journal status');
            }
        },
        [],
    );

    // Delete journal handler
    const handleDeleteJournal = useCallback(async (journalId: number) => {
        try {
            const result = await deleteJournal(journalId);

            if (result) {
                // Remove the deleted journal from the list
                setJournals((prevJournals) =>
                    prevJournals.filter((journal) => journal.uid !== journalId),
                );

                toast.success('Journal deleted successfully', {
                    id: `journal-delete-${journalId}`,
                });
            }
        } catch (err) {
            console.error('Error deleting journal:', err);
            toast.error('Failed to delete journal');
        }
    }, []);

    // Create journal handler
    const handleCreateJournal = useCallback(() => {
        setIsFormOpen(true);
    }, []);

    // Submit new journal
    const handleSubmitJournal = useCallback(async (data: CreateJournalDto) => {
        try {
            const result = await createJournal(data);
            if (result.data) {
                // Add the new journal to the list
                setJournals((prevJournals) => [result.data as Journal, ...prevJournals]);
                toast.success('Journal created successfully');
            }
        } catch (err) {
            console.error('Error creating journal:', err);
            toast.error('Failed to create journal');
        }
    }, []);

    // Open journal details
    const handleOpenJournalDetails = useCallback((journal: Journal) => {
        setSelectedJournal(journal);
        setIsDetailsModalOpen(true);
    }, []);

    // Close journal details modal
    const handleCloseDetailsModal = useCallback(() => {
        setIsDetailsModalOpen(false);
        setSelectedJournal(null);
    }, []);

    return (
        <PageTransition>
            <div className="flex flex-col h-screen gap-2 overflow-hidden">
                <JournalsTabGroup
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
                <div className="flex flex-col flex-1 overflow-hidden">
                    {activeTab === 'journals' && (
                        <JournalsHeader onAddJournal={handleCreateJournal} />
                    )}
                    <div className="flex items-center justify-center flex-1 px-3 py-3 overflow-hidden xl:px-8 xl:px-4">
                        <JournalsTabContent
                            activeTab={activeTab}
                            isLoading={isLoading}
                            error={error}
                            journalsByStatus={journalsByStatus}
                            onUpdateJournalStatus={handleUpdateJournalStatus}
                            onDeleteJournal={handleDeleteJournal}
                            onViewDetails={handleOpenJournalDetails}
                            onAddJournal={handleCreateJournal}
                        />
                    </div>
                </div>

                {/* Journal Form Modal */}
                <JournalForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSubmit={handleSubmitJournal}
                />

                {/* Journal Details Modal */}
                <JournalDetailsModal
                    journal={selectedJournal}
                    isOpen={isDetailsModalOpen}
                    onClose={handleCloseDetailsModal}
                    onUpdateStatus={handleUpdateJournalStatus}
                    onDelete={handleDeleteJournal}
                />
            </div>
        </PageTransition>
    );
}
