'use client';

import { PageTransition } from '@/components/animations/page-transition';
import { AppLoader } from '@/components/loaders/page-loader';
import { Toaster } from '@/components/ui/toaster';
import { useTasks } from '@/hooks/use-tasks';
import { TaskStatus } from '@/lib/types/task';
import { TasksFilter } from '@/modules/tasks/components/tasks-filter';
import { TasksKanban } from '@/modules/tasks/components/tasks-kanban';
import { TasksTabGroup } from '@/modules/tasks/components/tasks-tab-group';
import { useState, useCallback } from 'react';

export default function TasksPage() {
    // State
    const [activeTab, setActiveTab] = useState<string>('tasks');

    // Hooks
    const { tasksByStatus, isLoading, error, updateTask, deleteTask, applyFilters, clearFilters } = useTasks();

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
        // Implement task creation dialog/form
        console.log('Create task clicked');
    }, []);

    // Tab configuration
    const tabs = [
        { id: 'tasks', label: 'Tasks' },
        { id: 'reports', label: 'Reports' },
        { id: 'analytics', label: 'Analytics' },
    ];

    const RenderTasks = () => {
        if (isLoading) {
            return <AppLoader />;
        }

        if (error) {
            return (
                <div className='py-12 text-center'>
                    <p className='text-destructive font-body'>Failed to load tasks. Please try again.</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'tasks':
                return (
                    <div className='h-full overflow-hidden'>
                        <TasksKanban
                            tasksByStatus={tasksByStatus}
                            onUpdateTaskStatus={handleUpdateTaskStatus}
                            onDeleteTask={handleDeleteTask}
                            onAddTask={handleCreateTask}
                        />
                    </div>
                );
            case 'reports':
                return (
                    <div className='h-full overflow-hidden'>
                        <div className='flex flex-col items-center justify-center h-full'>
                            <p className='text-lg font-normal uppercase font-body'>Task Reports</p>
                            <p className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                Reports functionality coming soon
                            </p>
                        </div>
                    </div>
                );
            case 'analytics':
                return (
                    <div className='h-full overflow-hidden'>
                        <div className='flex flex-col items-center justify-center h-full'>
                            <p className='text-lg font-normal uppercase font-body'>Task Analytics</p>
                            <p className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                Analytics functionality coming soon
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <PageTransition>
            <div className='flex flex-col h-screen overflow-hidden'>
                <TasksTabGroup tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                <div className='flex flex-col flex-1 overflow-hidden'>
                    {activeTab === 'tasks' && (
                        <div className='flex-shrink-0 px-8 py-3 border-b border-border/10'>
                            <div className='flex items-center w-full'>
                                <TasksFilter onApplyFilters={applyFilters} onClearFilters={clearFilters} />
                            </div>
                        </div>
                    )}
                    <div className='flex-1 px-8 py-4 overflow-hidden'>
                        <RenderTasks />
                    </div>
                </div>
            </div>
            <Toaster />
        </PageTransition>
    );
}
