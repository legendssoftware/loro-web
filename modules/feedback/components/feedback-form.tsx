'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '@/lib/services/api-client';
import { FeedbackType } from '@/lib/types/feedback';

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
            // Upload each file sequentially
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('file', file);

                // Set file type based on MIME type
                const fileType = file.type.split('/')[0]; // Gets 'image' from 'image/png'
                formData.append('type', fileType);

                // Upload file
                const response = await axiosInstance.post(
                    '/docs/upload',
                    formData,
                    {
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

                if (response.data.publicUrl) {
                    uploadedUrls.push(response.data.publicUrl);
                }
            }

            return uploadedUrls;
        } catch (error) {
            console.error('Error uploading files:', error);
            toast.error('Failed to upload file(s). Please try again.');
            return [];
        }
    };

    // Handle form submission
    const onSubmit = async (data: FeedbackFormValues) => {
        try {
            setIsSubmitting(true);

            // Upload files if any are selected
            if (selectedFiles.length > 0) {
                const attachmentUrls = await uploadFiles(selectedFiles);

                // Add new uploads to any existing attachments
                data.attachments = [
                    ...(data.attachments || []),
                    ...attachmentUrls,
                ];
            }

            // Choose the appropriate API endpoint based on whether we have a token
            const endpoint = token
                ? '/feedback/submit-with-token'
                : '/feedback';

            const response = await axiosInstance.post(endpoint, data);

            toast.success('Your feedback has been submitted successfully!');
            reset();
            setSelectedFiles([]);

            // Redirect to success page
            setTimeout(() => {
                router.push('/feedback/thank-you');
            }, 1500);
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || 'Failed to submit feedback',
            );
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
            className="max-w-2xl mx-auto space-y-6"
        >
            <fieldset disabled={isSubmitting} className="space-y-6">
                {tokenData && (
                    <Card className="border-border/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                <BadgeCheck
                                    className="w-4 h-4 text-primary"
                                    strokeWidth={1.5}
                                />
                                <span className="font-light uppercase font-body">
                                    Task Information
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <span className="text-xs font-light uppercase font-body text-muted-foreground">
                                    Task:
                                </span>
                                <p className="text-sm font-medium">
                                    {tokenData.task?.title}
                                </p>
                            </div>
                            {tokenData.task?.description && (
                                <div>
                                    <span className="text-xs font-light uppercase font-body text-muted-foreground">
                                        Description:
                                    </span>
                                    <p className="text-sm">
                                        {tokenData.task?.description}
                                    </p>
                                </div>
                            )}
                            {tokenData.client && (
                                <div>
                                    <span className="text-xs font-light uppercase font-body text-muted-foreground">
                                        Client:
                                    </span>
                                    <p className="text-sm">
                                        {tokenData.client.name}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <MessageSquare
                                className="w-4 h-4"
                                strokeWidth={1.5}
                            />
                            <span className="font-light uppercase font-body">
                                Your Feedback
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="name"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Your Name{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    {...register('name')}
                                    placeholder="John Doe"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="email"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Email{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register('email')}
                                    placeholder="john.doe@example.com"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label
                                htmlFor="title"
                                className="block text-xs font-light uppercase font-body"
                            >
                                Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                {...register('title')}
                                placeholder="Feedback Title"
                                className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                            />
                            {errors.title && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.title.message}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="type"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Feedback Type{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name="type"
                                    render={({ field }) => (
                                        <div className="relative">
                                            <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                <div className="flex items-center gap-2">
                                                    {field.value &&
                                                        React.createElement(
                                                            typeIcons[
                                                                field.value as keyof typeof typeIcons
                                                            ] || Tag,
                                                            {
                                                                className:
                                                                    'w-4 h-4 text-muted-foreground',
                                                                strokeWidth: 1.5,
                                                            },
                                                        )}
                                                    <span className="text-[10px] font-thin font-body">
                                                        {field.value
                                                            ? field.value.replace(
                                                                  /_/g,
                                                                  ' ',
                                                              )
                                                            : 'SELECT TYPE'}
                                                    </span>
                                                </div>
                                                <ChevronDown
                                                    className="w-4 h-4 ml-2 opacity-50"
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
                                <Label
                                    htmlFor="rating"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Rating{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
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
                            <Label
                                htmlFor="comments"
                                className="block text-xs font-light uppercase font-body"
                            >
                                Your Feedback{' '}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="comments"
                                {...register('comments')}
                                placeholder="Please share your thoughts, suggestions, or any issues you've experienced..."
                                rows={5}
                                className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                            />
                            {errors.comments && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.comments.message}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* File Attachments Section */}
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
                                    htmlFor="feedback-files-upload"
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
                                    id="feedback-files-upload"
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileSelection}
                                    disabled={isSubmitting}
                                />
                                <p className="mt-2 text-[10px] text-muted-foreground font-body uppercase font-thin">
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
            </fieldset>

            {/* Submit Button */}
            <Button
                type="submit"
                className="w-full text-xs font-light text-white uppercase font-body"
                disabled={isSubmitting}
            >
                {isSubmitting ? (
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
                        <span>Submitting Feedback...</span>
                    </div>
                ) : (
                    'Submit Feedback'
                )}
            </Button>
        </form>
    );
};
