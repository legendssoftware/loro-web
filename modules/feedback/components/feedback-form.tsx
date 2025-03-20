'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '@/lib/services/api-client';
import { FeedbackType } from '@/lib/types/feedback';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    MessageSquare,
    Tag,
    Paperclip,
    Upload,
    X,
    File as FileIcon,
    ThumbsUp,
    AlertTriangle,
    HelpCircle,
    BadgeCheck,
    ChevronDown,
} from 'lucide-react';
import { StarRating } from '@/components/ui/star-rating';
import { cn } from '@/lib/utils';

// Form schema definition
const feedbackFormSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: z.string().email({ message: 'Valid email is required' }),
    title: z.string().min(1, { message: 'Title is required' }),
    type: z.nativeEnum(FeedbackType).default(FeedbackType.GENERAL),
    rating: z.number().min(1, { message: 'Rating is required' }).max(5),
    comments: z
        .string()
        .min(3, { message: 'Comment must be at least 3 characters' }),
    token: z.string().optional(),
    attachments: z.array(z.string()).optional(),
});

// Infer TypeScript type from the schema
export type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

export const FeedbackForm: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const type = searchParams.get('type') as FeedbackType | null;

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
    const [tokenData, setTokenData] = useState<any>(null);
    const [uploadProgress, setUploadProgress] = useState<{
        [key: string]: number;
    }>({});

    const typeIcons = {
        [FeedbackType.GENERAL]: HelpCircle,
        [FeedbackType.SUPPORT]: AlertTriangle,
        [FeedbackType.TASK]: BadgeCheck,
        [FeedbackType.SUGGESTION]: ThumbsUp,
    };

    // Initialize form with default values
    const {
        control,
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        reset,
    } = useForm<FeedbackFormValues>({
        resolver: zodResolver(feedbackFormSchema),
        defaultValues: {
            name: '',
            email: '',
            title: '',
            type: type ? type : FeedbackType.GENERAL,
            rating: 0,
            comments: '',
            token: token || undefined,
            attachments: [],
        },
    });

    // Validate token if present
    useEffect(() => {
        if (token) {
            const validateToken = async () => {
                try {
                    const response = await axiosInstance.get(
                        `/feedback/validate-token/${token}`,
                    );
                    setIsTokenValid(true);
                    setTokenData(response.data.data);

                    // Pre-fill form with data from token
                    if (response.data.data) {
                        setValue(
                            'name',
                            response.data.data.client?.contactPerson ||
                                response.data.data.client?.name ||
                                '',
                        );
                        setValue(
                            'email',
                            response.data.data.client?.email || '',
                        );
                        setValue(
                            'title',
                            `Feedback for: ${response.data.data.task?.title || 'Service'}`,
                        );
                        if (response.data.data.task) {
                            setValue('type', FeedbackType.TASK);
                        }
                    }
                } catch (error) {
                    setIsTokenValid(false);
                    toast.error('Invalid or expired feedback token');
                }
            };

            validateToken();
        } else {
            setIsTokenValid(true); // No token = valid for direct submission
        }
    }, [token, setValue]);

    // Handle file selection
    const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();

        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Convert FileList to Array
        const newFiles = Array.from(files).filter(
            (file) => !selectedFiles.some((f) => f.name === file.name)
        );

        // Check file count
        if (selectedFiles.length + newFiles.length > 5) {
            toast.error('Maximum 5 files allowed');
            return;
        }

        // Check file size (5MB limit)
        const oversizedFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            toast.error(`File(s) too large. Maximum size is 5MB per file.`);
            return;
        }

        setSelectedFiles([...selectedFiles, ...newFiles]);

        // Reset input value to allow selecting the same file again
        e.target.value = '';
    };

    // Remove a selected file
    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // Upload files
    const uploadFiles = async (files: File[]): Promise<string[]> => {
        const uploadedFileUrls: string[] = [];

        try {
            // Upload each file sequentially
            for (const file of files) {
                // Create form data
                const formData = new FormData();
                formData.append('file', file);
                formData.append('fileType', file.type || 'application/octet-stream');

                // Track progress and update state
                setUploadProgress(prev => ({
                    ...prev,
                    [file.name]: 0
                }));

                // Authorization headers
                const headers: Record<string, string> = {
                    'Content-Type': 'multipart/form-data',
                };

                // Add token if available
                const accessToken = localStorage.getItem('access_token');
                if (accessToken) {
                    headers['Authorization'] = `Bearer ${accessToken}`;
                }

                // Upload the file
                const response = await axiosInstance.post('/docs/upload', formData, {
                    headers,
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percentCompleted = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            setUploadProgress(prev => ({
                                ...prev,
                                [file.name]: percentCompleted
                            }));
                        }
                    },
                });

                // Add the uploaded file URL to our array
                if (response.data?.url) {
                    uploadedFileUrls.push(response.data.url);
                }
            }

            // Clear progress after all uploads
            setUploadProgress({});
            return uploadedFileUrls;
        } catch (error) {
            console.error('Error uploading files:', error);
            toast.error('Error uploading files. Please try again.');
            setUploadProgress({});
            return [];
        }
    };

    // Handle form submission
    const onSubmit = async (data: FeedbackFormValues) => {
        try {
            setIsSubmitting(true);

            // Upload files if any are selected
            let fileUrls: string[] = [];
            if (selectedFiles.length > 0) {
                fileUrls = await uploadFiles(selectedFiles);
            }

            // Choose the appropriate API endpoint based on whether we have a token
            const apiUrl = token
                ? `/feedback/token/${token}`
                : '/feedback';

            const payload = {
                ...data,
                attachments: fileUrls,
            };

            const response = await axiosInstance.post(apiUrl, payload);

            toast.success('Your feedback has been submitted successfully!');

            // Reset form and clear selected files
            reset();
            setSelectedFiles([]);

            // Redirect after successful submission
            if (response.data?.redirectUrl) {
                window.location.href = response.data.redirectUrl;
            } else {
                window.location.href = '/feedback/thank-you';
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // If the token is invalid, show error message
    if (isTokenValid === false) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                <AlertTriangle
                    className="w-16 h-16 mb-4 text-red-500"
                    strokeWidth={1.5}
                />
                <h2 className="mb-2 text-xl font-semibold">
                    Invalid or Expired Token
                </h2>
                <p className="mb-6 text-muted-foreground">
                    The feedback link you used is either invalid or has expired.
                    Please contact support for assistance.
                </p>
                <Button
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="text-xs font-light uppercase h-9 font-body"
                >
                    Return to Home
                </Button>
            </div>
        );
    }

    // If token is still validating, show loading state
    if (token && isTokenValid === null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-16 h-16 border-4 border-t-4 rounded-full border-primary border-t-transparent animate-spin"></div>
                <p className="mt-4 text-sm font-light text-center">
                    Validating your feedback link...
                </p>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-2xl mx-auto"
        >
            <div className="w-full p-6 space-y-6 shadow-lg sm:p-8 bg-white/10 backdrop-blur-lg rounded-xl">
                <fieldset disabled={isSubmitting} className="space-y-6">
                    {tokenData && (
                        <div className="p-4 border rounded-lg border-white/20 bg-white/5">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <BadgeCheck
                                        className="w-4 h-4 text-primary"
                                        strokeWidth={1.5}
                                    />
                                    <span className="text-xs font-light text-white uppercase font-body">
                                        Task Information
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-light uppercase text-white/60 font-body">
                                        Task:
                                    </span>
                                    <p className="text-sm text-white">
                                        {tokenData.task?.title}
                                    </p>
                                </div>
                                {tokenData.task?.description && (
                                    <div className="space-y-1">
                                        <span className="text-xs font-light uppercase text-white/60 font-body">
                                            Description:
                                        </span>
                                        <p className="text-sm text-white">
                                            {tokenData.task?.description}
                                        </p>
                                    </div>
                                )}
                                {tokenData.client && (
                                    <div className="space-y-1">
                                        <span className="text-xs font-light uppercase text-white/60 font-body">
                                            Client:
                                        </span>
                                        <p className="text-sm text-white">
                                            {tokenData.client.name}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <label
                                    htmlFor="name"
                                    className="block text-xs font-light text-white uppercase font-body"
                                >
                                    Your Name{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="name"
                                    {...register('name')}
                                    placeholder="John Doe"
                                    className={cn(
                                        'bg-white/10 border-white/20 text-white placeholder:text-white/50 font-light',
                                        errors.name && 'border-red-500 focus-visible:ring-red-500'
                                    )}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label
                                    htmlFor="email"
                                    className="block text-xs font-light text-white uppercase font-body"
                                >
                                    Email{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register('email')}
                                    placeholder="john.doe@example.com"
                                    className={cn(
                                        'bg-white/10 border-white/20 text-white placeholder:text-white/50 font-light',
                                        errors.email && 'border-red-500 focus-visible:ring-red-500'
                                    )}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="title"
                                className="block text-xs font-light text-white uppercase font-body"
                            >
                                Title <span className="text-red-500">*</span>
                            </label>
                            <Input
                                id="title"
                                {...register('title')}
                                placeholder="Feedback Title"
                                className={cn(
                                    'bg-white/10 border-white/20 text-white placeholder:text-white/50 font-light',
                                    errors.title && 'border-red-500 focus-visible:ring-red-500'
                                )}
                            />
                            {errors.title && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.title.message}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <label
                                    htmlFor="type"
                                    className="block text-xs font-light text-white uppercase font-body"
                                >
                                    Feedback Type{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Controller
                                    control={control}
                                    name="type"
                                    render={({ field }) => (
                                        <div className="relative">
                                            <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-white/10 border-white/20">
                                                <div className="flex items-center gap-2">
                                                    {field.value &&
                                                        React.createElement(
                                                            typeIcons[
                                                                field.value as keyof typeof typeIcons
                                                            ] || Tag,
                                                            {
                                                                className:
                                                                    'w-4 h-4 text-white/70',
                                                                strokeWidth: 1.5,
                                                            },
                                                        )}
                                                    <span className="text-[10px] font-thin text-white font-body">
                                                        {field.value
                                                            ? field.value.replace(
                                                                  /_/g,
                                                                  ' ',
                                                              )
                                                            : 'SELECT TYPE'}
                                                    </span>
                                                </div>
                                                <ChevronDown
                                                    className="w-4 h-4 ml-2 text-white opacity-50"
                                                    strokeWidth={1.5}
                                                />
                                            </div>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                                <SelectContent>
                                                    {Object.values(
                                                        FeedbackType,
                                                    ).map((type) => (
                                                        <SelectItem
                                                            key={type}
                                                            value={type}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {React.createElement(
                                                                    typeIcons[
                                                                        type as keyof typeof typeIcons
                                                                    ] || Tag,
                                                                    {
                                                                        className:
                                                                            'w-4 h-4',
                                                                        strokeWidth: 1.5,
                                                                    },
                                                                )}
                                                                <span className="text-[10px] font-normal font-body">
                                                                    {type.replace(
                                                                        /_/g,
                                                                        ' ',
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                />
                                {errors.type && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.type.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label
                                    htmlFor="rating"
                                    className="block text-xs font-light text-white uppercase font-body"
                                >
                                    Rating{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Controller
                                    control={control}
                                    name="rating"
                                    render={({ field }) => (
                                        <div className="py-2">
                                            <StarRating
                                                rating={field.value}
                                                onChange={field.onChange}
                                                size={24}
                                            />
                                        </div>
                                    )}
                                />
                                {errors.rating && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.rating.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="comments"
                                className="block text-xs font-light text-white uppercase font-body"
                            >
                                Your Feedback{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                id="comments"
                                {...register('comments')}
                                placeholder="Please share your thoughts, suggestions, or any issues you've experienced..."
                                rows={5}
                                className={cn(
                                    'bg-white/10 border-white/20 text-white placeholder:text-white/50 font-light resize-none',
                                    errors.comments && 'border-red-500 focus-visible:ring-red-500'
                                )}
                            />
                            {errors.comments && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.comments.message}
                                </p>
                            )}
                        </div>

                        {/* File Attachments Section */}
                        <div className="space-y-1">
                            <label className="block text-xs font-light text-white uppercase font-body">
                                Attachments
                            </label>
                            <div className="p-4 space-y-4 border rounded border-white/20 bg-white/5">
                                {/* File input button */}
                                <div className="flex flex-col items-center">
                                    <label
                                        htmlFor="feedback-files-upload"
                                        className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded cursor-pointer bg-white/10 hover:bg-white/20"
                                    >
                                        <Upload className="w-4 h-4" strokeWidth={1.5} />
                                        <span className="text-xs font-light uppercase font-body">
                                            Select Files
                                        </span>
                                    </label>
                                    <input
                                        id="feedback-files-upload"
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={handleFileSelection}
                                        disabled={isSubmitting}
                                    />
                                    <p className="mt-2 text-[10px] text-white/50 font-light">
                                        Max 5 files, 5MB each (PDF, Images, Documents)
                                    </p>
                                </div>

                                {/* Selected files list */}
                                {selectedFiles.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <p className="text-[10px] font-normal uppercase text-white/70 font-body">
                                            Selected Files ({selectedFiles?.length})
                                        </p>
                                        <div className="space-y-2">
                                            {selectedFiles.map((file, index) => (
                                                <div key={index} className="flex flex-col p-2 border rounded bg-white/5 border-white/10">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center max-w-[80%]">
                                                            <FileIcon className="w-4 h-4 mr-2 text-white/70" strokeWidth={1.5} />
                                                            <span className="text-xs font-light text-white truncate max-w-[200px]">
                                                                {file.name}
                                                            </span>
                                                            <span className="ml-2 text-[10px] text-white/50">
                                                                ({Math.round(file.size / 1024)} KB)
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile(index)}
                                                            className="p-1 transition-colors rounded-full hover:bg-white/10 text-white/70 hover:text-white"
                                                        >
                                                            <X className="w-3 h-3" strokeWidth={1.5} />
                                                        </button>
                                                    </div>

                                                    {/* Upload progress indicator */}
                                                    {uploadProgress[file.name] !== undefined && uploadProgress[file.name] < 100 && (
                                                        <div className="w-full mt-2 h-0.5 bg-white/10 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary"
                                                                style={{ width: `${uploadProgress[file.name]}%` }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </fieldset>

                {/* Submit Button */}
                <Button
                    type="submit"
                    className={cn(
                        "w-full h-10 font-light text-white uppercase font-body bg-primary hover:bg-primary/90",
                        isSubmitting && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-xs font-light uppercase">
                                Submitting Feedback
                            </span>
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
                        </div>
                    ) : (
                        'Submit Feedback'
                    )}
                </Button>
            </div>
        </form>
    );
};
