'use client';

import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';

interface TasksViewSwitcherProps {
    currentView: 'kanban' | 'list';
    onChangeView: (view: 'kanban' | 'list') => void;
    onManageViews?: () => void;
    onAddTask?: () => void;
    onEnrichTasks?: () => void;
}

export function TasksViewSwitcher({
    currentView,
    onChangeView,
    onManageViews,
    onAddTask,
    onEnrichTasks,
}: TasksViewSwitcherProps) {
    return (
        <div className="flex items-center gap-2 ml-auto">
            {/* Enrich Tasks Button */}
            <Button
                className="h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={onEnrichTasks}
            >
                <Sparkles className="h-4 w-4 mr-2" />
                <span>Enrich Tasks</span>
            </Button>

            {/* Add Task Button (mobile only, hidden on desktop) */}
            <Button
                className="h-10 w-10 p-0 md:hidden"
                onClick={onAddTask}
            >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add Task</span>
            </Button>
        </div>
    );
}
