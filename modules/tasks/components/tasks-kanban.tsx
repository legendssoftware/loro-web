'use client';

import { Task, TaskStatus, StatusColors } from '@/lib/types/task';
import { useCallback, memo } from 'react';
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
        (status: TaskStatus, title: string, count: number) => {
            const tasks = tasksByStatus[status] || [];
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
                            <span className="ml-2 px-1.5 py-0.5 bg-background/30 rounded-full font-body uppercase text-xl">
                                {count}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6"
                            onClick={() => onAddTask?.()}
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
                                        onDelete={onDeleteTask}
                                        onUpdateSubtaskStatus={
                                            onUpdateSubtaskStatus
                                        }
                                        index={index}
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
            onDeleteTask,
            onAddTask,
            onUpdateSubtaskStatus,
        ],
    );

    return (
        <div className="flex flex-row items-start w-full h-full gap-6 overflow-x-scroll overflow-y-hidden">
            {/* Stage 1: Planning/Waiting */}
            <div className="flex flex-col">
                <div className="flex gap-2">
                    {renderColumn(
                        TaskStatus.PENDING,
                        'Pending',
                        tasksByStatus[TaskStatus.PENDING]?.length || 0,
                    )}
                    {renderColumn(
                        TaskStatus.POSTPONED,
                        'Postponed',
                        tasksByStatus[TaskStatus.POSTPONED]?.length || 0,
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
                    )}
                    {renderColumn(
                        TaskStatus.MISSED,
                        'Missed',
                        tasksByStatus[TaskStatus.MISSED]?.length || 0,
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
                    )}
                </div>
            </div>
        </div>
    );
}
