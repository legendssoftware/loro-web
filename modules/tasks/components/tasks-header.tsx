import { memo } from 'react';
import { TasksFilter } from './tasks-filter';
import { TaskFilterParams } from '@/lib/types/task';

interface TasksHeaderProps {
    onApplyFilters: (filters: TaskFilterParams) => void;
    onClearFilters: () => void;
    onAddTask: () => void;
}

function TasksHeaderComponent({
    onApplyFilters,
    onClearFilters,
    onAddTask,
}: TasksHeaderProps) {
    return (
        <div className="flex items-center justify-end gap-2 px-2">
            <TasksFilter
                onApplyFilters={onApplyFilters}
                onClearFilters={onClearFilters}
            />
        </div>
    );
}

export const TasksHeader = memo(TasksHeaderComponent);
