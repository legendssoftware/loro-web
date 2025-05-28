import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
    LeadStatus, 
    LeadIntent, 
    LeadTemperature, 
    LeadSource, 
    LeadPriority, 
    BusinessSize, 
    Industry, 
    BudgetRange, 
    Timeline, 
    CommunicationPreference 
} from '@/lib/types/lead';
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
    Target,
    ThermometerSun,
    Share2,
    AlertCircle,
    Building,
    DollarSign,
    Star,
    Loader2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

const leadFormSchema = z.object({
    name: z.string().optional(),
    companyName: z.string().optional(),
    email: z.string().optional().or(z.literal('')),
    phone: z.string().optional(),
    notes: z.string().optional(),
    image: z.string().nullable().optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    status: z.nativeEnum(LeadStatus).optional(),
    isDeleted: z.boolean().optional(),
    owner: z.object({
        uid: z.number().optional(),
    }).optional(),
    assignTo: z
        .array(
            z.object({
                uid: z.number().optional(),
            }),
        )
        .optional(),
    
    // Enhanced fields - all optional for editing
    intent: z.nativeEnum(LeadIntent).optional(),
    userQualityRating: z.number().optional(),
    temperature: z.nativeEnum(LeadTemperature).optional(),
    source: z.nativeEnum(LeadSource).optional(),
    priority: z.nativeEnum(LeadPriority).optional(),
    jobTitle: z.string().optional(),
    industry: z.nativeEnum(Industry).optional(),
    businessSize: z.nativeEnum(BusinessSize).optional(),
    budgetRange: z.nativeEnum(BudgetRange).optional(),
    purchaseTimeline: z.nativeEnum(Timeline).optional(),
    preferredCommunication: z.nativeEnum(CommunicationPreference).optional(),
    estimatedValue: z.number().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
    onSubmit: (data: LeadFormValues) => void;
    initialData?: Partial<LeadFormValues>;
    isLoading?: boolean;
    isEdit?: boolean;
}

/**
 * LeadForm component for creating and editing leads
 * The assignTo field is mapped to assignees in the backend API
 */
const LeadForm: React.FunctionComponent<LeadFormProps> = ({
    onSubmit,
    initialData,
    isLoading = false,
    isEdit = false,
}) => {
    const profileData = useAuthStore(selectProfileData);
    const currentUserId = profileData?.uid ? parseInt(profileData.uid, 10) : 0;
    const currentBranchId = profileData?.branch?.uid ? profileData?.branch?.uid : 0;

    // State for file attachments
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

    // Compute the correct owner value
    const correctOwner = initialData?.owner?.uid ? initialData.owner : { uid: currentUserId };

    const defaultValues: Partial<LeadFormValues> = {
        name: '',
        companyName: '',
        email: '',
        phone: '',
        notes: '',
        status: LeadStatus.PENDING,
        assignTo: [],
        // Enhanced field defaults
        temperature: LeadTemperature.COLD,
        priority: LeadPriority.MEDIUM,
        userQualityRating: 3,
        preferredCommunication: CommunicationPreference.EMAIL,
        ...initialData,
        // Ensure owner is properly set
        owner: correctOwner,
    };

    const {
        control,
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
        watch,
        setValue,
    } = useForm<LeadFormValues>({
        resolver: zodResolver(leadFormSchema),
        defaultValues,
    });

    // Debug logging for form state
    console.log('🔍 Form Debug Info:', {
        isEdit,
        isValid,
        isSubmitting,
        hasErrors: Object.keys(errors).length > 0,
        errors: errors,
        currentUserId,
        initialData,
        correctOwner
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
        console.log('📋 Form submitted with data:', data);
        console.log('✏️ Is Edit mode:', isEdit);
        
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

            // Handle owner field for new leads vs editing
            if (!isEdit) {
                // For new leads, ensure owner is set
                if (!data.owner || !data.owner.uid) {
                    data.owner = { uid: currentUserId };
                }
            } else {
                // For editing, keep existing owner or use current user if not set
                if (!data.owner || !data.owner.uid) {
                    data.owner = { uid: currentUserId };
                }
            }

            // Clean up null values for API compatibility
            const cleanData = {
                ...data,
                image: data.image || undefined,
                latitude: data.latitude || undefined,
                longitude: data.longitude || undefined,
            };

            // Map assignTo to assignees for the API
            const leadData = {
                ...cleanData,
                assignees: cleanData.assignTo, // Map assignTo to assignees
                assignTo: undefined, // Remove assignTo as it's not expected by the API
                // Only add branch for new leads
                ...(isEdit ? {} : { branch: { uid: currentBranchId } })
            };

            console.log('🚀 Calling onSubmit with processed data:', leadData);
            onSubmit(leadData);
        } catch (error) {
            console.error('Error submitting lead form:', error);
            toast.error(`Failed to ${isEdit ? 'update' : 'create'} lead. Please try again.`);
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
                                                    (a: { uid?: number }) =>
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

                {/* Enhanced Lead Qualification Fields */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <Target className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Lead Qualification
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* First Row - Intent & Source */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label className="flex items-center gap-1 text-xs font-light uppercase font-body">
                                    Intent
                                    <Star className="w-3 h-3 text-red-500" />
                                </Label>
                                <Controller
                                    control={control}
                                    name="intent"
                                    render={({ field }) => (
                                        <div className="relative">
                                            <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                <div className="flex items-center gap-2">
                                                    <Target className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                                    <span className="text-[10px] font-thin font-body">
                                                        {field.value ? field.value.replace(/_/g, ' ') : 'SELECT INTENT'}
                                                    </span>
                                                </div>
                                                    <ChevronDown className="w-4 h-4 ml-2 opacity-50" strokeWidth={1.5} />
                                                </div>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                                    <SelectContent>
                                                        {Object.values(LeadIntent).map((intent) => (
                                                            <SelectItem key={intent} value={intent}>
                                                                <span className="text-[10px] font-normal font-body">
                                                                    {intent.replace(/_/g, ' ')}
                                                                </span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="flex items-center gap-1 text-xs font-light uppercase font-body">
                                        Source
                                        <Star className="w-3 h-3 text-red-500" />
                                    </Label>
                                    <Controller
                                        control={control}
                                        name="source"
                                        render={({ field }) => (
                                            <div className="relative">
                                                <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                    <div className="flex items-center gap-2">
                                                        <Share2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                                        <span className="text-[10px] font-thin font-body">
                                                            {field.value ? field.value.replace(/_/g, ' ') : 'SELECT SOURCE'}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 ml-2 opacity-50" strokeWidth={1.5} />
                                                </div>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                                    <SelectContent>
                                                        {Object.values(LeadSource).map((source) => (
                                                            <SelectItem key={source} value={source}>
                                                                <span className="text-[10px] font-normal font-body">
                                                                    {source.replace(/_/g, ' ')}
                                                                </span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Second Row - Temperature & Priority */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <Label className="block text-xs font-light uppercase font-body">
                                        Temperature
                                    </Label>
                                    <Controller
                                        control={control}
                                        name="temperature"
                                        render={({ field }) => (
                                            <div className="relative">
                                                <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                    <div className="flex items-center gap-2">
                                                        <ThermometerSun className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                                        <span className="text-[10px] font-thin font-body">
                                                            {field.value || 'SELECT TEMPERATURE'}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 ml-2 opacity-50" strokeWidth={1.5} />
                                                </div>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                                    <SelectContent>
                                                        {Object.values(LeadTemperature).map((temp) => (
                                                            <SelectItem key={temp} value={temp}>
                                                                <span className="text-[10px] font-normal font-body">
                                                                    {temp}
                                                                </span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="block text-xs font-light uppercase font-body">
                                        Priority
                                    </Label>
                                    <Controller
                                        control={control}
                                        name="priority"
                                        render={({ field }) => (
                                            <div className="relative">
                                                <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                    <div className="flex items-center gap-2">
                                                        <AlertCircle className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                                        <span className="text-[10px] font-thin font-body">
                                                            {field.value || 'SELECT PRIORITY'}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 ml-2 opacity-50" strokeWidth={1.5} />
                                                </div>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                                    <SelectContent>
                                                        {Object.values(LeadPriority).map((priority) => (
                                                            <SelectItem key={priority} value={priority}>
                                                                <span className="text-[10px] font-normal font-body">
                                                                    {priority}
                                                                </span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Third Row - Industry & Business Size */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <Label className="flex items-center gap-1 text-xs font-light uppercase font-body">
                                        Industry
                                        <Star className="w-3 h-3 text-red-500" />
                                    </Label>
                                    <Controller
                                        control={control}
                                        name="industry"
                                        render={({ field }) => (
                                            <div className="relative">
                                                <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                    <div className="flex items-center gap-2">
                                                        <Building className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                                        <span className="text-[10px] font-thin font-body">
                                                            {field.value ? field.value.replace(/_/g, ' ') : 'SELECT INDUSTRY'}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 ml-2 opacity-50" strokeWidth={1.5} />
                                                </div>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                                    <SelectContent className="overflow-y-auto max-h-60">
                                                        {Object.values(Industry).map((industry) => (
                                                            <SelectItem key={industry} value={industry}>
                                                                <span className="text-[10px] font-normal font-body">
                                                                    {industry.replace(/_/g, ' ')}
                                                                </span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="block text-xs font-light uppercase font-body">
                                        Business Size
                                    </Label>
                                    <Controller
                                        control={control}
                                        name="businessSize"
                                        render={({ field }) => (
                                            <div className="relative">
                                                <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                                        <span className="text-[10px] font-thin font-body">
                                                            {field.value ? (() => {
                                                                switch (field.value) {
                                                                    case 'STARTUP':
                                                                        return '(1-10) STARTUP';
                                                                    case 'SMALL':
                                                                        return '(11-50) SMALL';
                                                                    case 'MEDIUM':
                                                                        return '(51-200) MEDIUM';
                                                                    case 'LARGE':
                                                                        return '(201-1000) LARGE';
                                                                    case 'ENTERPRISE':
                                                                        return '(1000+) ENTERPRISE';
                                                                    case 'UNKNOWN':
                                                                        return 'UNKNOWN';
                                                                    default:
                                                                        return field.value.replace(/_/g, ' ');
                                                                }
                                                            })() : 'SELECT SIZE'}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 ml-2 opacity-50" strokeWidth={1.5} />
                                                </div>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                                    <SelectContent>
                                                        {Object.values(BusinessSize).map((size) => {
                                                            let displayText = '';
                                                            switch (size) {
                                                                case 'STARTUP':
                                                                    displayText = '(1-10) Startup';
                                                                    break;
                                                                case 'SMALL':
                                                                    displayText = '(11-50) Small';
                                                                    break;
                                                                case 'MEDIUM':
                                                                    displayText = '(51-200) Medium';
                                                                    break;
                                                                case 'LARGE':
                                                                    displayText = '(201-1000) Large';
                                                                    break;
                                                                case 'ENTERPRISE':
                                                                    displayText = '(1000+) Enterprise';
                                                                    break;
                                                                case 'UNKNOWN':
                                                                    displayText = 'Unknown';
                                                                    break;
                                                                default:
                                                                    displayText = size.replace(/_/g, ' ');
                                                            }
                                                            return (
                                                                <SelectItem key={size} value={size}>
                                                                    <span className="text-[10px] font-normal font-body">
                                                                        {displayText}
                                                                    </span>
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Fourth Row - Budget Range & Quality Rating */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <Label className="flex items-center gap-1 text-xs font-light uppercase font-body">
                                        Budget Range
                                        <Star className="w-3 h-3 text-red-500" />
                                    </Label>
                                    <Controller
                                        control={control}
                                        name="budgetRange"
                                        render={({ field }) => (
                                            <div className="relative">
                                                <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                                        <span className="text-[10px] font-thin font-body">
                                                            {field.value ? field.value.replace(/_/g, ' ') : 'SELECT BUDGET'}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 ml-2 opacity-50" strokeWidth={1.5} />
                                                </div>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                                    <SelectContent>
                                                        {Object.values(BudgetRange).map((budget) => (
                                                            <SelectItem key={budget} value={budget}>
                                                                <span className="text-[10px] font-normal font-body">
                                                                    {budget.replace(/_/g, ' ')}
                                                                </span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="flex items-center gap-1 text-xs font-light uppercase font-body">
                                        Quality Rating (1-5)
                                        <Star className="w-3 h-3 text-red-500" />
                                    </Label>
                                    <Input
                                        {...register('userQualityRating', {
                                            setValueAs: (v) => v === "" ? undefined : parseInt(v, 10),
                                        })}
                                        type="number"
                                        min="1"
                                        max="5"
                                        placeholder="Rate lead quality (1-5)"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.userQualityRating && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.userQualityRating.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Fifth Row - Timeline & Communication Preference */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <Label className="block text-xs font-light uppercase font-body">
                                        Purchase Timeline
                                    </Label>
                                    <Controller
                                        control={control}
                                        name="purchaseTimeline"
                                        render={({ field }) => (
                                            <div className="relative">
                                                <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                                        <span className="text-[10px] font-thin font-body">
                                                            {field.value ? field.value.replace(/_/g, ' ') : 'SELECT TIMELINE'}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 ml-2 opacity-50" strokeWidth={1.5} />
                                                </div>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                                    <SelectContent>
                                                        {Object.values(Timeline).map((timeline) => (
                                                            <SelectItem key={timeline} value={timeline}>
                                                                <span className="text-[10px] font-normal font-body">
                                                                    {timeline.replace(/_/g, ' ')}
                                                                </span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="block text-xs font-light uppercase font-body">
                                        Preferred Communication
                                    </Label>
                                    <Controller
                                        control={control}
                                        name="preferredCommunication"
                                        render={({ field }) => (
                                            <div className="relative">
                                                <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                                        <span className="text-[10px] font-thin font-body">
                                                            {field.value ? field.value.replace(/_/g, ' ') : 'SELECT METHOD'}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 ml-2 opacity-50" strokeWidth={1.5} />
                                                </div>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                                    <SelectContent>
                                                        {Object.values(CommunicationPreference).map((pref) => (
                                                            <SelectItem key={pref} value={pref}>
                                                                <span className="text-[10px] font-normal font-body">
                                                                    {pref.replace(/_/g, ' ')}
                                                                </span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Sixth Row - Job Title & Estimated Value */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <Label className="block text-xs font-light uppercase font-body">
                                        Job Title
                                    </Label>
                                    <Input
                                        {...register('jobTitle')}
                                        placeholder="e.g. Marketing Manager"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.jobTitle && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.jobTitle.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label className="block text-xs font-light uppercase font-body">
                                        Estimated Value (R)
                                    </Label>
                                    <Input
                                        {...register('estimatedValue', {
                                            setValueAs: (v) => v === "" ? undefined : parseFloat(v),
                                        })}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="e.g. 50000.00"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.estimatedValue && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.estimatedValue.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

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

                {/* Debug Section - Remove after fixing */}
                {isEdit && process.env.NODE_ENV === 'development' && (
                    <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                        <h3 className="mb-2 text-sm font-medium text-yellow-800">Debug Info (Edit Mode)</h3>
                        <div className="space-y-1 text-xs">
                            <p><strong>Form Valid:</strong> {isValid ? 'Yes' : 'No'}</p>
                            <p><strong>Is Submitting:</strong> {isSubmitting ? 'Yes' : 'No'}</p>
                            <p><strong>Current User ID:</strong> {currentUserId}</p>
                            <p><strong>Has Errors:</strong> {Object.keys(errors).length > 0 ? 'Yes' : 'No'}</p>
                            {Object.keys(errors).length > 0 && (
                                <div>
                                    <strong>Validation Errors:</strong>
                                    <pre className="p-2 mt-1 overflow-auto text-xs border border-red-200 rounded bg-red-50">
                                        {JSON.stringify(errors, null, 2)}
                                    </pre>
                                </div>
                            )}
                            <button 
                                type="button" 
                                onClick={() => {
                                    console.log('🔧 Direct form data test:', watch());
                                    console.log('🔧 Current errors:', errors);
                                }}
                                className="px-2 py-1 text-xs text-white bg-blue-500 rounded"
                            >
                                Log Current Form Data
                            </button>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={isLoading || isUploading}
                    className="text-white bg-primary hover:bg-primary/90"
                >
                    {isLoading || isUploading ? (
                        <>
                            <span className="mr-2 text-xs font-normal uppercase font-body">
                                {isUploading ? 'Uploading...' : 'Processing...'}
                            </span>
                            <Loader2 className="w-4 h-4 animate-spin" />
                        </>
                    ) : (
                        <span className="text-xs font-normal uppercase font-body" >
                            {isEdit ? 'Update Lead' : 'Create Lead'}
                        </span>
                    )}
                </Button>

                {/* Debug Test Button - Remove after fixing */}
                {isEdit && process.env.NODE_ENV === 'development' && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                            console.log('🧪 Testing direct submit bypass...');
                            const currentData = watch();
                            console.log('🧪 Current form data:', currentData);
                            
                            // Create test data similar to what onFormSubmit would create
                            const testData = {
                                ...currentData,
                                assignees: currentData.assignTo,
                                assignTo: undefined,
                                owner: currentData.owner || { uid: currentUserId }
                            };
                            
                            console.log('🧪 Calling onSubmit directly with test data:', testData);
                            try {
                                await onSubmit(testData);
                                console.log('🧪 Direct submit test completed successfully');
                            } catch (error) {
                                console.error('🧪 Direct submit test failed:', error);
                            }
                        }}
                        className="ml-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                    >
                        <span className="text-xs font-normal uppercase font-body">
                            Test Direct Submit
                        </span>
                    </Button>
                )}
            </form>
        );
    };

    export default LeadForm;
