'use client';

import { PageTransition } from '@/components/animations/page-transition';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { TaskStatus, TaskFilterParams, Task } from '@/lib/types/task';
import { useTasksQuery } from '@/hooks/use-tasks-query';
import { useAuthStatus } from '@/hooks/use-auth-status';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { TasksTabGroup } from '@/modules/tasks/components/tasks-tab-group';
import { TasksHeader } from '@/modules/tasks/components/tasks-header';

// Dynamic imports for components that don't need to be loaded immediately
const TasksTabContent = dynamic(
    () =>
        import('@/modules/tasks/components/tasks-tab-content').then((mod) => ({
            default: mod.TasksTabContent,
        })),
    {
        loading: () => (
            <div className="flex items-center justify-center w-full h-full">
                Loading...
            </div>
        ),
    },
);

// Dynamically import UI components
const Dialog = dynamic(() =>
    import('@/components/ui/dialog').then((mod) => ({ default: mod.Dialog })),
);
const DialogContent = dynamic(() =>
    import('@/components/ui/dialog').then((mod) => ({
        default: mod.DialogContent,
    })),
);
const DialogHeader = dynamic(() =>
    import('@/components/ui/dialog').then((mod) => ({
        default: mod.DialogHeader,
    })),
);
const DialogTitle = dynamic(() =>
    import('@/components/ui/dialog').then((mod) => ({
        default: mod.DialogTitle,
    })),
);

// Dynamically import TaskForm
const TaskForm = dynamic(
    () =>
        import('@/modules/tasks/components/task-form').then((mod) => ({
            default: mod.default,
        })),
    { ssr: false },
);

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
    onCreateTask,
}: {
    isOpen: boolean;
    onClose: () => void;
    onCreateTask?: (taskData: any) => void;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (formData: any) => {
        try {
            setIsSubmitting(true);
            if (onCreateTask) {
                await onCreateTask(formData);
                // Only close the modal if task creation was successful
                onClose();
            }
        } catch (error) {
            console.error('Error creating task:', error);
            // Error is already shown via toast in the onCreateTask function
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                // Only allow closing if not submitting
                if (!isSubmitting && !open) {
                    onClose();
                }
            }}
        >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
                <DialogHeader>
                    <DialogTitle className="text-lg font-thin uppercase font-body">
                        Task Creation
                    </DialogTitle>
                </DialogHeader>
                <TaskForm onSubmit={handleSubmit} isLoading={isSubmitting} />
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
        updateSubtask,
    } = useTasksQuery(isAuthenticated ? currentFilters : {});

    // Refetch data when authentication changes or component mounts
    useEffect(() => {
        if (isAuthenticated) {
            // Refetch data when the component mounts or when returning to the page
            refetch();

            // Set up a visibility change listener to refresh data when returning to the tab
            const handleVisibilityChange = () => {
                if (document.visibilityState === 'visible') {
                    console.log('Task page became visible, refreshing data...');
                    refetch();
                }
            };

            document.addEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );

            return () => {
                document.removeEventListener(
                    'visibilitychange',
                    handleVisibilityChange,
                );
            };
        }
    }, [isAuthenticated, refetch]);

    // Handlers
    const handleUpdateTaskStatus = useCallback(
        async (taskId: number, newStatus: string, newDeadline?: Date) => {
            try {
                // If we're postponing with a new deadline, include it in the update
                if (newStatus === TaskStatus.POSTPONED && newDeadline) {
                    await updateTask(taskId, {
                        status: newStatus as TaskStatus,
                        deadline: newDeadline,
                    });
                } else {
                    // Otherwise just update the status
                    await updateTask(taskId, {
                        status: newStatus as TaskStatus,
                    });
                }
            } catch (error) {
                console.error(`Error updating task ${taskId} status:`, error);
                // Error toast is already shown by the mutation
            }
        },
        [updateTask],
    );

    // Add a handler for updating subtask status
    const handleUpdateSubtaskStatus = useCallback(
        async (subtaskId: number, newStatus: string) => {
            try {
                // Check if we have access to updateSubtask in useTasksQuery hook
                // If not, this needs to be implemented in the hooks first
                if (typeof updateSubtask === 'function') {
                    await updateSubtask(subtaskId, { status: newStatus });
                } else {
                    console.error('updateSubtask function is not available');
                }
            } catch (error) {
                console.error(
                    `Error updating subtask ${subtaskId} status:`,
                    error,
                );
            }
        },
        [updateSubtask],
    );

    const handleDeleteTask = useCallback(
        async (taskId: number) => {
            try {
                // The deleteTask function now returns a promise that resolves after the mutation completes
                await deleteTask(taskId);
                // No need to manually refetch as the query will be invalidated automatically
            } catch (error) {
                console.error(`Error deleting task ${taskId}:`, error);
                // Error toast is already shown by the mutation
            }
        },
        [deleteTask],
    );

    const handleCreateTask = useCallback(() => {
        setIsCreateDialogOpen(true);
    }, []);

    const handleSubmitCreateTask = useCallback(
        async (taskData: any) => {
            try {
                console.log('Creating task with data:', taskData);

                // Make sure all required fields are present and properly formatted
                const formattedTaskData = {
                    ...taskData,
                    // Convert any dates to ISO strings if needed
                    deadline: taskData.deadline
                        ? new Date(taskData.deadline).toISOString()
                        : undefined,
                    repetitionDeadline: taskData.repetitionDeadline
                        ? new Date(taskData.repetitionDeadline).toISOString()
                        : undefined,
                };

                // The createTask function now returns a promise that resolves after the mutation completes
                await createTask(formattedTaskData);
                // No need to manually refetch as the query will be invalidated automatically
                return true;
            } catch (error) {
                console.error('Error creating task:', error);
                // Error toast is already shown by the mutation
                throw error; // Re-throw the error to be handled by the form component
            }
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

    // Add a new handler function for general task updates
    const handleUpdateTask = useCallback(
        async (taskId: number, updates: Partial<Task>) => {
            try {
                console.log(`Updating task ${taskId} with:`, updates);

                // Create a formatted updates object with correct types
                const formattedUpdates: Partial<Task> = { ...updates };

                // Convert date fields if they exist, but maintain the correct Task type
                if (updates.deadline) {
                    // If it's already a Date object, keep it; otherwise convert it
                    formattedUpdates.deadline =
                        updates.deadline instanceof Date
                            ? updates.deadline
                            : new Date(updates.deadline);
                }

                if (updates.repetitionDeadline) {
                    formattedUpdates.repetitionDeadline =
                        updates.repetitionDeadline instanceof Date
                            ? updates.repetitionDeadline
                            : new Date(updates.repetitionDeadline);
                }

                // Use the updateTask function to apply the updates
                await updateTask(taskId, formattedUpdates);
                // No need to manually refetch as the query will be invalidated automatically
            } catch (error) {
                console.error(`Error updating task ${taskId}:`, error);
                // Error toast is already shown by the mutation
            }
        },
        [updateTask],
    );

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
                            onUpdateTask={handleUpdateTask}
                            onDeleteTask={handleDeleteTask}
                            onAddTask={handleCreateTask}
                            onUpdateSubtaskStatus={handleUpdateSubtaskStatus}
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
