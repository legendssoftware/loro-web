'use client';

import { PageTransition } from '@/components/animations/page-transition';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { TaskStatus, TaskFilterParams } from '@/lib/types/task';
import { useTasksQuery } from '@/hooks/use-tasks-query';
import { useAuthStatus } from '@/hooks/use-auth-status';
import { useRouter } from 'next/navigation';
import { TasksTabGroup } from '@/modules/tasks/components/tasks-tab-group';
import { TasksTabContent } from '@/modules/tasks/components/tasks-tab-content';
import { TasksHeader } from '@/modules/tasks/components/tasks-header';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

// Tab configuration
const tabs = [
    { id: 'tasks', label: 'Tasks' },
    { id: 'reports', label: 'Reports' },
    { id: 'analytics', label: 'Analytics' },
];

// Create Task Modal Component
function CreateTaskModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
    onCreateTask?: (taskData: any) => void;
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
                <DialogHeader>
                    <DialogTitle className="text-lg font-thin uppercase font-body">
                        Task Creation
                    </DialogTitle>
                </DialogHeader>
                <div className="flex items-center justify-center h-64">
                    <h2 className="text-xs font-thin uppercase font-body">
                        Activating Soon
                    </h2>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function TasksPage() {
    const router = useRouter();
    const { isAuthenticated, checkStatus } = useAuthStatus();

    // Check authentication on component mount
    useEffect(() => {
        const status = checkStatus();
        if (!status.isAuthenticated) {
            console.warn('User not authenticated. Redirecting to login page.');
            router.push('/sign-in');
        }
    }, [checkStatus, router]);

    // State
    const [activeTab, setActiveTab] = useState<string>('tasks');
    const [filterParams, setFilterParams] = useState<TaskFilterParams>({
        page: 1,
        limit: 500,
    });
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Memoize filter params to prevent unnecessary re-renders
    const currentFilters = useMemo(() => filterParams, [filterParams]);

    // Use the React Query hook only if authenticated
    const {
        tasksByStatus,
        isLoading,
        error,
        updateTask,
        deleteTask,
        createTask,
        refetch,
    } = useTasksQuery(isAuthenticated ? currentFilters : {});

    // Refetch data when authentication changes
    useEffect(() => {
        if (isAuthenticated) {
            refetch();
        }
    }, [isAuthenticated, refetch]);

    // Handlers
    const handleUpdateTaskStatus = useCallback(
        async (taskId: number, newStatus: string) => {
            await updateTask(taskId, { status: newStatus as TaskStatus });
        },
        [updateTask],
    );

    const handleDeleteTask = useCallback(
        async (taskId: number) => {
            await deleteTask(taskId);
        },
        [deleteTask],
    );

    const handleCreateTask = useCallback(() => {
        setIsCreateDialogOpen(true);
    }, []);

    const handleSubmitCreateTask = useCallback(
        async (taskData: any) => {
            await createTask(taskData);
        },
        [createTask],
    );

    // Apply filters handler
    const handleApplyFilters = useCallback((newFilters: TaskFilterParams) => {
        setFilterParams((prev) => ({
            ...prev,
            ...newFilters,
            limit: 500, // Always keep the limit at 500
        }));
    }, []);

    // Clear filters handler
    const handleClearFilters = useCallback(() => {
        setFilterParams({
            page: 1,
            limit: 500,
        });
    }, []);

    return (
        <PageTransition>
            <div className="flex flex-col h-screen gap-2 overflow-hidden">
                <TasksTabGroup
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
                <div className="flex flex-col flex-1 overflow-hidden">
                    {activeTab === 'tasks' && (
                        <TasksHeader
                            onApplyFilters={handleApplyFilters}
                            onClearFilters={handleClearFilters}
                            onAddTask={handleCreateTask}
                        />
                    )}
                    <div className="flex items-center justify-center flex-1 px-3 py-3 overflow-hidden xl:px-8 xl:px-4">
                        <TasksTabContent
                            activeTab={activeTab}
                            isLoading={isLoading}
                            error={error}
                            tasksByStatus={tasksByStatus}
                            onUpdateTaskStatus={handleUpdateTaskStatus}
                            onDeleteTask={handleDeleteTask}
                            onAddTask={handleCreateTask}
                        />
                    </div>
                </div>
            </div>

            {/* Render the CreateTaskModal */}
            <CreateTaskModal
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onCreateTask={handleSubmitCreateTask}
            />
        </PageTransition>
    );
}
