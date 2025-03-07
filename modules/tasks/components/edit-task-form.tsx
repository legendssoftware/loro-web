'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Task, TaskStatus, TaskPriority, TaskType } from '@/lib/types/task';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditTaskFormProps {
    task: Task;
    onClose: () => void;
    onSubmit?: (taskId: number, taskData: Partial<Task>) => void;
}

export function EditTaskForm({ task, onClose, onSubmit }: EditTaskFormProps) {
    const [date, setDate] = useState<Date | undefined>(task.deadline ? new Date(task.deadline) : undefined);
    const [formData, setFormData] = useState<Partial<Task>>({
        title: task.title || '',
        description: task.description || '',
        status: task.status || TaskStatus.PENDING,
        priority: task.priority || TaskPriority.MEDIUM,
        taskType: task.taskType || TaskType.OTHER,
        deadline: task.deadline,
        progress: task.progress || 0,
    });

    // Update form data if task changes
    useEffect(() => {
        setFormData({
            title: task.title || '',
            description: task.description || '',
            status: task.status || TaskStatus.PENDING,
            priority: task.priority || TaskPriority.MEDIUM,
            taskType: task.taskType || TaskType.OTHER,
            deadline: task.deadline,
            progress: task.progress || 0,
        });
        setDate(task.deadline ? new Date(task.deadline) : undefined);
    }, [task]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDateSelect = (date: Date | undefined) => {
        setDate(date);
        setFormData(prev => ({
            ...prev,
            deadline: date,
        }));
    };

    const handleSubmit = () => {
        if (onSubmit) {
            onSubmit(task.uid, formData);
        }
        onClose();
    };

    return (
        <div className="space-y-6">
            <div>
                <div>
                    <Label htmlFor="title" className="text-xs font-normal uppercase font-body">Title</Label>
                    <Input
                        id="title"
                        name="title"
                        value={formData.title || ''}
                        onChange={handleInputChange}
                        placeholder="Task title"
                        className="mt-1"
                    />
                </div>
                <div className="mt-4">
                    <Label htmlFor="description" className="text-xs font-normal uppercase font-body">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={formData.description || ''}
                        onChange={handleInputChange}
                        placeholder="Task description"
                        className="mt-1"
                        rows={4}
                    />
                </div>
                <div className="mt-4">
                    <Label htmlFor="taskType" className="text-xs font-normal uppercase font-body">Task Type</Label>
                    <Select
                        onValueChange={(value) => handleSelectChange('taskType', value)}
                        value={formData.taskType}
                    >
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select task type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={TaskType.CALL}>Call</SelectItem>
                            <SelectItem value={TaskType.EMAIL}>Email</SelectItem>
                            <SelectItem value={TaskType.FOLLOW_UP}>Follow Up</SelectItem>
                            <SelectItem value={TaskType.IN_PERSON_MEETING}>In-Person Meeting</SelectItem>
                            <SelectItem value={TaskType.VIRTUAL_MEETING}>Virtual Meeting</SelectItem>
                            <SelectItem value={TaskType.PROPOSAL}>Proposal</SelectItem>
                            <SelectItem value={TaskType.REPORT}>Report</SelectItem>
                            <SelectItem value={TaskType.QUOTATION}>Quotation</SelectItem>
                            <SelectItem value={TaskType.VISIT}>Visit</SelectItem>
                            <SelectItem value={TaskType.OTHER}>Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="mt-4">
                    <Label htmlFor="priority" className="text-xs font-normal uppercase font-body">Priority</Label>
                    <Select
                        onValueChange={(value) => handleSelectChange('priority', value)}
                        value={formData.priority}
                    >
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                            <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                            <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                            <SelectItem value={TaskPriority.URGENT}>Urgent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="mt-4">
                    <Label htmlFor="status" className="text-xs font-normal uppercase font-body">Status</Label>
                    <Select
                        onValueChange={(value) => handleSelectChange('status', value)}
                        value={formData.status}
                    >
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
                            <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                            <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
                            <SelectItem value={TaskStatus.CANCELLED}>Cancelled</SelectItem>
                            <SelectItem value={TaskStatus.POSTPONED}>Postponed</SelectItem>
                            <SelectItem value={TaskStatus.MISSED}>Missed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="mt-4">
                    <Label htmlFor="deadline" className="text-xs font-normal uppercase font-body">Deadline</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal mt-1",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Select a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateSelect}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={onClose} className="mr-2">Cancel</Button>
                <Button onClick={handleSubmit}>Save Changes</Button>
            </div>
        </div>
    );
}
