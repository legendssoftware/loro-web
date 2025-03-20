import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { showErrorToast } from '@/lib/utils/toast-config';
import { useAuthStore, selectProfileData } from '@/store/auth-store';
import { axiosInstance } from '@/lib/services/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Plus as PlusIcon,
    Trash as TrashIcon,
    ChevronDown,
    Flag,
    AlertTriangle,
    CalendarClock,
    Paperclip,
    Upload,
    X,
    File as FileIcon,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

// Define the schema for task flag form
const taskFlagFormSchema = z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    description: z.string().min(1, { message: 'Description is required' }),
    taskId: z.number().positive({ message: 'Task ID is required' }),
    deadline: z.date().optional(),
    comment: z.string().optional(),
    items: z
        .array(
            z.object({
                title: z.string().min(1, { message: 'Item title is required' }),
                description: z.string().optional(),
            }),
        )
        .optional(),
    attachments: z.array(z.string()).optional(),
});

// Infer TypeScript type from the schema
export type TaskFlagFormValues = z.infer<typeof taskFlagFormSchema>;

interface TaskFlagFormProps {
    taskId: number;
    taskTitle?: string;
    onSubmit: (data: TaskFlagFormValues) => void;
    isLoading?: boolean;
    onCancel?: () => void;
}

export const TaskFlagForm: React.FC<TaskFlagFormProps> = ({
    taskId,
    taskTitle,
    onSubmit,
    isLoading = false,
    onCancel,
}) => {
    const profileData = useAuthStore(selectProfileData);
    const currentUserId = profileData?.uid ? parseInt(profileData.uid, 10) : 0;

    // State for file attachments
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<{
        [key: string]: number;
    }>({});

    // Initialize form with default values
    const form = useForm<TaskFlagFormValues>({
        resolver: zodResolver(taskFlagFormSchema),
        defaultValues: {
            title: taskTitle ? `Flag: ${taskTitle}` : '',
            description: '',
            taskId: taskId,
            items: [{ title: '', description: '' }],
            attachments: [],
        },
    });

    // Setup field array for checklist items
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items',
    });

    // Handle file selection
    const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Convert FileList to array and append to existing files
        const newFiles = Array.from(files);
        setSelectedFiles((prev) => [...prev, ...newFiles]);
    };

    // Remove a selected file
    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // Upload files
    const uploadFiles = async (files: File[]): Promise<string[]> => {
        const uploadedUrls: string[] = [];

        try {
            // Get access token for authorization
            const accessToken = useAuthStore.getState().accessToken;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('file', file);

                // Set file type based on MIME type
                const fileType = file.type.split('/')[0]; // Gets 'image' from 'image/png'
                formData.append('type', fileType);

                console.log(`Uploading file ${i+1}/${files.length}: ${file.name}`);

                // Upload file
                const response = await axiosInstance.post(
                    '/docs/upload',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${accessToken}`,
                        },
                        onUploadProgress: (progressEvent) => {
                            const progress = Math.round(
                                (progressEvent.loaded * 100) /
                                    (progressEvent.total || 100),
                            );
                            setUploadProgress((prev) => ({
                                ...prev,
                                [file.name]: progress,
                            }));
                        },
                    },
                );

                if (response.data && response.data.publicUrl) {
                    console.log(`File uploaded successfully: ${response.data.publicUrl}`);
                    uploadedUrls.push(response.data.publicUrl);
                } else {
                    console.error('Upload response missing publicUrl:', response.data);
                }
            }

            return uploadedUrls;
        } catch (error) {
            console.error('Error uploading files:', error);
            showErrorToast(
                'Failed to upload file(s). Please try again.',
                toast,
            );
            return [];
        }
    };

    // Handle form submission
    const handleSubmit = async (data: TaskFlagFormValues) => {
        try {
            let attachmentUrls: string[] = [];

            // Upload files if any are selected
            if (selectedFiles.length > 0) {
                attachmentUrls = await uploadFiles(selectedFiles);

                if (attachmentUrls.length !== selectedFiles.length) {
                    console.warn(`Not all files were uploaded successfully. Expected: ${selectedFiles.length}, Got: ${attachmentUrls.length}`);
                }

                data.attachments = [
                    ...(data.attachments || []),
                    ...attachmentUrls,
                ];
            }

            // Filter out empty checklist items
            if (data.items && data.items.length > 0) {
                data.items = data.items.filter(
                    (item) => item.title && item.title.trim() !== '',
                );
            }

            console.log('Submitting flag data:', data);

            // Call the onSubmit prop
            onSubmit(data);
        } catch (error) {
            console.error('Error submitting task flag:', error);
            showErrorToast(
                'Failed to submit task flag. Please try again.',
                toast,
            );
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
            >
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <Flag
                                className="w-4 h-4 text-amber-500"
                                strokeWidth={1.5}
                            />
                            <span className="font-light uppercase font-body">
                                Flag Details
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-light uppercase font-body">
                                        Flag Title{' '}
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Issue with task completion"
                                            className="font-normal uppercase text-[10px] bg-card border-border font-body placeholder:text-xs placeholder:font-body"
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs text-red-500" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-light uppercase font-body">
                                        Description{' '}
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Explain why this task is being flagged..."
                                            rows={4}
                                            className="font-normal uppercase text-[10px] bg-card border-border font-body placeholder:text-xs placeholder:font-body"
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs text-red-500" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="deadline"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="text-xs font-light uppercase font-body">
                                        Deadline
                                    </FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={'outline'}
                                                    className={`w-full pl-3 text-left font-normal ${!field.value ? 'text-muted-foreground' : ''}`}
                                                    disabled={isLoading}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <CalendarClock
                                                            className="w-4 h-4 opacity-70"
                                                            strokeWidth={1.5}
                                                        />
                                                        {field.value ? (
                                                            <span className="text-xs font-light font-body">
                                                                {field.value.toDateString()}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs font-light font-body">
                                                                Select a
                                                                resolution
                                                                deadline
                                                            </span>
                                                        )}
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 ml-auto opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date <
                                                    new Date(
                                                        new Date().setHours(
                                                            0,
                                                            0,
                                                            0,
                                                            0,
                                                        ),
                                                    )
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage className="text-xs text-red-500" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-light uppercase font-body">
                                        Initial Comment
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Add additional notes or context..."
                                            rows={2}
                                            className="font-normal uppercase text-[10px] bg-card border-border font-body placeholder:text-xs placeholder:font-body"
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs text-red-500" />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Checklist Items */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between gap-2 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <AlertTriangle
                                    className="w-4 h-4 text-amber-500"
                                    strokeWidth={1.5}
                                />
                                <span className="font-light uppercase font-body">
                                    Resolution Checklist
                                </span>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={() =>
                                    append({ title: '', description: '' })
                                }
                                disabled={isLoading}
                            >
                                <PlusIcon
                                    className="w-4 h-4 mr-1"
                                    strokeWidth={1.5}
                                />
                                <span className="text-xs font-light uppercase font-body">
                                    Add Item
                                </span>
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-4">
                                <p className="text-sm text-muted-foreground">
                                    No checklist items added yet.
                                </p>
                            </div>
                        ) : (
                            fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="p-3 space-y-2 border rounded-md border-border/50"
                                >
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-light uppercase font-body">
                                            Item {index + 1}
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="w-6 h-6 p-0"
                                            onClick={() => remove(index)}
                                            disabled={
                                                isLoading || fields.length <= 1
                                            }
                                        >
                                            <TrashIcon
                                                className="w-4 h-4 text-red-500"
                                                strokeWidth={1.5}
                                            />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.title`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Checklist item title"
                                                            className="font-normal uppercase text-[10px] bg-card border-border font-body placeholder:text-xs placeholder:font-body"
                                                            disabled={isLoading}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs text-red-500" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.description`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            placeholder="Item description (optional)"
                                                            rows={2}
                                                            className="font-normal uppercase text-[10px] bg-card border-border font-body placeholder:text-xs placeholder:font-body"
                                                            disabled={isLoading}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs text-red-500" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* File Attachments */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <Paperclip className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Attachments
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* File input button */}
                            <div className="flex flex-col items-center">
                                <label
                                    htmlFor="task-flag-files-upload"
                                    className="flex items-center gap-2 px-4 py-2 transition-colors rounded cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary"
                                >
                                    <Upload
                                        className="w-4 h-4"
                                        strokeWidth={1.5}
                                    />
                                    <span className="text-xs font-light uppercase font-body">
                                        Add Files
                                    </span>
                                </label>
                                <input
                                    id="task-flag-files-upload"
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileSelection}
                                    disabled={isLoading}
                                />
                                <p className="mt-2 text-[10px] text-muted-foreground">
                                    You can upload screenshots, documents, or
                                    any other relevant files.
                                </p>
                            </div>

                            {/* Selected files list */}
                            {selectedFiles.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <p className="text-[9px] font-normal uppercase text-muted-foreground font-body">
                                        Selected Files ({selectedFiles?.length})
                                    </p>
                                    <div className="p-2 space-y-2 border rounded border-border">
                                        {selectedFiles.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex items-center">
                                                    <FileIcon
                                                        className="w-4 h-4 mr-2 text-muted-foreground"
                                                        strokeWidth={1.5}
                                                    />
                                                    <span className="text-xs font-light font-body truncate max-w-[150px]">
                                                        {file.name}
                                                    </span>
                                                    <span className="ml-2 text-xs text-muted-foreground">
                                                        (
                                                        {Math.round(
                                                            file.size / 1024,
                                                        )}{' '}
                                                        KB)
                                                    </span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-6 h-6 p-0"
                                                    onClick={() =>
                                                        removeFile(index)
                                                    }
                                                >
                                                    <X
                                                        className="w-4 h-4 text-muted-foreground"
                                                        strokeWidth={1.5}
                                                    />
                                                </Button>
                                                {uploadProgress[file.name] &&
                                                    uploadProgress[file.name] <
                                                        100 && (
                                                        <Progress
                                                            value={
                                                                uploadProgress[
                                                                    file.name
                                                                ]
                                                            }
                                                            className="w-full h-1 mt-1"
                                                        />
                                                    )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Form Actions */}
                <div className="flex justify-end gap-2">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="text-xs font-light uppercase font-body"
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="text-xs font-light uppercase font-body"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="animate-spin">
                                    <svg
                                        className="w-4 h-4"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                </span>
                                <span>Submitting...</span>
                            </div>
                        ) : (
                            'Submit Flag'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
