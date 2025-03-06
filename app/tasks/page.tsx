'use client';

import { PageTransition } from '@/components/animations/page-transition';
import { AppLoader } from '@/components/loaders/page-loader';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { TaskStatus, TaskFilterParams, TaskPriority, TaskType } from '@/lib/types/task';
import { TasksFilter } from '@/modules/tasks/components/tasks-filter';
import { TasksKanban } from '@/modules/tasks/components/tasks-kanban';
import { TasksTabGroup } from '@/modules/tasks/components/tasks-tab-group';
import { useTasksQuery } from '@/hooks/use-tasks-query';
import { TaskPagination } from '@/components/ui/pagination';
import { useAuthStatus } from '@/hooks/use-auth-status';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';

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
        limit: 20,
    });
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        taskType: TaskType.OTHER,
        deadline: undefined as Date | undefined,
    });

    // Memoize filter params to prevent unnecessary re-renders
    const currentFilters = useMemo(() => filterParams, [filterParams]);

    // Use the React Query hook only if authenticated
    const { tasksByStatus, isLoading, error, updateTask, deleteTask, createTask, pagination, refetch } = useTasksQuery(
        isAuthenticated ? currentFilters : {},
    );

    // Refetch data when authentication changes
    useEffect(() => {
        if (isAuthenticated) {
            refetch();
        }
    }, [isAuthenticated, refetch]);

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
        setIsCreateDialogOpen(true);
    }, []);

    const handleCreateTaskSubmit = useCallback(() => {
        // Validate required fields
        if (!newTask.title) {
            console.error('Title is required');
            return;
        }

        // Submit the task
        createTask({
            ...newTask,
        });

        // Reset form and close dialog
        setNewTask({
            title: '',
            description: '',
            status: TaskStatus.PENDING,
            priority: TaskPriority.MEDIUM,
            taskType: TaskType.OTHER,
            deadline: undefined,
        });
        setIsCreateDialogOpen(false);
    }, [newTask, createTask]);

    // Apply filters handler
    const handleApplyFilters = useCallback((newFilters: TaskFilterParams) => {
        console.log('Applying filters:', newFilters);
        setFilterParams(prev => ({
            ...prev,
            ...newFilters,
            page: 1, // Reset to first page when applying new filters
        }));
    }, []);

    // Clear filters handler
    const handleClearFilters = useCallback(() => {
        console.log('Clearing filters');
        setFilterParams({
            page: 1,
            limit: 20,
        });
    }, []);

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        console.log('Changing to page:', page);
        setFilterParams(prev => ({
            ...prev,
            page,
        }));
    }, []);

    // Tab configuration
    const tabs = [
        { id: 'tasks', label: 'Tasks' },
        { id: 'reports', label: 'Reports' },
        { id: 'analytics', label: 'Analytics' },
    ];

    const RenderTasks = () => {
        if (isLoading) {
            return (
                <div className='flex items-center justify-center flex-1 w-full h-full'>
                    <AppLoader />
                </div>
            );
        }

        if (error) {
            return (
                <div className='py-12 text-center'>
                    <p className='text-xs font-normal uppercase text-destructive font-body'>
                        Failed to load tasks. Please try again.
                    </p>
                </div>
            );
        }

        switch (activeTab) {
            case 'tasks':
                return (
                    <div className='flex flex-col h-full overflow-hidden'>
                        <div className='flex-1 overflow-hidden'>
                            <TasksKanban
                                tasksByStatus={tasksByStatus}
                                onUpdateTaskStatus={handleUpdateTaskStatus}
                                onDeleteTask={handleDeleteTask}
                                onAddTask={handleCreateTask}
                            />
                        </div>
                        <div className='px-4 py-3'>
                            <TaskPagination
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
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
                            <div className='flex items-center justify-between w-full'>
                                <TasksFilter onApplyFilters={handleApplyFilters} onClearFilters={handleClearFilters} />
                                <Button onClick={handleCreateTask} className='ml-4' size='sm'>
                                    <PlusCircle className='w-4 h-4 mr-2' />
                                    <p className='text-xs font-normal uppercase font-body'>Add Task</p>
                                </Button>
                            </div>
                        </div>
                    )}
                    <div className='flex items-center justify-center flex-1 px-8 py-4 overflow-hidden'>
                        <RenderTasks />
                    </div>
                </div>
            </div>

            {/* Create Task Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className='sm:max-w-[425px]'>
                    <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                    </DialogHeader>
                    <div className='grid gap-4 py-4'>
                        <div className='grid gap-2'>
                            <Label htmlFor='title'>Title</Label>
                            <Input
                                id='title'
                                value={newTask.title}
                                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                placeholder='Task title'
                            />
                        </div>
                        <div className='grid gap-2'>
                            <Label htmlFor='description'>Description</Label>
                            <Textarea
                                id='description'
                                value={newTask.description}
                                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                placeholder='Task description'
                            />
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='grid gap-2'>
                                <Label htmlFor='priority'>Priority</Label>
                                <Select
                                    value={newTask.priority}
                                    onValueChange={value => setNewTask({ ...newTask, priority: value as TaskPriority })}
                                >
                                    <SelectTrigger id='priority'>
                                        <SelectValue placeholder='Select priority' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                                        <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                                        <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                                        <SelectItem value={TaskPriority.URGENT}>Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='grid gap-2'>
                                <Label htmlFor='taskType'>Type</Label>
                                <Select
                                    value={newTask.taskType}
                                    onValueChange={value => setNewTask({ ...newTask, taskType: value as TaskType })}
                                >
                                    <SelectTrigger id='taskType'>
                                        <SelectValue placeholder='Select type' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(TaskType).map(type => (
                                            <SelectItem key={type} value={type}>
                                                {type.replace(/_/g, ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className='grid gap-2'>
                            <Label htmlFor='deadline'>Deadline</Label>
                            <DatePicker
                                value={newTask.deadline}
                                onChange={date => setNewTask({ ...newTask, deadline: date })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateTaskSubmit}>Create Task</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageTransition>
    );
}
