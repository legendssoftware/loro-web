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

function TasksHeaderComponent({ onApplyFilters, onClearFilters, onAddTask }: TasksHeaderProps) {
    return (
        <div className='flex-shrink-0 px-8 py-3 border-b border-border/10'>
            <div className='flex items-center justify-between w-full'>
                <TasksFilter onApplyFilters={onApplyFilters} onClearFilters={onClearFilters} />
                <Button onClick={onAddTask} className='ml-4' size='sm'>
                    <PlusCircle className='w-4 h-4 mr-2' />
                    <p className='text-xs font-normal uppercase font-body'>Add Task</p>
                </Button>
            </div>
        </div>
    );
}

export const TasksHeader = memo(TasksHeaderComponent);
