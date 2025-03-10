import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
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
            <Button onClick={onAddTask} size="sm">
                <PlusCircle className="w-4 h-4 mr-2" />
                <p className="text-[10px] font-normal uppercase font-body">
                    Add Task
                </p>
            </Button>
        </div>
    );
}

export const TasksHeader = memo(TasksHeaderComponent);
