import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { axiosInstance } from '@/lib/services/api-client';
import { AccessLevel } from '@/lib/types/user';
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
    User,
    Key,
    Eye,
    EyeOff,
    MapPin,
    Calendar,
    Briefcase,
    Target,
    Settings,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select';
import { AccountStatus } from '@/lib/enums/status.enums';
import { useBranchQuery } from '@/hooks/use-branch-query';
import {
    useAdminClientsQuery,
    ClientStatus,
    Client,
} from '@/hooks/use-clients-query';
import { showErrorToast } from '@/lib/utils/toast-config';
import toast from 'react-hot-toast';

// Enhanced form schema with essential user entity fields for creation
const userFormSchema = z.object({
    // Basic Authentication
    username: z
        .string()
        .min(3, { message: 'Username must be at least 3 characters' }),
    password: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters' }),

    // Personal Information
    name: z.string().min(1, { message: 'First name is required' }),
    surname: z.string().min(1, { message: 'Last name is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    phone: z.string().min(1, { message: 'Phone number is required' }),
    photoURL: z.string().optional(),

    // System Fields
    role: z.string().optional(),
    accessLevel: z.nativeEnum(AccessLevel).default(AccessLevel.USER),
    status: z.nativeEnum(AccountStatus).default(AccountStatus.ACTIVE),
    branchId: z.number().optional(),
    assignedClients: z.array(z.number()).optional(),

    // User Profile Fields (optional)
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

    // Target Information (basic targets only)
    targetSalesAmount: z.string().optional(),
    targetQuotationsAmount: z.string().optional(),
    targetCurrency: z.string().optional(),
    targetHoursWorked: z.number().optional(),
    targetNewClients: z.number().optional(),
    targetNewLeads: z.number().optional(),
    targetCheckIns: z.number().optional(),
    targetCalls: z.number().optional(),
    targetPeriod: z.string().optional(),
});

// Infer TypeScript type from the schema
export type UserFormValues = z.infer<typeof userFormSchema>;

// Props interface
interface UserFormProps {
    onSubmit: (data: UserFormValues) => Promise<void>;
    initialData?: Partial<UserFormValues>;
    isLoading?: boolean;
}

// User Form Component
export const UserForm: React.FunctionComponent<UserFormProps> = ({
    onSubmit,
    initialData,
    isLoading = false,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [userImage, setUserImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedClients, setSelectedClients] = useState<number[]>([]);

    // Use the global branch query hook
    const {
        branches,
        isLoading: isLoadingBranches,
        error: branchError,
        refetch: refetchBranches,
    } = useBranchQuery();

    // Use the admin clients query hook to get all clients for user assignment
    const {
        clients,
        loading: isLoadingClients,
        error: clientError,
        refetch: refetchClients,
    } = useAdminClientsQuery({
        limit: 500, // Get all available clients for assignment
        status: ClientStatus.ACTIVE, // Only fetch active clients for assignment
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
        'Other',
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
        'Other',
    ];

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Generate avatar URL based on user initials
    const generateAvatarUrl = (firstName: string, lastName: string) => {
        const fullName = `${firstName} ${lastName}`.trim();
        const encodedName = encodeURIComponent(fullName);
        return `https://ui-avatars.com/api/?name=${encodedName}&background=random&size=256&bold=true`;
    };

    // Default form values
    const defaultValues: Partial<UserFormValues> = {
        username: '',
        password: '',
        name: '',
        surname: '',
        email: '',
        phone: '',
        photoURL: '',
        role: 'user',
        accessLevel: AccessLevel.USER,
        status: AccountStatus.ACTIVE,
        branchId: initialData?.branchId,
        gender: undefined,
        dob: '',
        position: '',
        department: '',
        startDate: '',
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        targetSalesAmount: '0',
        targetQuotationsAmount: '0',
        targetCurrency: 'USD',
        targetHoursWorked: 40,
        targetNewClients: 0,
        targetNewLeads: 0,
        targetCheckIns: 0,
        targetCalls: 0,
        targetPeriod: 'monthly',
        assignedClients: [],
        ...initialData,
    };

    // Initialize form
    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors },
        watch,
    } = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues,
    });

    // Initialize selected clients from initial data
    useEffect(() => {
        if (initialData?.assignedClients) {
            setSelectedClients(initialData.assignedClients);
        }
    }, [initialData?.assignedClients]);

    // Watch for name changes to generate avatar preview
    const watchedName = watch('name');
    const watchedSurname = watch('surname');

    // Update avatar preview when name changes and no image is selected
    useEffect(() => {
        if (
            watchedName &&
            watchedSurname &&
            !selectedFile &&
            !initialData?.photoURL
        ) {
            const avatarUrl = generateAvatarUrl(watchedName, watchedSurname);
            setUserImage(avatarUrl);
        }
    }, [watchedName, watchedSurname, selectedFile, initialData?.photoURL]);

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

    // Prepare client options for MultiSelect with better labeling
    const clientOptions: MultiSelectOption[] =
        clients?.map((client: Client) => ({
            value: client.uid,
            label: `${client.name}${client.contactPerson ? ` (${client.contactPerson})` : ''}${client.email ? ` - ${client.email}` : ''}`,
        })) || [];

    // Handle form submission
    const handleFormSubmit = async (data: UserFormValues) => {
        try {
            setIsSubmitting(true);

            // Include selected clients in form data
            data.assignedClients = selectedClients;

            // If there's a selected file, upload it first
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);

                const uploadResponse = await axiosInstance.post(
                    '/upload',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    },
                );

                if (uploadResponse.data?.url) {
                    data.photoURL = uploadResponse.data.url;
                }
            } else {
                // If no file uploaded, generate avatar based on initials
                if (data.name && data.surname) {
                    data.photoURL = generateAvatarUrl(data.name, data.surname);
                }
            }

            // Submit the form data
            await onSubmit(data);
        } catch (error) {
            showErrorToast('Failed to create user', toast);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Profile Image Section */}
            <fieldset className="space-y-4">
                <legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Profile Image
                </legend>
                <Card className="border-border/50">
                    <CardContent className="p-4">
                        <div className="flex gap-4 items-center">
                            <Avatar className="w-20 h-20">
                                <AvatarImage
                                    src={userImage || ''}
                                    alt="Profile"
                                />
                                <AvatarFallback>
                                    <User className="w-10 h-10 text-muted-foreground" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <Label
                                    htmlFor="avatar"
                                    className="inline-flex gap-2 items-center px-3 py-2 text-xs font-medium rounded-md border cursor-pointer hover:bg-accent"
                                >
                                    <Camera className="w-4 h-4" />
                                    Upload Image
                                </Label>
                                <Input
                                    id="avatar"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelection}
                                    className="hidden"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    JPG, PNG up to 10MB
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </fieldset>

            {/* Basic Information Section */}
            <fieldset className="space-y-4">
                <legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Basic Information
                </legend>
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex gap-2 items-center text-sm font-medium">
                            <User className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Personal Details
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
                                    First Name
                                </Label>
                                <Input
                                    id="name"
                                    {...register('name')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    placeholder="John"
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500 font-body">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="surname"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Last Name
                                </Label>
                                <Input
                                    id="surname"
                                    {...register('surname')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    placeholder="Doe"
                                />
                                {errors.surname && (
                                    <p className="text-xs text-red-500 font-body">
                                        {errors.surname.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="email"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register('email')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    placeholder="john@example.com"
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500 font-body">
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
                                    type="tel"
                                    {...register('phone')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    placeholder="+1 (555) 123-4567"
                                />
                                {errors.phone && (
                                    <p className="text-xs text-red-500 font-body">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>

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
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">
                                                    Male
                                                </SelectItem>
                                                <SelectItem value="female">
                                                    Female
                                                </SelectItem>
                                                <SelectItem value="other">
                                                    Other
                                                </SelectItem>
                                                <SelectItem value="prefer_not_to_say">
                                                    Prefer not to say
                                                </SelectItem>
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
                                <Input
                                    id="dob"
                                    type="date"
                                    {...register('dob')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </fieldset>

            {/* Authentication Section */}
            <fieldset className="space-y-4">
                <legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Authenticati
                </legend>
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex gap-2 items-center text-sm font-medium">
                            <Key className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Login Credentials
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
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    placeholder="john_doe"
                                />
                                {errors.username && (
                                    <p className="text-xs text-red-500 font-body">
                                        {errors.username.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="password"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        {...register('password')}
                                        className="pr-10 font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="flex absolute inset-y-0 right-0 items-center pr-3 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-red-500 font-body">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </fieldset>

            {/* Employment Section */}
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
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                                                {positionOptions.map(
                                                    (position) => (
                                                        <SelectItem
                                                            key={position}
                                                            value={position}
                                                        >
                                                            {position}
                                                        </SelectItem>
                                                    ),
                                                )}
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
                                                {departmentOptions.map(
                                                    (department) => (
                                                        <SelectItem
                                                            key={department}
                                                            value={department}
                                                        >
                                                            {department}
                                                        </SelectItem>
                                                    ),
                                                )}
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
                                <Input
                                    id="startDate"
                                    type="date"
                                    {...register('startDate')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
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
                                onSelectionChange={(values) =>
                                    setSelectedClients(values as number[])
                                }
                                placeholder={
                                    isLoadingClients
                                        ? 'Loading clients...'
                                        : clientOptions.length === 0
                                          ? 'No clients available'
                                          : 'Select clients...'
                                }
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
                            {!isLoadingClients &&
                                !clientError &&
                                clientOptions.length === 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        No clients available for assignment.
                                    </p>
                                )}
                        </div>
                    </CardContent>
                </Card>
            </fieldset>

            {/* Address Section */}
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
                                        placeholder="New York"
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
                                        placeholder="NY"
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
                                        placeholder="United States"
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
                                        placeholder="10001"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </fieldset>

            {/* Targets Section */}
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
                                    placeholder="USD"
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
                                    {...register('targetHoursWorked', {
                                        valueAsNumber: true,
                                    })}
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
                                    {...register('targetNewClients', {
                                        valueAsNumber: true,
                                    })}
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
                                    {...register('targetNewLeads', {
                                        valueAsNumber: true,
                                    })}
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
                                    {...register('targetCheckIns', {
                                        valueAsNumber: true,
                                    })}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    placeholder="22"
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
                                    {...register('targetCalls', {
                                        valueAsNumber: true,
                                    })}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    placeholder="50"
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
                                                <SelectValue placeholder="Select period" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="daily">
                                                    Daily
                                                </SelectItem>
                                                <SelectItem value="weekly">
                                                    Weekly
                                                </SelectItem>
                                                <SelectItem value="monthly">
                                                    Monthly
                                                </SelectItem>
                                                <SelectItem value="quarterly">
                                                    Quarterly
                                                </SelectItem>
                                                <SelectItem value="yearly">
                                                    Yearly
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </fieldset>

            {/* System Settings Section */}
            <fieldset className="space-y-4">
                <legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    System Settings
                </legend>
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex gap-2 items-center text-sm font-medium">
                            <Settings className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Access & Organization
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="role"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Role
                                </Label>
                                <Input
                                    id="role"
                                    {...register('role')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    placeholder="user"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="accessLevel"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Access Level
                                </Label>
                                <Controller
                                    name="accessLevel"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="font-light bg-card border-border">
                                                <SelectValue placeholder="Select access level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(AccessLevel).map(
                                                    (level) => (
                                                        <SelectItem
                                                            key={level}
                                                            value={level}
                                                        >
                                                            {level
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                level.slice(1)}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
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
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="font-light bg-card border-border">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(
                                                    AccountStatus,
                                                ).map((status) => (
                                                    <SelectItem
                                                        key={status}
                                                        value={status}
                                                    >
                                                        {status
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            status.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="branchId"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Branch
                                </Label>
                                <Controller
                                    name="branchId"
                                    control={control}
                                    render={({ field }: { field: any }) => (
                                        <div className="relative">
                                            <Select
                                                value={field.value?.toString()}
                                                onValueChange={(value) =>
                                                    field.onChange(
                                                        parseInt(value),
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="font-light bg-card border-border">
                                                    <SelectValue placeholder="Select branch" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {branches?.map((branch) => (
                                                        <SelectItem
                                                            key={branch.uid}
                                                            value={branch.uid.toString()}
                                                        >
                                                            {branch.name}
                                                        </SelectItem>
                                                    ))}
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

            {/* Submit Button */}
            <div className="flex gap-2 justify-end pt-4 mt-6 border-t border-border">
                <Button
                    type="button"
                    variant="outline"
                    className="h-9 text-[10px] font-light uppercase font-body"
                    onClick={() => {
                        reset();
                        setUserImage(null);
                        setSelectedFile(null);
                    }}
                    disabled={isSubmitting}
                >
                    Reset Form
                </Button>
                <Button
                    type="submit"
                    variant="outline"
                    disabled={isLoading || isSubmitting}
                    className="h-9 text-[10px] font-light uppercase font-body bg-primary hover:bg-primary/90 text-white"
                >
                    {isSubmitting
                        ? 'Creating...'
                        : isLoading
                          ? 'Loading...'
                          : 'Create User'}
                </Button>
            </div>
        </form>
    );
};

export default UserForm;
