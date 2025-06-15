'use client';

import { Task, TaskStatus, StatusColors } from '@/lib/types/task';
import { useCallback, memo, useMemo } from 'react';
import { TaskCard } from './task-card';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TasksKanbanProps {
    tasksByStatus: Record<TaskStatus, Task[]>;
    onUpdateTaskStatus: (
        taskId: number,
        newStatus: string,
        newDeadline?: Date,
    ) => void;
    onUpdateTask?: (taskId: number, updates: Partial<Task>) => void;
    onDeleteTask: (taskId: number) => void;
    onAddTask?: () => void;
    onUpdateSubtaskStatus?: (subtaskId: number, newStatus: string) => void;
}

// Overview statistics component
const TasksOverview = memo(({ tasksByStatus }: { tasksByStatus: Record<TaskStatus, Task[]> }) => {
    const stats = useMemo(() => {
        const allTasks = Object.values(tasksByStatus).flat();
        const total = allTasks.length;
        const completed = tasksByStatus[TaskStatus.COMPLETED]?.length || 0;
        const inProgress = tasksByStatus[TaskStatus.IN_PROGRESS]?.length || 0;
        const pending = tasksByStatus[TaskStatus.PENDING]?.length || 0;
        const overdue = tasksByStatus[TaskStatus.OVERDUE]?.length || 0;
        const postponed = tasksByStatus[TaskStatus.POSTPONED]?.length || 0;
        const cancelled = tasksByStatus[TaskStatus.CANCELLED]?.length || 0;
        const missed = tasksByStatus[TaskStatus.MISSED]?.length || 0;
        
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return {
            total,
            completed,
            inProgress,
            pending,
            overdue,
            postponed,
            cancelled,
            missed,
            completionRate,
        };
    }, [tasksByStatus]);

    return (
        <div className="p-4 mb-6 border rounded-lg bg-card border-border">
            <h3 className="mb-4 text-sm font-medium uppercase font-body">Tasks Overview</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
                <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats.total}</div>
                    <div className="text-xs uppercase text-muted-foreground font-body">Total</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                    <div className="text-xs uppercase text-muted-foreground font-body">Completed</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                    <div className="text-xs uppercase text-muted-foreground font-body">In Progress</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    <div className="text-xs uppercase text-muted-foreground font-body">Pending</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                    <div className="text-xs uppercase text-muted-foreground font-body">Overdue</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.postponed}</div>
                    <div className="text-xs uppercase text-muted-foreground font-body">Postponed</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{stats.cancelled}</div>
                    <div className="text-xs uppercase text-muted-foreground font-body">Cancelled</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.missed}</div>
                    <div className="text-xs uppercase text-muted-foreground font-body">Missed</div>
                </div>
            </div>
            <div className="pt-4 mt-4 border-t border-border">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium uppercase font-body">Completion Rate</span>
                    <span className="text-sm font-bold text-primary">{stats.completionRate}%</span>
                </div>
                <div className="w-full h-2 mt-2 bg-gray-200 rounded-full">
                    <div 
                        className="h-2 transition-all duration-300 rounded-full bg-primary" 
                        style={{ width: `${stats.completionRate}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
});

TasksOverview.displayName = 'TasksOverview';

// Memoized task card to prevent unnecessary re-renders
const MemoizedTaskCard = memo(TaskCard);

// Memoized empty state component
const EmptyColumn = memo(() => (
    <div className="flex items-center justify-center h-24 text-[10px] font-normal uppercase border border-dashed rounded-md border-border text-muted-foreground font-body animate-fade-in">
        No tasks in this column
    </div>
));

export function TasksKanban({
    tasksByStatus,
    onUpdateTaskStatus,
    onUpdateTask,
    onDeleteTask,
    onAddTask,
    onUpdateSubtaskStatus,
}: TasksKanbanProps) {
    const renderColumn = useCallback(
        (status: TaskStatus, title: string, count: number, columnId?: string, exampleCard?: boolean) => {
            const tasks = tasksByStatus[status] || [];
            const colors = StatusColors[status];

            return (
                <div className="flex-1 min-w-[280px] max-w-[320px] flex flex-col" id={columnId}>
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
                            onClick={() => onAddTask?.()}
                            id="add-task-button"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                    <div className="space-y-3 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-240px)] pr-1 pb-2">
                        <div className="mt-2 space-y-2 overflow-hidden">
                            {tasks.length > 0 ? (
                                tasks.map((task, index) => (
                                    <MemoizedTaskCard
                                        key={task.uid}
                                        task={task}
                                        onUpdateStatus={onUpdateTaskStatus}
                                        onUpdateTask={onUpdateTask}
                                        onDelete={onDeleteTask}
                                        onUpdateSubtaskStatus={onUpdateSubtaskStatus}
                                        index={index}
                                        id={exampleCard && index === 0 ? 'task-card-example' : undefined}
                                    />
                                ))
                            ) : (
                                <EmptyColumn />
                            )}
                        </div>
                    </div>
                </div>
            );
        },
        [
            tasksByStatus,
            onUpdateTaskStatus,
            onUpdateTask,
            onDeleteTask,
            onAddTask,
            onUpdateSubtaskStatus,
        ],
    );

    return (
        <div className="flex flex-col w-full h-full">
            {/* Overview Statistics */}
            <TasksOverview tasksByStatus={tasksByStatus} />
            
            {/* Kanban Board */}
            <div
                className="flex flex-row items-start w-full h-full gap-6 overflow-x-scroll overflow-y-hidden"
                id="tasks-board"
            >
                {/* Stage 1: Planning/Waiting */}
                <div className="flex flex-col">
                    <div className="flex gap-2">
                        {renderColumn(
                            TaskStatus.PENDING,
                            'Pending',
                            tasksByStatus[TaskStatus.PENDING]?.length || 0,
                            'pending-tasks-column',
                            true
                        )}
                        {renderColumn(
                            TaskStatus.POSTPONED,
                            'Postponed',
                            tasksByStatus[TaskStatus.POSTPONED]?.length || 0,
                            'postponed-tasks-column'
                        )}
                    </div>
                </div>
                {/* Stage 2: Active */}
                <div className="flex flex-col">
                    <div className="flex gap-2">
                        {renderColumn(
                            TaskStatus.IN_PROGRESS,
                            'In Progress',
                            tasksByStatus[TaskStatus.IN_PROGRESS]?.length || 0,
                            'inprogress-tasks-column'
                        )}
                    </div>
                </div>
                {/* Stage 3: Problem States */}
                <div className="flex flex-col">
                    <div className="flex gap-2">
                        {renderColumn(
                            TaskStatus.OVERDUE,
                            'Overdue',
                            tasksByStatus[TaskStatus.OVERDUE]?.length || 0,
                            'overdue-tasks-column'
                        )}
                        {renderColumn(
                            TaskStatus.MISSED,
                            'Missed',
                            tasksByStatus[TaskStatus.MISSED]?.length || 0,
                            'missed-tasks-column'
                        )}
                    </div>
                </div>
                {/* Stage 4: Terminated States */}
                <div className="flex flex-col">
                    <div className="flex gap-2">
                        {renderColumn(
                            TaskStatus.CANCELLED,
                            'Cancelled',
                            tasksByStatus[TaskStatus.CANCELLED]?.length || 0,
                            'cancelled-tasks-column'
                        )}
                    </div>
                </div>
                {/* Stage 5: Approved/Completed (at the end) */}
                <div className="flex flex-col">
                    <div className="flex gap-2">
                        {renderColumn(
                            TaskStatus.COMPLETED,
                            'Completed',
                            tasksByStatus[TaskStatus.COMPLETED]?.length || 0,
                            'completed-tasks-column'
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
