import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/auth-store';
import { axiosInstance } from '@/lib/services/api-client';
import { AccessLevel, User, UserStatus } from '@/lib/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Camera,
    User as UserIcon,
    Mail,
    Phone,
    ShieldCheck,
    ToggleLeft,
    ChevronDown,
    Building,
    Eye,
    EyeOff,
    Key,
    MapPin,
    Calendar,
    Briefcase,
    Target,
    Globe,
    Settings,
    Award,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select';
import { useBranchQuery, Branch } from '@/hooks/use-branch-query';
import { useAdminClientsQuery, ClientStatus, Client } from '@/hooks/use-clients-query';

// Enhanced form schema definition - comprehensive editing with all user entity fields
const userEditFormSchema = z.object({
    // Basic Authentication
    username: z
        .string()
        .min(3, { message: 'Username must be at least 3 characters' })
        .optional(),
    password: z.string().optional(), // Optional for editing

    // Personal Information
    name: z.string().min(1, { message: 'First name is required' }),
    surname: z.string().min(1, { message: 'Last name is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    phone: z.string().optional(),
    photoURL: z.string().optional(),

    // System Fields
    role: z.string().optional(),
    accessLevel: z.nativeEnum(AccessLevel).optional(),
    status: z.nativeEnum(UserStatus).optional(),
    userref: z.string().optional(),
    branchId: z.number().optional(),
    organisationRef: z.string().optional(),
    departmentId: z.number().optional(),
    assignedClients: z.array(z.number()).optional(),

    // HR and Employee Information
    hrID: z.number().optional(),
    businesscardURL: z.string().optional(),

    // User Profile Fields
    height: z.string().optional(),
    weight: z.string().optional(),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
    dob: z.string().optional(), // Date of birth as string for form handling

    // Employment Profile
    position: z.string().optional(),
    department: z.string().optional(),
    startDate: z.string().optional(), // Employment start date

    // Address Information
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),

    // Target Information
    targetSalesAmount: z.string().optional(),
    targetQuotationsAmount: z.string().optional(),
    targetCurrency: z.string().optional(),
    targetHoursWorked: z.number().optional(),
    targetNewClients: z.number().optional(),
    targetNewLeads: z.number().optional(),
    targetCheckIns: z.number().optional(),
    targetCalls: z.number().optional(),
    targetPeriod: z.string().optional(),

    // Device Information
    expoPushToken: z.string().optional(),
    deviceId: z.string().optional(),
    platform: z.enum(['ios', 'android', 'web']).optional(),
});

// Infer TypeScript type from the schema
export type UserEditFormValues = z.infer<typeof userEditFormSchema>;

// Extended type for server updates that includes nested objects
export type UserEditServerData = Partial<UserEditFormValues> & {
    branch?: { uid: number };
    organisation?: { uid: number };
};

// Props interface
interface UserEditFormProps {
    onSubmit: (data: UserEditServerData) => Promise<void>;
    initialData: User;
    isLoading?: boolean;
}

// User Edit Form Component
export const UserEditForm: React.FunctionComponent<UserEditFormProps> = ({
    onSubmit,
    initialData,
    isLoading = false,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [userImage, setUserImage] = useState<string | null>(
        initialData.photoURL || null,
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedClients, setSelectedClients] = useState<number[]>([]);

    // Use the global branch query hook
    const { branches, isLoading: isLoadingBranches, error: branchError, refetch: refetchBranches } = useBranchQuery();
    
    // Use the admin clients query hook to get all clients for user assignment
    const { clients, loading: isLoadingClients, error: clientError, refetch: refetchClients } = useAdminClientsQuery({ 
        limit: 500, // Get all available clients for assignment
        status: ClientStatus.ACTIVE // Only fetch active clients for assignment
    });

    // Position options
    const positionOptions = [
        'Sales Representative',
        'Sales Manager',
        'Account Manager',
        'Business Development Manager',
        'Regional Manager',
        'Territory Manager',
        'Sales Director',
        'Sales Coordinator',
        'Customer Success Manager',
        'Marketing Manager',
        'HR Manager',
        'Operations Manager',
        'Project Manager',
        'Product Manager',
        'Finance Manager',
        'IT Manager',
        'Software Developer',
        'QA Engineer',
        'Data Analyst',
        'Customer Service Representative',
        'Administrative Assistant',
        'Executive Assistant',
        'CEO',
        'CTO',
        'CFO',
        'COO',
        'Other'
    ];

    // Department options
    const departmentOptions = [
        'Sales',
        'Marketing',
        'Human Resources',
        'Finance',
        'Operations',
        'Information Technology',
        'Customer Service',
        'Research & Development',
        'Quality Assurance',
        'Administration',
        'Legal',
        'Procurement',
        'Logistics',
        'Business Development',
        'Product Management',
        'Project Management',
        'Training & Development',
        'Other'
    ];

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Default form values from initialData - now comprehensive
    const defaultValues: Partial<UserEditFormValues> = {
        username: initialData.username || '',
        name: initialData.name || '',
        surname: initialData.surname || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        photoURL: initialData.photoURL || '',
        role: (initialData as any).role || '',
        accessLevel: initialData.accessLevel,
        status: initialData.status as UserStatus,
        userref: initialData.userref || '',
        branchId: (initialData.branch as unknown as Branch)?.uid,
        organisationRef: initialData.organisationRef?.toString() || '',
        departmentId: (initialData as any).departmentId || 0,
        password: '',

        // HR and Employee Information
        hrID: (initialData as any).hrID || 0,
        businesscardURL: (initialData as any).businesscardURL || '',

        // User Profile Fields (from userProfile relationship)
        height: (initialData as any).userProfile?.height || '',
        weight: (initialData as any).userProfile?.weight || '',
        gender: (initialData as any).userProfile?.gender || undefined,
        dob: (initialData as any).userProfile?.dateOfBirth
            ? new Date((initialData as any).userProfile.dateOfBirth).toISOString().split('T')[0]
            : '',

        // Employment Profile (from userEmployeementProfile relationship)
        position: (initialData as any).userEmployeementProfile?.position || '',
        department: (initialData as any).userEmployeementProfile?.department || '',
        startDate: (initialData as any).userEmployeementProfile?.startDate
            ? new Date((initialData as any).userEmployeementProfile.startDate).toISOString().split('T')[0]
            : '',

        // Address Information (from userProfile)
        street: (initialData as any).userProfile?.address || '',
        city: (initialData as any).userProfile?.city || '',
        state: (initialData as any).userProfile?.state || '',
        country: (initialData as any).userProfile?.country || '',
        postalCode: (initialData as any).userProfile?.zipCode || '',

        // Target Information (from userTarget relationship)
        targetSalesAmount: (initialData as any).userTarget?.targetSalesAmount?.toString() || '0',
        targetQuotationsAmount: (initialData as any).userTarget?.targetQuotationsAmount?.toString() || '0',
        targetCurrency: (initialData as any).userTarget?.targetCurrency || 'USD',
        targetHoursWorked: (initialData as any).userTarget?.targetHoursWorked || 40,
        targetNewClients: (initialData as any).userTarget?.targetNewClients || 0,
        targetNewLeads: (initialData as any).userTarget?.targetNewLeads || 0,
        targetCheckIns: (initialData as any).userTarget?.targetCheckIns || 0,
        targetCalls: (initialData as any).userTarget?.targetCalls || 0,
        targetPeriod: (initialData as any).userTarget?.targetPeriod || 'monthly',

        // Device Information
        expoPushToken: (initialData as any).expoPushToken || '',
        deviceId: (initialData as any).deviceId || '',
        platform: (initialData as any).platform || undefined,
        
        // Assigned Clients
        assignedClients: (initialData as any).assignedClients || [],
    };

    // Initialize form
    const {
        control,
        register,
        handleSubmit,
        formState: { errors, dirtyFields },
        watch,
    } = useForm<UserEditFormValues>({
        resolver: zodResolver(userEditFormSchema),
        defaultValues,
    });

    // Prepare client options for MultiSelect with better labeling
    const clientOptions: MultiSelectOption[] = clients?.map((client: Client) => ({
        value: client.uid,
        label: `${client.name}${client.contactPerson ? ` (${client.contactPerson})` : ''}${client.email ? ` - ${client.email}` : ''}`
    })) || [];

    // Initialize selected clients from initial data
    useEffect(() => {
        if ((initialData as any)?.assignedClients) {
            setSelectedClients((initialData as any).assignedClients);
        }
    }, [(initialData as any)?.assignedClients]);

    // Handle image selection
    const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Store the file for later upload
        setSelectedFile(file);

        // Create a preview URL for immediate display
        const previewUrl = URL.createObjectURL(file);
        setUserImage(previewUrl);
    };

    // Upload image function that will be called on form submission
    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            // Create form data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'image');

            // Get access token from auth store for authentication
            const accessToken = useAuthStore.getState().accessToken;

            // Upload directly to the backend using axiosInstance
            const response = await axiosInstance.post(
                '/docs/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            );

            const data = response.data;

            if (data.publicUrl) {
                return data.publicUrl;
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    };

    // Form submission handler
    const onFormSubmit = async (data: UserEditFormValues) => {
        try {
            setIsSubmitting(true);

            // Initialize with only changed fields
            const changedData: UserEditServerData = {};

            // Add only dirty (changed) fields to the update data
            Object.keys(dirtyFields).forEach((key) => {
                const fieldKey = key as keyof UserEditFormValues;
                // Use type assertion to handle the typing issue
                changedData[fieldKey] = data[fieldKey] as any;
            });

            // Always include assigned clients if they've been changed
            if (JSON.stringify(selectedClients) !== JSON.stringify((initialData as any)?.assignedClients || [])) {
                changedData.assignedClients = selectedClients;
            }

            // Special handling for photo upload
            if (selectedFile) {
                const uploadedUrl = await uploadImage(selectedFile);
                if (uploadedUrl) {
                    changedData.photoURL = uploadedUrl;
                }
            }

            // Only include password if it was changed and not empty
            if (data.password && dirtyFields.password) {
                changedData.password = data.password;
            } else {
                delete changedData.password;
            }

            // Special handling for branch - only include if changed
            if (dirtyFields.branchId && changedData.branchId) {
                changedData.branch = { uid: changedData.branchId };
                delete changedData.branchId; // Remove branchId as we're using branch object
            }

            // Get auth store data for organisational context
            const profileData = useAuthStore.getState().profileData;

            // Add organization if needed and it doesn't exist
            if (profileData?.organisationRef && !initialData.organisation && Object.keys(changedData).length > 0) {
                changedData.organisation = {
                    uid: parseInt(profileData.organisationRef, 10),
                };
            }

            // Only submit if there are changes
            if (Object.keys(changedData).length > 0) {
                // Submit the data to the parent component
                await onSubmit(changedData);
            } else {
                // Show message if no changes were made
            }
        } catch (error) {
        } finally {
            setIsSubmitting(false);
        }
    };

    // Clean up object URLs when component unmounts or when image changes
    useEffect(() => {
        return () => {
            if (userImage && !userImage.startsWith('http')) {
                URL.revokeObjectURL(userImage);
            }
        };
    }, [userImage]);

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <fieldset
                disabled={isLoading || isSubmitting}
                className="space-y-6"
            >
                {/* Profile Photo Section */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex gap-2 items-center text-sm font-medium">
                            <UserIcon className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Profile Photo
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center">
                            <div className="relative mb-4">
                                <Avatar className="w-24 h-24 border-2 border-primary">
                                    <AvatarImage
                                        src={userImage || ''}
                                        alt="User avatar"
                                    />
                                    <AvatarFallback className="text-lg font-normal uppercase font-body">
                                        {watch('name').charAt(0) || ''}
                                        {watch('surname').charAt(0) || ''}
                                    </AvatarFallback>
                                </Avatar>
                                <label
                                    htmlFor="user-image-upload"
                                    className="absolute right-0 bottom-0 p-1 rounded-full cursor-pointer bg-primary hover:bg-primary/80"
                                >
                                    <Camera
                                        className="w-4 h-4 text-white"
                                        strokeWidth={1.5}
                                    />
                                </label>
                                <input
                                    id="user-image-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageSelection}
                                    disabled={isLoading || isSubmitting}
                                />
                            </div>
                            {selectedFile && (
                                <p className="text-[10px] font-thin font-body text-primary">
                                    {selectedFile.name} selected
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Basic Information Section */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex gap-2 items-center text-sm font-medium">
                            <UserIcon className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Basic Information
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
                                    First Name{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    {...register('name')}
                                    placeholder="Brandon"
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
                                    htmlFor="surname"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Last Name{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="surname"
                                    {...register('surname')}
                                    placeholder="Nelson"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.surname && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.surname.message}
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
                                <div className="relative">
                                    <Mail
                                        className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground"
                                        strokeWidth={1.5}
                                    />
                                    <Input
                                        id="email"
                                        type="email"
                                        {...register('email')}
                                        placeholder="brandon@gmail.com"
                                        className="pl-10 font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                </div>
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
                                <div className="relative">
                                    <Phone
                                        className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground"
                                        strokeWidth={1.5}
                                    />
                                    <Input
                                        id="phone"
                                        {...register('phone')}
                                        placeholder="011 123 4567"
                                        className="pl-10 font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Information Section */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex gap-2 items-center text-sm font-medium">
                            <ShieldCheck
                                className="w-4 h-4"
                                strokeWidth={1.5}
                            />
                            <span className="font-light uppercase font-body">
                                Account Information
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="username"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    {...register('username')}
                                    placeholder="brandon.n"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.username && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.username.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="userref"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    User Reference
                                </Label>
                                <Input
                                    id="userref"
                                    {...register('userref')}
                                    disabled={true}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-1">
                                <Label
                                    htmlFor="password"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Change Password
                                </Label>
                                <div className="relative">
                                    <div className="relative">
                                        <Key
                                            className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground"
                                            strokeWidth={1.5}
                                        />
                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            {...register('password')}
                                            placeholder="leave blank to keep current password"
                                            className="pr-10 pl-10 font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                        />
                                        <button
                                            type="button"
                                            className="flex absolute inset-y-0 right-0 items-center pr-3"
                                            onClick={togglePasswordVisibility}
                                        >
                                            {showPassword ? (
                                                <EyeOff
                                                    className="w-4 h-4 text-muted-foreground"
                                                    strokeWidth={1.5}
                                                />
                                            ) : (
                                                <Eye
                                                    className="w-4 h-4 text-muted-foreground"
                                                    strokeWidth={1.5}
                                                />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.password.message}
                                    </p>
                                )}
                                <p className="text-[9px] font-thin text-muted-foreground uppercase">
                                    Only fill this if you want to change the
                                    password
                                </p>
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="accessLevel"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Access Level
                                </Label>
                                <Controller
                                    control={control}
                                    name="accessLevel"
                                    render={({ field }) => (
                                        <div className="relative">
                                            <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                <div className="flex gap-2 items-center">
                                                    <ShieldCheck
                                                        className="w-4 h-4 text-muted-foreground"
                                                        strokeWidth={1.5}
                                                    />
                                                    <span className="uppercase text-[10px] font-thin font-body">
                                                        {field.value
                                                            ? field.value.replace(
                                                                  /_/g,
                                                                  ' ',
                                                              )
                                                            : 'SELECT ACCESS LEVEL'}
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
                                                    {Object.values(
                                                        AccessLevel,
                                                    ).map((level) => (
                                                        <SelectItem
                                                            key={level}
                                                            value={level}
                                                        >
                                                            <div className="flex gap-2 items-center">
                                                                <ShieldCheck
                                                                    className="w-4 h-4"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                />
                                                                <span className="uppercase text-[10px] font-thin font-body">
                                                                    {level.replace(
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
                            </div>

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
                                                    <ToggleLeft
                                                        className="w-4 h-4 text-muted-foreground"
                                                        strokeWidth={1.5}
                                                    />
                                                    <span className="uppercase text-[10px] font-thin font-body">
                                                        {field.value
                                                            ? field.value.replace(
                                                                  /_/g,
                                                                  ' ',
                                                              )
                                                            : 'SELECT STATUS'}
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
                                                    {Object.values(
                                                        UserStatus,
                                                    ).map((status) => (
                                                        <SelectItem
                                                            key={status}
                                                            value={status}
                                                        >
                                                            <div className="flex gap-2 items-center">
                                                                <ToggleLeft
                                                                    className="w-4 h-4"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                />
                                                                <span className="uppercase text-[10px] font-thin font-body">
                                                                    {status.replace(
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
                            </div>

                            {/* Branch Selector */}
                            <div className="space-y-1">
                                <Label
                                    htmlFor="branchId"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Branch
                                </Label>
                                <Controller
                                    control={control}
                                    name="branchId"
                                    render={({ field }) => (
                                        <div className="relative">
                                            <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                <div className="flex gap-2 items-center">
                                                    <Building
                                                        className="w-4 h-4 text-muted-foreground"
                                                        strokeWidth={1.5}
                                                    />
                                                    <span className="uppercase text-[10px] font-thin font-body">
                                                        {isLoadingBranches
                                                            ? 'LOADING BRANCHES...'
                                                            : branches.find(
                                                                  (b) =>
                                                                      b.uid ===
                                                                      parseInt(
                                                                          field.value?.toString() ||
                                                                              '0',
                                                                      ),
                                                              )?.name ||
                                                              'SELECT BRANCH'}
                                                    </span>
                                                </div>
                                                <ChevronDown
                                                    className="ml-2 w-4 h-4 opacity-50"
                                                    strokeWidth={1.5}
                                                />
                                            </div>
                                            <Select
                                                onValueChange={(value) =>
                                                    field.onChange(
                                                        parseInt(value, 10),
                                                    )
                                                }
                                                value={
                                                    field.value
                                                        ? field.value.toString()
                                                        : undefined
                                                }
                                                disabled={
                                                    isLoadingBranches ||
                                                    branches.length === 0
                                                }
                                            >
                                                <SelectTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                                <SelectContent>
                                                    {branches.length === 0 &&
                                                    !isLoadingBranches ? (
                                                        <SelectItem
                                                            value="No branches available"
                                                            disabled
                                                        >
                                                            <span className="text-[10px] font-thin font-body text-muted-foreground">
                                                                No branches
                                                                available
                                                            </span>
                                                        </SelectItem>
                                                    ) : (
                                                        branches.map(
                                                            (branch) => (
                                                                <SelectItem
                                                                    key={
                                                                        branch.uid
                                                                    }
                                                                    value={branch.uid.toString()}
                                                                >
                                                                    <div className="flex gap-2 items-center">
                                                                        <Building
                                                                            className="w-4 h-4"
                                                                            strokeWidth={
                                                                                1.5
                                                                            }
                                                                        />
                                                                        <span className="uppercase text-[10px] font-thin font-body">
                                                                            {
                                                                                branch.name
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </SelectItem>
                                                            ),
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                />
                                {isLoadingBranches && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Loading branches...
                                    </p>
                                )}
                                {branchError && (
                                    <div className="mt-1 text-xs text-red-500">
                                        Failed to load branches.{' '}
                                        <button
                                            type="button"
                                            onClick={() => refetchBranches()}
                                            className="underline hover:no-underline"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </fieldset>

            {/* Personal Profile Section */}
            <fieldset className="space-y-4">
                <legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Personal Profile
                </legend>
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex gap-2 items-center text-sm font-medium">
                            <UserIcon className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Personal Details
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="gender"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Gender
                                </Label>
                                <Controller
                                    name="gender"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="font-light bg-card border-border">
                                                <div className="flex gap-2 items-center">
                                                    <UserIcon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                                    <span className="uppercase text-[10px] font-thin font-body">
                                                        {field.value ? field.value.replace(/_/g, ' ') : 'SELECT GENDER'}
                                                    </span>
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="dob"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Date of Birth
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
                                    <Input
                                        id="dob"
                                        type="date"
                                        {...register('dob')}
                                        className="pl-10 font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="height"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Height (cm)
                                </Label>
                                <Input
                                    id="height"
                                    {...register('height')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    placeholder="180"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="weight"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Weight (kg)
                                </Label>
                                <Input
                                    id="weight"
                                    {...register('weight')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    placeholder="75"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </fieldset>

            {/* Employment Information Section */}
            <fieldset className="space-y-4">
                <legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Employment Information
                </legend>
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex gap-2 items-center text-sm font-medium">
                            <Briefcase className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Work Details
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="position"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Position
                                </Label>
                                <Controller
                                    name="position"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="font-light bg-card border-border">
                                                <SelectValue placeholder="Select position" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {positionOptions.map((position) => (
                                                    <SelectItem key={position} value={position}>
                                                        {position}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="department"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Department
                                </Label>
                                <Controller
                                    name="department"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="font-light bg-card border-border">
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departmentOptions.map((department) => (
                                                    <SelectItem key={department} value={department}>
                                                        {department}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="startDate"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Start Date
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
                                    <Input
                                        id="startDate"
                                        type="date"
                                        {...register('startDate')}
                                        className="pl-10 font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="hrID"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    HR ID
                                </Label>
                                <Input
                                    id="hrID"
                                    type="number"
                                    {...register('hrID', { valueAsNumber: true })}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    placeholder="12345"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="businesscardURL"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Business Card URL
                                </Label>
                                <Input
                                    id="businesscardURL"
                                    type="url"
                                    {...register('businesscardURL')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    placeholder="https://example.com/card.pdf"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <Label
                                htmlFor="assignedClients"
                                className="block text-xs font-light uppercase font-body"
                            >
                                Assigned Clients
                            </Label>
                            <MultiSelect
                                options={clientOptions}
                                selectedValues={selectedClients}
                                onSelectionChange={(values) => setSelectedClients(values as number[])}
                                placeholder="Select clients..."
                                disabled={isLoadingClients}
                                className="w-full"
                            />
                            {isLoadingClients && (
                                <p className="text-xs text-muted-foreground">
                                    Loading clients...
                                </p>
                            )}
                            {clientError && (
                                <div className="text-xs text-red-500">
                                    Failed to load clients.{' '}
                                    <button
                                        type="button"
                                        onClick={() => refetchClients()}
                                        className="underline hover:no-underline"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </fieldset>

            {/* Address Information Section */}
            <fieldset className="space-y-4">
                <legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Address Information
                </legend>
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex gap-2 items-center text-sm font-medium">
                            <MapPin className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Contact Address
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="street"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Street Address
                                </Label>
                                <Input
                                    id="street"
                                    {...register('street')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    placeholder="123 Main Street"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <Label
                                        htmlFor="city"
                                        className="block text-xs font-light uppercase font-body"
                                    >
                                        City
                                    </Label>
                                    <Input
                                        id="city"
                                        {...register('city')}
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                        placeholder="Johannesburg"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label
                                        htmlFor="state"
                                        className="block text-xs font-light uppercase font-body"
                                    >
                                        State/Province
                                    </Label>
                                    <Input
                                        id="state"
                                        {...register('state')}
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                        placeholder="Gauteng"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label
                                        htmlFor="country"
                                        className="block text-xs font-light uppercase font-body"
                                    >
                                        Country
                                    </Label>
                                    <Input
                                        id="country"
                                        {...register('country')}
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                        placeholder="South Africa"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label
                                        htmlFor="postalCode"
                                        className="block text-xs font-light uppercase font-body"
                                    >
                                        Postal Code
                                    </Label>
                                    <Input
                                        id="postalCode"
                                        {...register('postalCode')}
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                        placeholder="2000"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </fieldset>

            {/* Performance Targets Section */}
            <fieldset className="space-y-4">
                <legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Performance Targets
                </legend>
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex gap-2 items-center text-sm font-medium">
                            <Target className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Sales & Performance Goals
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="targetSalesAmount"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Target Sales Amount
                                </Label>
                                <Input
                                    id="targetSalesAmount"
                                    {...register('targetSalesAmount')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    placeholder="100000"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="targetQuotationsAmount"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Target Quotations Amount
                                </Label>
                                <Input
                                    id="targetQuotationsAmount"
                                    {...register('targetQuotationsAmount')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    placeholder="50000"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="targetCurrency"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Target Currency
                                </Label>
                                <Input
                                    id="targetCurrency"
                                    {...register('targetCurrency')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    placeholder="ZAR"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="targetHoursWorked"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Target Hours Worked
                                </Label>
                                <Input
                                    id="targetHoursWorked"
                                    type="number"
                                    {...register('targetHoursWorked', { valueAsNumber: true })}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    placeholder="40"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="targetNewClients"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Target New Clients
                                </Label>
                                <Input
                                    id="targetNewClients"
                                    type="number"
                                    {...register('targetNewClients', { valueAsNumber: true })}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    placeholder="10"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="targetNewLeads"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Target New Leads
                                </Label>
                                <Input
                                    id="targetNewLeads"
                                    type="number"
                                    {...register('targetNewLeads', { valueAsNumber: true })}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    placeholder="20"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="targetCheckIns"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Target Check-ins
                                </Label>
                                <Input
                                    id="targetCheckIns"
                                    type="number"
                                    {...register('targetCheckIns', { valueAsNumber: true })}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    placeholder="50"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="targetCalls"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Target Calls
                                </Label>
                                <Input
                                    id="targetCalls"
                                    type="number"
                                    {...register('targetCalls', { valueAsNumber: true })}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    placeholder="100"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="targetPeriod"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Target Period
                                </Label>
                                <Controller
                                    name="targetPeriod"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="font-light bg-card border-border">
                                                <div className="flex gap-2 items-center">
                                                    <Award className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                                    <span className="uppercase text-[10px] font-thin font-body">
                                                        {field.value ? field.value.toUpperCase() : 'SELECT PERIOD'}
                                                    </span>
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="daily">Daily</SelectItem>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                                <SelectItem value="yearly">Yearly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </fieldset>

            {/* Device Information Section */}
            <fieldset className="space-y-4">
                <legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Device Information
                </legend>
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex gap-2 items-center text-sm font-medium">
                            <Globe className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Device & Platform
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="platform"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Platform
                                </Label>
                                <Controller
                                    name="platform"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="font-light bg-card border-border">
                                                <div className="flex gap-2 items-center">
                                                    <Globe className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                                    <span className="uppercase text-[10px] font-thin font-body">
                                                        {field.value ? field.value.toUpperCase() : 'SELECT PLATFORM'}
                                                    </span>
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ios">iOS</SelectItem>
                                                <SelectItem value="android">Android</SelectItem>
                                                <SelectItem value="web">Web</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="deviceId"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Device ID
                                </Label>
                                <Input
                                    id="deviceId"
                                    {...register('deviceId')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    placeholder="device-123456"
                                />
                            </div>

                            <div className="space-y-1 md:col-span-2">
                                <Label
                                    htmlFor="expoPushToken"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Expo Push Token
                                </Label>
                                <Input
                                    id="expoPushToken"
                                    {...register('expoPushToken')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    placeholder="ExponentPushToken[...]"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </fieldset>

            {/* Submit Button */}
            <div className="flex gap-2 justify-end pt-4 mt-6 border-t border-border">
                <Button
                    type="submit"
                    variant="outline"
                    disabled={isLoading || isSubmitting}
                    className="h-9 text-[10px] font-light uppercase font-body bg-primary hover:bg-primary/90 text-white"
                >
                    {isSubmitting
                        ? 'Saving...'
                        : isLoading
                          ? 'Loading...'
                          : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
};

export default UserEditForm;
