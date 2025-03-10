import { memo } from 'react';
import { AppLoader } from '@/components/loaders/page-loader';
import { TasksKanban } from './tasks-kanban';
import { TaskPagination } from '@/components/ui/pagination';
import { Task, TaskStatus } from '@/lib/types/task';

interface TasksTabContentProps {
    activeTab: string;
    isLoading: boolean;
    error: Error | null;
    tasksByStatus: Record<TaskStatus, Task[]>;
    pagination: {
        page: number;
        totalPages: number;
    };
    onUpdateTaskStatus: (taskId: number, newStatus: string) => void;
    onDeleteTask: (taskId: number) => void;
    onAddTask: () => void;
    onPageChange: (page: number) => void;
}

// Main Tasks tab content component
const TasksContent = memo(
    ({
        tasksByStatus,
        pagination,
        onUpdateTaskStatus,
        onDeleteTask,
        onAddTask,
        onPageChange,
    }: Omit<TasksTabContentProps, 'activeTab' | 'isLoading' | 'error'>) => {
        return (
            <div className='flex flex-col h-full overflow-hidden'>
                <div className='flex-1 overflow-hidden'>
                    <TasksKanban
                        tasksByStatus={tasksByStatus}
                        onUpdateTaskStatus={onUpdateTaskStatus}
                        onDeleteTask={onDeleteTask}
                        onAddTask={onAddTask}
                    />
                </div>
                <div className='px-4 py-3'>
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

TasksContent.displayName = 'TasksContent';

// Reports tab content
const ReportsContent = memo(() => {
    return (
        <div className='h-full overflow-hidden'>
            <div className='flex flex-col items-center justify-center h-full'>
                <p className='text-lg font-thin uppercase font-body'>Task Reports</p>
                <p className='text-xs font-thin uppercase text-muted-foreground font-body'>
                    Task reports functionality activating soon
                </p>
            </div>
        </div>
    );
});

ReportsContent.displayName = 'ReportsContent';

// Analytics tab content
const AnalyticsContent = memo(() => {
    return (
        <div className='w-full h-full overflow-hidden'>
            <div className='flex flex-col items-center justify-center w-full h-full'>
                <p className='text-lg font-thin uppercase font-body'>Task Analytics</p>
                <p className='text-xs font-thin uppercase text-muted-foreground font-body'>
                    Task analytics functionality activating soon
                </p>
            </div>
        </div>
    );
});

AnalyticsContent.displayName = 'AnalyticsContent';

// Loading component
const LoadingContent = memo(() => {
    return (
        <div className='flex items-center justify-center flex-1 w-full h-full'>
            <AppLoader />
        </div>
    );
});

LoadingContent.displayName = 'LoadingContent';

// Error component
const ErrorContent = memo(() => {
    return (
        <div className='py-12 text-center'>
            <p className='text-xs font-normal uppercase text-destructive font-body'>
                Failed to load tasks. Please try again.
            </p>
        </div>
    );
});

ErrorContent.displayName = 'ErrorContent';

// Main component that switches between tab contents
function TasksTabContentComponent({
    activeTab,
    isLoading,
    error,
    tasksByStatus,
    pagination,
    onUpdateTaskStatus,
    onDeleteTask,
    onAddTask,
    onPageChange,
}: TasksTabContentProps) {
    if (isLoading) {
        return <LoadingContent />;
    }

    if (error) {
        return <ErrorContent />;
    }

    switch (activeTab) {
        case 'tasks':
            return (
                <TasksContent
                    tasksByStatus={tasksByStatus}
                    pagination={pagination}
                    onUpdateTaskStatus={onUpdateTaskStatus}
                    onDeleteTask={onDeleteTask}
                    onAddTask={onAddTask}
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

export const TasksTabContent = memo(TasksTabContentComponent);
