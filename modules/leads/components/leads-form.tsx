import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LeadStatus } from '@/lib/types/lead';
import { useUsersQuery } from '@/hooks/use-users-query';
import { useAuthStore, selectProfileData } from '@/store/auth-store';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '@/lib/services/api-client';

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Plus as PlusIcon,
    Trash as TrashIcon,
    ChevronDown,
    Clock,
    Users,
    Building2,
    Mail,
    Phone,
    MapPin,
    Tag,
    BriefcaseBusiness,
    FileText,
    Paperclip,
    Upload,
    X,
    File as FileIcon,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

const leadFormSchema = z.object({
    name: z.string().optional(),
    companyName: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    notes: z.string().optional(),
    image: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    status: z.nativeEnum(LeadStatus).optional(),
    isDeleted: z.boolean().optional(),
    owner: z.object({
        uid: z.number(),
    }),
    assignTo: z
        .array(
            z.object({
                uid: z.number(),
            }),
        )
        .optional(), // This maps to the 'assignees' field in the API
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
    onSubmit: (data: LeadFormValues) => void;
    initialData?: Partial<LeadFormValues>;
    isLoading?: boolean;
}

/**
 * LeadForm component for creating and editing leads
 * The assignTo field is mapped to assignees in the backend API
 */
const LeadForm: React.FunctionComponent<LeadFormProps> = ({
    onSubmit,
    initialData,
    isLoading = false,
}) => {
    const profileData = useAuthStore(selectProfileData);
    const currentUserId = profileData?.uid ? parseInt(profileData.uid, 10) : 0;
    const currentBranchId = profileData?.branch?.uid ? profileData?.branch?.uid : 0;

    // State for file attachments
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

    const defaultValues: Partial<LeadFormValues> = {
        name: '',
        companyName: '',
        email: '',
        phone: '',
        notes: '',
        status: LeadStatus.PENDING,
        owner: { uid: currentUserId },
        assignTo: [],
        ...initialData,
    };

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<LeadFormValues>({
        resolver: zodResolver(leadFormSchema),
        defaultValues,
    });

    const { users } = useUsersQuery();

    const assignToWatch = watch('assignTo');
    const hasAssignees = Array.isArray(assignToWatch) && assignToWatch.length > 0;

    // Handle file selection for lead image
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
    const uploadFiles = async (files: File[]): Promise<string> => {
        if (files.length === 0) return '';

        setIsUploading(true);

        try {
            // Get access token from auth store
            const accessToken = useAuthStore.getState().accessToken;

            // Upload the first file (for lead image)
            const file = files[0];
            const formData = new FormData();
            formData.append('file', file);

            // Set file type based on MIME type
            const fileType = file.type.split('/')[0]; // Gets 'image' from 'image/png'
            formData.append('type', fileType);

            // Upload file
            const response = await axiosInstance.post('/docs/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${accessToken}`,
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / (progressEvent.total || 100)
                    );
                    setUploadProgress((prev) => ({
                        ...prev,
                        [file.name]: progress,
                    }));
                },
            });

            if (response.data.publicUrl) {
                return response.data.publicUrl;
            }

            return '';
        } catch (error) {
            console.error('Error uploading files:', error);
            toast.error('Failed to upload file. Please try again.');
            return '';
        } finally {
            setIsUploading(false);
            setUploadProgress({});
        }
    };

    const onFormSubmit = async (data: LeadFormValues) => {
        try {
            // Upload image if selected
            if (selectedFiles.length > 0) {
                setIsUploading(true);
                const imageUrl = await uploadFiles(selectedFiles);
                if (imageUrl) {
                    data.image = imageUrl;
                }
                setIsUploading(false);
            }

            // Add owner if not already set
            if (!data.owner || !data.owner.uid) {
                data.owner = { uid: currentUserId };
            }

            // Add branch information for the API (from user's profile)
            const leadData = {
                ...data,
                branch: { uid: currentBranchId }
            };

            onSubmit(leadData);
        } catch (error) {
            console.error('Error submitting lead form:', error);
            toast.error('Failed to create lead. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <fieldset disabled={isLoading} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                        <Label
                            htmlFor="name"
                            className="block text-xs font-light uppercase font-body"
                        >
                            Name
                        </Label>
                        <Input
                            id="name"
                            {...register('name')}
                            placeholder="Lead name"
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
                            htmlFor="companyName"
                            className="block text-xs font-light uppercase font-body"
                        >
                            Company Name
                        </Label>
                        <Input
                            id="companyName"
                            {...register('companyName')}
                            placeholder="Company name"
                            className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                        />
                        {errors.companyName && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.companyName.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                        <Label
                            htmlFor="email"
                            className="block text-xs font-light uppercase font-body"
                        >
                            Email
                        </Label>
                        <Input
                            id="email"
                            {...register('email')}
                            placeholder="Email address"
                            className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label
                            htmlFor="phone"
                            className="block text-xs font-light uppercase font-body"
                        >
                            Phone
                        </Label>
                        <Input
                            id="phone"
                            {...register('phone')}
                            placeholder="Phone number"
                            className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                        />
                        {errors.phone && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.phone.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <Label
                        htmlFor="notes"
                        className="block text-xs font-light uppercase font-body"
                    >
                        Notes
                    </Label>
                    <Textarea
                        id="notes"
                        {...register('notes')}
                        placeholder="Additional notes about the lead"
                        rows={4}
                        className="font-light resize-none bg-card border-border placeholder:text-xs placeholder:font-body"
                    />
                    {errors.notes && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.notes.message}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                        <Label
                            htmlFor="status"
                            className="block text-xs font-light uppercase font-body"
                        >
                            Status
                        </Label>
                        <Controller
                            control={control}
                            name="status"
                            render={({ field }) => (
                                <div className="relative">
                                    <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                        <div className="flex items-center gap-2">
                                            <Tag
                                                className="w-4 h-4 text-muted-foreground"
                                                strokeWidth={1.5}
                                            />
                                            <span className="text-[10px] font-thin font-body">
                                                {field.value || 'SELECT STATUS'}
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
                                            {Object.values(LeadStatus).map(
                                                (status) => (
                                                    <SelectItem
                                                        key={status}
                                                        value={status}
                                                    >
                                                        <span className="text-[10px] font-normal font-body">
                                                            {status.replace(
                                                                /_/g,
                                                                ' ',
                                                            )}
                                                        </span>
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        />
                        {errors.status && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.status.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label className="block text-xs font-light uppercase font-body">
                            Assign To
                        </Label>
                        <Controller
                            control={control}
                            name="assignTo"
                            render={({ field }) => (
                                <div className="relative">
                                    <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                        <div className="flex items-center gap-2">
                                            <Users
                                                className="w-4 h-4 text-muted-foreground"
                                                strokeWidth={1.5}
                                            />
                                            <span className="text-[10px] font-thin font-body">
                                                {hasAssignees
                                                    ? `${watch('assignTo')?.length} ${watch('assignTo')?.length === 1 ? 'USER' : 'USERS'} ASSIGNED`
                                                    : 'ASSIGN TO USERS'}
                                            </span>
                                        </div>
                                        <ChevronDown
                                            className="w-4 h-4 ml-2 opacity-50"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <Select
                                        onValueChange={(value: string) => {
                                            const uid = parseInt(value, 10);
                                            const existingAssignees =
                                                field.value || [];
                                            if (
                                                !existingAssignees.some(
                                                    (a: { uid: number }) =>
                                                        a.uid === uid,
                                                )
                                            ) {
                                                field.onChange([
                                                    ...existingAssignees,
                                                    { uid },
                                                ]);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                        <SelectContent className="overflow-y-auto max-h-60">
                                            {users?.map((user) => (
                                                <SelectItem
                                                    key={user.uid}
                                                    value={user.uid.toString()}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="w-6 h-6">
                                                            <AvatarImage
                                                                src={
                                                                    user.photoURL
                                                                }
                                                                alt={user.name}
                                                            />
                                                            <AvatarFallback className="text-[10px]">
                                                                {`${user.name.charAt(0)}${user.surname ? user.surname.charAt(0) : ''}`}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-[10px] font-normal font-body">
                                                            {user.name}
                                                            {user.surname
                                                                ? ` ${user.surname}`
                                                                : ''}{' '}
                                                            ({user.email})
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        />
                    </div>
                </div>

                {/* Location Fields REMOVED */}
                {/*
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                        <Label
                            htmlFor="latitude"
                            className="block text-xs font-light uppercase font-body"
                        >
                            Latitude
                        </Label>
                        <Input
                            id="latitude"
                            type="number"
                            step="any"
                            {...register('latitude', {
                                setValueAs: (v) => v === "" ? undefined : parseFloat(v),
                            })}
                            placeholder="Latitude coordinate"
                            className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                        />
                        {errors.latitude && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.latitude.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label
                            htmlFor="longitude"
                            className="block text-xs font-light uppercase font-body"
                        >
                            Longitude
                        </Label>
                        <Input
                            id="longitude"
                            type="number"
                            step="any"
                            {...register('longitude', {
                                setValueAs: (v) => v === "" ? undefined : parseFloat(v),
                            })}
                            placeholder="Longitude coordinate"
                            className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                        />
                        {errors.longitude && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.longitude.message}
                            </p>
                        )}
                    </div>
                </div>
                */}

                {/* Lead Image Upload */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <Paperclip className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Lead Image
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* File input button */}
                            <div className="flex flex-col items-center">
                                <label
                                    htmlFor="lead-image-upload"
                                    className="flex items-center gap-2 px-4 py-2 transition-colors rounded cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary"
                                >
                                    <Upload className="w-4 h-4" strokeWidth={1.5} />
                                    <span className="text-xs font-light uppercase font-body">
                                        Select Image
                                    </span>
                                </label>
                                <input
                                    id="lead-image-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileSelection}
                                    disabled={isLoading || isUploading}
                                />
                            </div>

                            {/* Selected image preview */}
                            {selectedFiles.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <p className="text-[9px] font-normal uppercase text-muted-foreground font-body">
                                        Selected Image
                                    </p>
                                    <div className="p-2 space-y-2 border rounded border-border">
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <FileIcon className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                                                    <span className="text-xs font-light font-body truncate max-w-[150px]">
                                                        {file.name}
                                                    </span>
                                                    <span className="ml-2 text-xs text-muted-foreground">
                                                        ({Math.round(file.size / 1024)} KB)
                                                    </span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-6 h-6 p-0"
                                                    onClick={() => removeFile(index)}
                                                >
                                                    <X className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                                </Button>
                                                {uploadProgress[file.name] && uploadProgress[file.name] < 100 && (
                                                    <Progress value={uploadProgress[file.name]} className="w-full h-1 mt-1" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Show existing image if available */}
                            {initialData?.image && !selectedFiles.length && (
                                <div className="mt-4 space-y-2">
                                    <p className="text-[9px] font-normal uppercase text-muted-foreground font-body">
                                        Current Image
                                    </p>
                                    <div className="p-2 border rounded border-border">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <img
                                                    src={initialData.image}
                                                    alt="Lead"
                                                    className="object-cover w-10 h-10 mr-2 rounded"
                                                />
                                                <span className="text-xs font-light font-body">
                                                    Current lead image
                                                </span>
                                            </div>
                                        </div>
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
                disabled={isLoading}
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
                        <span>Creating Lead...</span>
                    </div>
                ) : (
                    'Create Lead'
                )}
            </Button>
        </form>
    );
};

export default LeadForm;
