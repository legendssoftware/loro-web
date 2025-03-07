'use client';

import { useState } from 'react';
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

interface CreateTaskFormProps {
    onClose: () => void;
    onSubmit?: (taskData: Partial<Task>) => void;
}

export function CreateTaskForm({ onClose, onSubmit }: CreateTaskFormProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [formData, setFormData] = useState<Partial<Task>>({
        title: '',
        description: '',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        taskType: TaskType.OTHER,
        deadline: undefined,
        progress: 0,
    });

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

    const steps = [
        {
            title: 'Basic Information',
            content: (
                <div className="space-y-4">
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
                    <div>
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
                </div>
            ),
        },
        {
            title: 'Details',
            content: (
                <div className="space-y-4">
                    <div>
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
                    <div>
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
                </div>
            ),
        },
        {
            title: 'Scheduling',
            content: (
                <div className="space-y-4">
                    <div>
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
                    <div>
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
            ),
        },
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prevStep => prevStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prevStep => prevStep - 1);
        }
    };

    const handleSubmit = () => {
        if (onSubmit) {
            onSubmit(formData);
        }
        onClose();
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold uppercase font-body">{steps[currentStep].title}</h2>
                <p className="text-xs text-muted-foreground font-body">
                    Step {currentStep + 1} of {steps.length}
                </p>
            </div>

            <div>{steps[currentStep].content}</div>

            <div className="flex justify-between mt-6">
                {currentStep > 0 ? (
                    <Button variant="outline" onClick={handleBack}>Back</Button>
                ) : (
                    <div></div>
                )}

                {currentStep < steps.length - 1 ? (
                    <Button onClick={handleNext}>Next</Button>
                ) : (
                    <Button onClick={handleSubmit}>Create</Button>
                )}
            </div>
        </div>
    );
}
