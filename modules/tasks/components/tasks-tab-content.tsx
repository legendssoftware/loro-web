import { memo } from 'react';
import { AppLoader } from '@/components/loaders/page-loader';
import { TasksKanban } from './tasks-kanban';
import { Task, TaskStatus } from '@/lib/types/task';
import { FolderMinus } from 'lucide-react';

interface TasksTabContentProps {
    activeTab: string;
    isLoading: boolean;
    error: Error | null;
    tasksByStatus: Record<TaskStatus, Task[]>;
    onUpdateTaskStatus: (
        taskId: number,
        newStatus: string,
        newDeadline?: Date,
    ) => void;
    onUpdateTask?: (taskId: number, updates: Partial<Task>) => void;
    onDeleteTask: (taskId: number) => void;
    onAddTask: () => void;
    onUpdateSubtaskStatus?: (subtaskId: number, newStatus: string) => void;
}

// Main Tasks tab content component
const TasksContent = memo(
    ({
        tasksByStatus,
        onUpdateTaskStatus,
        onUpdateTask,
        onDeleteTask,
        onAddTask,
        onUpdateSubtaskStatus,
    }: Omit<TasksTabContentProps, 'activeTab' | 'isLoading' | 'error'>) => {
        return (
            <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-hidden">
                    <TasksKanban
                        tasksByStatus={tasksByStatus}
                        onUpdateTaskStatus={onUpdateTaskStatus}
                        onUpdateTask={onUpdateTask}
                        onDeleteTask={onDeleteTask}
                        onAddTask={onAddTask}
                        onUpdateSubtaskStatus={onUpdateSubtaskStatus}
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
function TasksTabContentComponent({
    activeTab,
    isLoading,
    error,
    tasksByStatus,
    onUpdateTaskStatus,
    onUpdateTask,
    onDeleteTask,
    onAddTask,
    onUpdateSubtaskStatus,
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
                    onUpdateTaskStatus={onUpdateTaskStatus}
                    onUpdateTask={onUpdateTask}
                    onDeleteTask={onDeleteTask}
                    onAddTask={onAddTask}
                    onUpdateSubtaskStatus={onUpdateSubtaskStatus}
                />
            );
        case 'reports':
            return <ReportsContent />;
        case 'analytics':
            return <AnalyticsContent />;
        default:
            return (
                <TasksContent
                    tasksByStatus={tasksByStatus}
                    onUpdateTaskStatus={onUpdateTaskStatus}
                    onUpdateTask={onUpdateTask}
                    onDeleteTask={onDeleteTask}
                    onAddTask={onAddTask}
                    onUpdateSubtaskStatus={onUpdateSubtaskStatus}
                />
            );
    }
}

export const TasksTabContent = memo(TasksTabContentComponent);
