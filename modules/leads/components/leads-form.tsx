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
    CommunicationPreference,
    DecisionMakerRole,
    LeadLifecycleStage
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
    Calendar,
    User,
    TrendingUp,
    MessageSquare,
    Activity,
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

    // Additional fields from server entity
    decisionMakerRole: z.nativeEnum(DecisionMakerRole).optional(),
    lifecycleStage: z.nativeEnum(LeadLifecycleStage).optional(),
    timezone: z.string().optional(),
    bestContactTime: z.string().optional(),
    painPoints: z.string().optional(),
    competitorInfo: z.string().optional(),
    referralSource: z.string().optional(),
    campaignName: z.string().optional(),
    landingPage: z.string().optional(),
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
    utmTerm: z.string().optional(),
    utmContent: z.string().optional(),
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
        // Additional field defaults
        decisionMakerRole: undefined,
        lifecycleStage: LeadLifecycleStage.LEAD,
        timezone: '',
        bestContactTime: '',
        painPoints: '',
        competitorInfo: '',
        referralSource: '',
        campaignName: '',
        landingPage: '',
        utmSource: '',
        utmMedium: '',
        utmCampaign: '',
        utmTerm: '',
        utmContent: '',
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
                                    <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                        <div className="flex gap-2 items-center">
                                            <Tag
                                                className="w-4 h-4 text-muted-foreground"
                                                strokeWidth={1.5}
                                            />
                                            <span className="text-[10px] font-thin font-body">
                                                {field.value || 'SELECT STATUS'}
                                            </span>
                                        </div>
                                        <ChevronDown
                                            className="ml-2 w-4 h-4 opacity-50"
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
                                    <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                        <div className="flex gap-2 items-center">
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
                                            className="ml-2 w-4 h-4 opacity-50"
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
                                                    <div className="flex gap-2 items-center">
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
                        <CardTitle className="flex gap-2 items-center text-sm font-medium">
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
                                <Label className="flex gap-1 items-center text-xs font-light uppercase font-body">
                                    Intent
                                    <Star className="w-3 h-3 text-red-500" />
                                </Label>
                                <Controller
                                    control={control}
                                    name="intent"
                                    render={({ field }) => (
                                        <div className="relative">
                                            <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                <div className="flex gap-2 items-center">
                                                    <Target className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                                    <span className="text-[10px] font-thin font-body">
                                                        {field.value ? field.value.replace(/_/g, ' ') : 'SELECT INTENT'}
                                                    </span>
                                                </div>
                                                    <ChevronDown className="ml-2 w-4 h-4 opacity-50" strokeWidth={1.5} />
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
                                    <Label className="flex gap-1 items-center text-xs font-light uppercase font-body">
                                        Source
                                        <Star className="w-3 h-3 text-red-500" />
                                    </Label>
                                    <Controller
                                        control={control}
                                        name="source"
                                        render={({ field }) => (
                                            <div className="relative">
                                                <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                    <div className="flex gap-2 items-center">
                                                        <Share2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                                        <span className="text-[10px] font-thin font-body">
                                                            {field.value ? field.value.replace(/_/g, ' ') : 'SELECT SOURCE'}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className="ml-2 w-4 h-4 opacity-50" strokeWidth={1.5} />
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
                                                <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                    <div className="flex gap-2 items-center">
                                                        <ThermometerSun className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                                        <span className="text-[10px] font-thin font-body">
                                                            {field.value || 'SELECT TEMPERATURE'}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className="ml-2 w-4 h-4 opacity-50" strokeWidth={1.5} />
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
                                                <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                    <div className="flex gap-2 items-center">
                                                        <AlertCircle className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                                        <span className="text-[10px] font-thin font-body">
                                                            {field.value || 'SELECT PRIORITY'}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className="ml-2 w-4 h-4 opacity-50" strokeWidth={1.5} />
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
                                    <Label className="flex gap-1 items-center text-xs font-light uppercase font-body">
                                        Industry
                                        <Star className="w-3 h-3 text-red-500" />
                                    </Label>
                                    <Controller
                                        control={control}
                                        name="industry"
                                        render={({ field }) => (
                                            <div className="relative">
                                                <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                    <div className="flex gap-2 items-center">
                                                        <Building className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                                        <span className="text-[10px] font-thin font-body">
                                                            {field.value ? field.value.replace(/_/g, ' ') : 'SELECT INDUSTRY'}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className="ml-2 w-4 h-4 opacity-50" strokeWidth={1.5} />
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
                                                <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                    <div className="flex gap-2 items-center">
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
                                                    <ChevronDown className="ml-2 w-4 h-4 opacity-50" strokeWidth={1.5} />
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
                                    <Label className="flex gap-1 items-center text-xs font-light uppercase font-body">
                                        Budget Range
                                        <Star className="w-3 h-3 text-red-500" />
                                    </Label>
                                    <Controller
                                        control={control}
                                        name="budgetRange"
                                        render={({ field }) => (
                                            <div className="relative">
                                                <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                    <div className="flex gap-2 items-center">
                                                        <DollarSign className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                                        <span className="text-[10px] font-thin font-body">
                                                            {field.value ? field.value.replace(/_/g, ' ') : 'SELECT BUDGET'}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className="ml-2 w-4 h-4 opacity-50" strokeWidth={1.5} />
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
                                    <Label className="flex gap-1 items-center text-xs font-light uppercase font-body">
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
                                                <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                    <div className="flex gap-2 items-center">
                                                        <Clock className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                                        <span className="text-[10px] font-thin font-body">
                                                            {field.value ? field.value.replace(/_/g, ' ') : 'SELECT TIMELINE'}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className="ml-2 w-4 h-4 opacity-50" strokeWidth={1.5} />
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
                                                <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                    <div className="flex gap-2 items-center">
                                                        <Phone className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                                        <span className="text-[10px] font-thin font-body">
                                                            {field.value ? field.value.replace(/_/g, ' ') : 'SELECT METHOD'}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className="ml-2 w-4 h-4 opacity-50" strokeWidth={1.5} />
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

                    {/* Contact & Personal Details Section */}
                    <Card className="border-border/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex gap-2 items-center text-sm font-medium">
                                <User className="w-4 h-4" strokeWidth={1.5} />
                                <span className="font-light uppercase font-body">
                                    Contact & Personal Details
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Decision Maker Role & Lifecycle Stage */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <Label className="block text-xs font-light uppercase font-body">
                                        Decision Maker Role
                                    </Label>
                                    <Controller
                                        control={control}
                                        name="decisionMakerRole"
                                        render={({ field }) => (
                                            <div className="relative">
                                                <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                    <div className="flex gap-2 items-center">
                                                        <Users className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                                        <span className="text-[10px] font-thin font-body">
                                                            {field.value ? field.value.replace(/_/g, ' ') : 'SELECT ROLE'}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className="ml-2 w-4 h-4 opacity-50" strokeWidth={1.5} />
                                                </div>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                                    <SelectContent>
                                                        {Object.values(DecisionMakerRole).map((role) => (
                                                            <SelectItem key={role} value={role}>
                                                                <span className="text-[10px] font-normal font-body">
                                                                    {role.replace(/_/g, ' ')}
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
                                        Lifecycle Stage
                                    </Label>
                                    <Controller
                                        control={control}
                                        name="lifecycleStage"
                                        render={({ field }) => (
                                            <div className="relative">
                                                <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                    <div className="flex gap-2 items-center">
                                                        <TrendingUp className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                                        <span className="text-[10px] font-thin font-body">
                                                            {field.value ? field.value.replace(/_/g, ' ') : 'SELECT STAGE'}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className="ml-2 w-4 h-4 opacity-50" strokeWidth={1.5} />
                                                </div>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                                    <SelectContent>
                                                        {Object.values(LeadLifecycleStage).map((stage) => (
                                                            <SelectItem key={stage} value={stage}>
                                                                <span className="text-[10px] font-normal font-body">
                                                                    {stage.replace(/_/g, ' ')}
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
                        </CardContent>
                    </Card>

                    {/* Communication Preferences Section */}
                    <Card className="border-border/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex gap-2 items-center text-sm font-medium">
                                <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                                <span className="font-light uppercase font-body">
                                    Communication Preferences
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Timezone & Best Contact Time */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <Label className="block text-xs font-light uppercase font-body">
                                        Timezone
                                    </Label>
                                    <Input
                                        {...register('timezone')}
                                        placeholder="e.g. Africa/Johannesburg"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.timezone && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.timezone.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label className="block text-xs font-light uppercase font-body">
                                        Best Contact Time
                                    </Label>
                                    <Input
                                        {...register('bestContactTime')}
                                        placeholder="e.g. 9:00-17:00"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.bestContactTime && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.bestContactTime.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pain Points & Competitive Info Section */}
                    <Card className="border-border/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex gap-2 items-center text-sm font-medium">
                                <Activity className="w-4 h-4" strokeWidth={1.5} />
                                <span className="font-light uppercase font-body">
                                    Pain Points & Competitive Info
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Pain Points */}
                            <div className="space-y-1">
                                <Label className="block text-xs font-light uppercase font-body">
                                    Pain Points
                                </Label>
                                <Textarea
                                    {...register('painPoints')}
                                    placeholder="Describe the lead's pain points and challenges..."
                                    rows={3}
                                    className="font-light resize-none bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.painPoints && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.painPoints.message}
                                    </p>
                                )}
                            </div>

                            {/* Competitor Info & Referral Source */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <Label className="block text-xs font-light uppercase font-body">
                                        Competitor Info
                                    </Label>
                                    <Textarea
                                        {...register('competitorInfo')}
                                        placeholder="Current provider or competitors being considered..."
                                        rows={3}
                                        className="font-light resize-none bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.competitorInfo && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.competitorInfo.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label className="block text-xs font-light uppercase font-body">
                                        Referral Source
                                    </Label>
                                    <Input
                                        {...register('referralSource')}
                                        placeholder="Who referred this lead?"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.referralSource && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.referralSource.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Campaign & UTM Tracking Section */}
                    <Card className="border-border/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex gap-2 items-center text-sm font-medium">
                                <Share2 className="w-4 h-4" strokeWidth={1.5} />
                                <span className="font-light uppercase font-body">
                                    Campaign & UTM Tracking
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Campaign Name & Landing Page */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <Label className="block text-xs font-light uppercase font-body">
                                        Campaign Name
                                    </Label>
                                    <Input
                                        {...register('campaignName')}
                                        placeholder="e.g. Q1 2024 Digital Campaign"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.campaignName && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.campaignName.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label className="block text-xs font-light uppercase font-body">
                                        Landing Page
                                    </Label>
                                    <Input
                                        {...register('landingPage')}
                                        placeholder="https://example.com/landing"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.landingPage && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.landingPage.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* UTM Parameters */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <Label className="block text-xs font-light uppercase font-body">
                                        UTM Source
                                    </Label>
                                    <Input
                                        {...register('utmSource')}
                                        placeholder="e.g. google, facebook, newsletter"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.utmSource && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.utmSource.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label className="block text-xs font-light uppercase font-body">
                                        UTM Medium
                                    </Label>
                                    <Input
                                        {...register('utmMedium')}
                                        placeholder="e.g. cpc, email, social"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.utmMedium && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.utmMedium.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <Label className="block text-xs font-light uppercase font-body">
                                        UTM Campaign
                                    </Label>
                                    <Input
                                        {...register('utmCampaign')}
                                        placeholder="e.g. spring_sale, product_launch"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.utmCampaign && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.utmCampaign.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label className="block text-xs font-light uppercase font-body">
                                        UTM Term
                                    </Label>
                                    <Input
                                        {...register('utmTerm')}
                                        placeholder="e.g. lead generation, crm software"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.utmTerm && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.utmTerm.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="block text-xs font-light uppercase font-body">
                                    UTM Content
                                </Label>
                                <Input
                                    {...register('utmContent')}
                                    placeholder="e.g. logolink, textlink, banner"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.utmContent && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.utmContent.message}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lead Image Upload */}
                    <Card className="border-border/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex gap-2 items-center text-sm font-medium">
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
                                        className="flex gap-2 items-center px-4 py-2 rounded transition-colors cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary"
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
                                        <div className="p-2 space-y-2 rounded border border-border">
                                            {selectedFiles.map((file, index) => (
                                                <div key={index} className="flex justify-between items-center">
                                                    <div className="flex items-center">
                                                        <FileIcon className="mr-2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
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
                                                        className="p-0 w-6 h-6"
                                                        onClick={() => removeFile(index)}
                                                    >
                                                        <X className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                                    </Button>
                                                    {uploadProgress[file.name] && uploadProgress[file.name] < 100 && (
                                                        <Progress value={uploadProgress[file.name]} className="mt-1 w-full h-1" />
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
                                        <div className="p-2 rounded border border-border">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <img
                                                        src={initialData.image}
                                                        alt="Lead"
                                                        className="object-cover mr-2 w-10 h-10 rounded"
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
            </form>
        );
    };

    export default LeadForm;
