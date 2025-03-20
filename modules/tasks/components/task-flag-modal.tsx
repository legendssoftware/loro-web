import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '@/lib/services/api-client';
import { Task } from '@/lib/types/task';
import { TaskFlagForm, TaskFlagFormValues } from './task-flag-form';
import { showErrorToast } from '@/lib/utils/toast-config';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Flag } from 'lucide-react';

interface TaskFlagModalProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
    onFlagCreated?: (taskId: number) => void;
}

export const TaskFlagModal: React.FC<TaskFlagModalProps> = ({
    task,
    isOpen,
    onClose,
    onFlagCreated,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: TaskFlagFormValues) => {
        try {
            setIsSubmitting(true);

            // Ensure the correct taskId is set
            const flagData = {
                ...data,
                taskId: task.uid,
            };

            console.log('Creating task flag with data:', flagData);

            // Make API call to create task flag
            const response = await axiosInstance.post('/tasks/flags', flagData);

            console.log('Flag created successfully:', response.data);

            // Notify parent component
            if (onFlagCreated) {
                onFlagCreated(task.uid);
            }

            // Close the modal
            onClose();
        } catch (error: any) {
            console.error('Error creating task flag:', error);
            showErrorToast(
                error?.response?.data?.message ||
                    'Failed to flag task. Please try again.',
                toast,
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-thin uppercase font-body">
                        <Flag
                            className="w-5 h-5 text-amber-500"
                            strokeWidth={1.5}
                        />
                        Flag Task: {task.title}
                    </DialogTitle>
                </DialogHeader>

                <TaskFlagForm
                    taskId={task.uid}
                    taskTitle={task.title}
                    onSubmit={handleSubmit}
                    isLoading={isSubmitting}
                    onCancel={onClose}
                />
            </DialogContent>
        </Dialog>
    );
};
