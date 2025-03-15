import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ClientType } from '@/lib/types/client-enums';
import { ClientStatus } from '@/hooks/use-clients-query';
import { useAuthStore, selectProfileData } from '@/store/auth-store';
import { useUsersQuery } from '@/hooks/use-users-query';
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
    Building2,
    User,
    Mail,
    Phone,
    Globe,
    Image,
    MapPin,
    Tag,
    FileText,
    ChevronDown,
    Users,
    ToggleLeft,
    LayoutGrid,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Form schema definition with improved validation
const clientFormSchema = z.object({
    name: z.string().min(1, { message: 'A client name is required' }),
    contactPerson: z
        .string()
        .min(1, { message: 'A contact person is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    // Phone validation - allow international formats
    phone: z.string().min(6, { message: 'A valid phone number is required' }),
    alternativePhone: z.string().optional(),
    // Add URL validation for website
    website: z
        .string()
        .url({ message: 'Please enter a valid URL' })
        .optional()
        .or(z.literal('')),
    logo: z.string().optional(),
    description: z.string().optional(),
    address: z.object({
        street: z.string().min(1, { message: 'Street address is required' }),
        suburb: z.string().min(1, { message: 'Suburb is required' }),
        city: z.string().min(1, { message: 'City is required' }),
        state: z.string().min(1, { message: 'State/Province is required' }),
        country: z.string().min(1, { message: 'Country is required' }),
        postalCode: z.string().min(1, { message: 'Postal code is required' }),
    }),
    category: z.nativeEnum(ClientType).default(ClientType.CONTRACT),
    type: z.nativeEnum(ClientType).default(ClientType.STANDARD),
    // Using ClientStatus from the frontend which maps to the backend enum names correctly
    status: z.nativeEnum(ClientStatus).default(ClientStatus.ACTIVE),
    ref: z.string(),
    assignedSalesRep: z
        .object({
            uid: z.number(),
        })
        .optional(),
});

// Infer TypeScript type from the schema
export type ClientFormValues = z.infer<typeof clientFormSchema>;

// Props interface
interface ClientFormProps {
    onSubmit: (data: ClientFormValues) => void;
    initialData?: Partial<ClientFormValues>;
    isLoading?: boolean;
}

/**
 * ClientForm Component
 *
 * This component provides a form interface for creating and editing clients.
 * It handles data validation, image uploads, and form submission according to
 * the backend API requirements.
 *
 * @component
 */
export const ClientForm: React.FunctionComponent<ClientFormProps> = ({
    onSubmit,
    initialData,
    isLoading = false,
}) => {
    // State for tracking the file upload process
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [logoImage, setLogoImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const profileData = useAuthStore(selectProfileData);

    // Generate a unique client reference code
    const generateClientRef = () =>
        `CL${Math.floor(100000 + Math.random() * 900000)}`;

    // Default form values - ensuring all required fields have initial values
    const defaultValues: Partial<ClientFormValues> = {
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        alternativePhone: '',
        website: '',
        logo: '',
        description: '',
        address: {
            street: '',
            suburb: '',
            city: '',
            state: '',
            country: 'South Africa', // Default country
            postalCode: '',
        },
        category: ClientType.CONTRACT, // Default category
        type: ClientType.STANDARD, // Default type
        status: ClientStatus.ACTIVE, // Default status
        ref: generateClientRef(), // Generate a unique reference
        ...initialData, // Override with any provided initial data
    };

    // Initialize form
    const {
        control,
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
        watch,
    } = useForm<ClientFormValues>({
        resolver: zodResolver(clientFormSchema),
        defaultValues,
    });

    const { users } = useUsersQuery();

    // Handle logo image selection
    const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Store the file for later upload
        setSelectedFile(file);

        // Create a preview URL for immediate display
        const previewUrl = URL.createObjectURL(file);
        setLogoImage(previewUrl);
    };

    /**
     * Uploads an image file to the server
     * @param file The file to upload
     * @returns The URL of the uploaded image, or null if upload failed
     */
    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            setUploadProgress(0);
            // Create form data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'image');

            // Get access token from auth store for authentication
            const accessToken = useAuthStore.getState().accessToken;

            // Upload directly to the backend using axiosInstance with progress tracking
            const response = await axiosInstance.post(
                '/docs/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const progress = Math.round(
                                (progressEvent.loaded * 100) /
                                    progressEvent.total,
                            );
                            setUploadProgress(progress);
                        }
                    },
                },
            );

            const data = response.data;

            if (data.publicUrl) {
                toast.success('Logo uploaded successfully');
                return data.publicUrl;
            } else {
                toast.error('Failed to upload logo image');
                return null;
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Error uploading logo image');
            return null;
        } finally {
            setUploadProgress(0);
        }
    };

    /**
     * Submits the form data to the server
     * Handles file uploads and organizational context
     */
    const onFormSubmit = async (data: ClientFormValues) => {
        try {
            setIsSubmitting(true);
            let logoUrl = data.logo || '';

            // Upload the logo if one was selected
            if (selectedFile) {
                const uploadedUrl = await uploadImage(selectedFile);
                if (uploadedUrl) {
                    logoUrl = uploadedUrl;
                }
            }

            // Get auth store data for organisational context
            const profileData = useAuthStore.getState().profileData;

            // Prepare client data - ensure data is formatted exactly as the backend expects
            const clientData = {
                ...data,
                logo: logoUrl,
                // Ensure status is passed as a string matching the backend's enum values
                status: data.status,
                // Ensure the ref is set and follows the pattern
                ref: data.ref || generateClientRef(),
                // Include organization data if available
                ...(profileData?.organisationRef
                    ? {
                          organisation: {
                              uid: parseInt(profileData.organisationRef, 10),
                          },
                      }
                    : {}),
                // Include branch data if available
                ...(profileData?.branch?.uid
                    ? {
                          branch: { uid: parseInt(profileData.branch.uid, 10) },
                      }
                    : {}),
            };

            // Submit the data to the parent component
            await onSubmit(clientData);

            // Reset form after successful submission
            toast.success('Client created successfully');
            reset(defaultValues);
            setLogoImage(null);
            setSelectedFile(null);
        } catch (error) {
            console.error('Error submitting client form:', error);
            toast.error('Failed to create client');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Clean up object URLs when component unmounts or when image changes
    useEffect(() => {
        return () => {
            if (logoImage && !logoImage.startsWith('http')) {
                URL.revokeObjectURL(logoImage);
            }
        };
    }, [logoImage]);

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <fieldset
                disabled={isLoading || isSubmitting}
                className="space-y-6"
            >
                {/* Logo Section */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <Image className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Client Logo
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center">
                            <div className="relative mb-4">
                                <Avatar className="w-24 h-24 border-2 border-primary">
                                    <AvatarImage
                                        src={logoImage || ''}
                                        alt="Client logo"
                                    />
                                    <AvatarFallback className="text-lg font-normal uppercase font-body">
                                        {watch('name')?.charAt(0) || 'C'}
                                    </AvatarFallback>
                                </Avatar>
                                <label
                                    htmlFor="client-logo-upload"
                                    className="absolute bottom-0 right-0 p-1 rounded-full cursor-pointer bg-primary hover:bg-primary/80"
                                >
                                    <Image
                                        className="w-4 h-4 text-white"
                                        strokeWidth={1.5}
                                    />
                                </label>
                                <input
                                    id="client-logo-upload"
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
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <Building2 className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Client Information
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
                                    Company Name{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    {...register('name')}
                                    placeholder="ACME Inc."
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
                                    htmlFor="contactPerson"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Contact Person{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <User
                                        className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground"
                                        strokeWidth={1.5}
                                    />
                                    <Input
                                        id="contactPerson"
                                        {...register('contactPerson')}
                                        placeholder="John Doe"
                                        className="pl-10 font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                </div>
                                {errors.contactPerson && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.contactPerson.message}
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
                                        className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground"
                                        strokeWidth={1.5}
                                    />
                                    <Input
                                        id="email"
                                        type="email"
                                        {...register('email')}
                                        placeholder="john.doe@example.co.za"
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
                                    htmlFor="website"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Website
                                </Label>
                                <div className="relative">
                                    <Globe
                                        className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground"
                                        strokeWidth={1.5}
                                    />
                                    <Input
                                        id="website"
                                        {...register('website')}
                                        placeholder="https://www.acme.co.za"
                                        className="pl-10 font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                </div>
                                {errors.website && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.website.message}
                                    </p>
                                )}
                                <p className="text-[10px] text-muted-foreground">
                                    Include the full URL (e.g.,
                                    https://www.example.com)
                                </p>
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="phone"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Phone{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Phone
                                        className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground"
                                        strokeWidth={1.5}
                                    />
                                    <Input
                                        id="phone"
                                        {...register('phone')}
                                        placeholder="+27 64 123 4567"
                                        className="pl-10 font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.phone.message}
                                    </p>
                                )}
                                <p className="text-[10px] text-muted-foreground">
                                    Include country code (e.g., +27 for South
                                    Africa)
                                </p>
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="alternativePhone"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Alternative Phone
                                </Label>
                                <div className="relative">
                                    <Phone
                                        className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground"
                                        strokeWidth={1.5}
                                    />
                                    <Input
                                        id="alternativePhone"
                                        {...register('alternativePhone')}
                                        placeholder="+27 64 987 6543"
                                        className="pl-10 font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                </div>
                                {errors.alternativePhone && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.alternativePhone.message}
                                    </p>
                                )}
                                <p className="text-[10px] text-muted-foreground">
                                    Optional secondary contact number
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label
                                htmlFor="description"
                                className="block text-xs font-light uppercase font-body"
                            >
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                {...register('description')}
                                placeholder="ACME Inc. is a leading provider of innovative solutions in South Africa."
                                rows={4}
                                className="font-light resize-none bg-card border-border placeholder:text-xs placeholder:font-body"
                            />
                            {errors.description && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Address Section */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <MapPin className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Address Information
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="address.street"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Street Address{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="address.street"
                                    {...register('address.street')}
                                    placeholder="123 Main St"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.address?.street && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {
                                            errors.address.street
                                                .message as string
                                        }
                                    </p>
                                )}
                                <p className="text-[10px] text-muted-foreground">
                                    Include building number and street name
                                </p>
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="address.suburb"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Suburb{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="address.suburb"
                                    {...register('address.suburb')}
                                    placeholder="Halfway House"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.address?.suburb && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {
                                            errors.address.suburb
                                                .message as string
                                        }
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="address.city"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    City <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="address.city"
                                    {...register('address.city')}
                                    placeholder="Cape Town"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.address?.city && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.address.city.message as string}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="address.state"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    State/Province{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="address.state"
                                    {...register('address.state')}
                                    placeholder="Western Cape"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.address?.state && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.address.state.message as string}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="address.country"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Country{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="address.country"
                                    {...register('address.country')}
                                    placeholder="South Africa"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.address?.country && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {
                                            errors.address.country
                                                .message as string
                                        }
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="address.postalCode"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Postal Code{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="address.postalCode"
                                    {...register('address.postalCode')}
                                    placeholder="8001"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.address?.postalCode && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {
                                            errors.address.postalCode
                                                .message as string
                                        }
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Information Section */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <FileText className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Additional Information
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="category"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Category
                                </Label>
                                <Controller
                                    control={control}
                                    name="category"
                                    render={({ field }) => (
                                        <div className="relative">
                                            <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                <div className="flex items-center gap-2">
                                                    <LayoutGrid
                                                        className="w-4 h-4 text-muted-foreground"
                                                        strokeWidth={1.5}
                                                    />
                                                    <span className="uppercase text-[10px] font-thin font-body">
                                                        {field.value
                                                            ? field.value.replace(
                                                                  /_/g,
                                                                  ' ',
                                                              )
                                                            : 'SELECT CATEGORY'}
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
                                                        ClientType,
                                                    ).map((type) => (
                                                        <SelectItem
                                                            key={type}
                                                            value={type}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <LayoutGrid
                                                                    className="w-4 h-4"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                />
                                                                <span className="uppercase text-[10px] font-thin font-body">
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
                                {errors.category && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.category.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="assignedSalesRep"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Assigned Sales Rep
                                </Label>
                                <Controller
                                    control={control}
                                    name="assignedSalesRep"
                                    render={({ field }) => (
                                        <div className="relative">
                                            <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                <div className="flex items-center gap-2">
                                                    <Users
                                                        className="w-4 h-4 text-muted-foreground"
                                                        strokeWidth={1.5}
                                                    />
                                                    <span className="text-[10px] font-thin font-body">
                                                        {field.value?.uid
                                                            ? users?.find(
                                                                  (u) =>
                                                                      u.uid ===
                                                                      field
                                                                          .value
                                                                          ?.uid,
                                                              )?.name ||
                                                              'Unknown User'
                                                            : 'SELECT SALES REP'}
                                                    </span>
                                                </div>
                                                <ChevronDown
                                                    className="w-4 h-4 ml-2 opacity-50"
                                                    strokeWidth={1.5}
                                                />
                                            </div>
                                            <Select
                                                onValueChange={(value) => {
                                                    const uid = parseInt(
                                                        value,
                                                        10,
                                                    );
                                                    if (!isNaN(uid)) {
                                                        field.onChange({ uid });
                                                    }
                                                }}
                                                value={
                                                    field.value?.uid?.toString() ||
                                                    ''
                                                }
                                            >
                                                <SelectTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                                <SelectContent className="overflow-y-auto max-h-60">
                                                    {users &&
                                                    users.length > 0 ? (
                                                        users.map((user) => (
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
                                                                            alt={
                                                                                user.name
                                                                            }
                                                                        />
                                                                        <AvatarFallback className="text-[10px]">
                                                                            {`${user.name.charAt(0)}${user.surname ? user.surname.charAt(0) : ''}`}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-[10px] font-normal font-body">
                                                                        {
                                                                            user.name
                                                                        }
                                                                        {user.surname
                                                                            ? ` ${user.surname}`
                                                                            : ''}{' '}
                                                                        (
                                                                        {
                                                                            user.email
                                                                        }
                                                                        )
                                                                    </span>
                                                                </div>
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="px-2 py-4 text-center">
                                                            <p className="text-[10px] text-muted-foreground">
                                                                No sales reps
                                                                available
                                                            </p>
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    The assigned representative for this client
                                </p>
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="type"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Client Type
                                </Label>
                                <Controller
                                    control={control}
                                    name="type"
                                    render={({ field }) => (
                                        <div className="relative">
                                            <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                <div className="flex items-center gap-2">
                                                    <Tag
                                                        className="w-4 h-4 text-muted-foreground"
                                                        strokeWidth={1.5}
                                                    />
                                                    <span className="uppercase text-[10px] font-thin font-body">
                                                        {field.value
                                                            ? field.value.replace(
                                                                  /_/g,
                                                                  ' ',
                                                              )
                                                            : 'SELECT CLIENT TYPE'}
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
                                                        ClientType,
                                                    ).map((type) => (
                                                        <SelectItem
                                                            key={type}
                                                            value={type}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Tag
                                                                    className="w-4 h-4"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                />
                                                                <span className="uppercase text-[10px] font-thin font-body">
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
                                            <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                <div className="flex items-center gap-2">
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
                                                        ClientStatus,
                                                    ).map((status) => (
                                                        <SelectItem
                                                            key={status}
                                                            value={status}
                                                        >
                                                            <div className="flex items-center gap-2">
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
                        </div>
                    </CardContent>
                </Card>
            </fieldset>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4 mt-6 border-t border-border">
                <Button
                    type="button"
                    variant="outline"
                    className="h-9 text-[10px] font-light uppercase font-body"
                    onClick={() => {
                        if (
                            window.confirm(
                                'Are you sure you want to reset the form? All entered data will be lost.',
                            )
                        ) {
                            reset();
                            setLogoImage(null);
                            setSelectedFile(null);
                        }
                    }}
                    disabled={isSubmitting}
                >
                    Reset Form
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading || isSubmitting}
                    className="h-9 text-[10px] font-light uppercase font-body bg-primary hover:bg-primary/90 text-white"
                >
                    {isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
                            <span>Creating...</span>
                        </div>
                    ) : isLoading ? (
                        'Loading...'
                    ) : (
                        'Create Client'
                    )}
                </Button>
            </div>
        </form>
    );
};

export default ClientForm;
