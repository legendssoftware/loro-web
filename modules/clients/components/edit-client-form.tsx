import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    ClientType,
    ClientContactPreference,
    PriceTier,
    AcquisitionChannel,
    ClientRiskLevel,
    PaymentMethod,
    GeofenceType,
} from '@/lib/types/client-enums';
import { ClientStatus } from '@/hooks/use-clients-query';
import { useAuthStore } from '@/store/auth-store';
import { useUsersQuery } from '@/hooks/use-users-query';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '@/lib/services/api-client';
import { format } from 'date-fns';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';

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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
    Building2,
    User,
    Mail,
    Phone,
    Globe,
    Image,
    MapPin,
    CreditCard,
    AlertTriangle,
    Calendar as CalendarIcon,
    Tag,
    X,
    FileText,
    Plus,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { clientFormSchema } from './client-form';
import { Client } from '@/hooks/use-clients-query';
import { Badge } from '@/components/ui/badge';

// Infer TypeScript type from the schema
export type ClientFormValues = z.infer<typeof clientFormSchema>;

// Props interface
interface EditClientFormProps {
    onSubmit: (data: ClientFormValues, clientId: number) => Promise<void>;
    client: Client;
    isLoading?: boolean;
    onCancel?: () => void;
}

// List of countries and payment terms
const COUNTRIES = [
    'South Africa',
    'United States',
    'United Kingdom',
    // ... (include the same list as in client-form.tsx)
];

const PAYMENT_TERMS = [
    'Net 15',
    'Net 30',
    'Net 45',
    'Net 60',
    'Net 90',
    'Due on Receipt',
    'End of Month',
    'EOM 15',
    'EOM 30',
    'EOM 45',
    'EOM 60',
    'Cash on Delivery',
    'Advance Payment',
    'Other',
];

/**
 * EditClientForm Component
 *
 * This component provides a form interface for editing existing clients.
 * It handles data validation, image uploads, and form submission according to
 * the backend API requirements.
 *
 * @component
 */
export const EditClientForm: React.FunctionComponent<EditClientFormProps> = ({
    onSubmit,
    client,
    isLoading = false,
    onCancel,
}) => {
    // State for tracking the file upload process
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [logoImage, setLogoImage] = useState<string | null>(
        client.logo || null,
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Transform client data to match form structure if needed
    const transformClientToFormData = (
        clientData: Client,
    ): Partial<ClientFormValues> => {
        return {
            name: clientData?.name,
            contactPerson: clientData?.contactPerson,
            email: clientData?.email,
            phone: clientData?.phone,
            alternativePhone: clientData?.alternativePhone || '',
            website: clientData?.website || '',
            logo: clientData?.logo || '',
            description: clientData?.description || '',
            address: {
                street: clientData?.address?.street || '',
                suburb: clientData?.address?.suburb || '',
                city: clientData?.address?.city || '',
                state: clientData?.address?.state || '',
                country: clientData?.address?.country || 'South Africa',
                postalCode: clientData?.address?.postalCode || '',
            },
            category:
                (clientData?.category as ClientType) || ClientType.CONTRACT,
            type: (clientData?.type as ClientType) || ClientType.STANDARD,
            status: clientData?.status || ClientStatus.ACTIVE,
            ref: clientData?.ref || '',
            assignedSalesRep: clientData?.assignedSalesRep
                ? {
                      uid: clientData?.assignedSalesRep?.uid,
                  }
                : undefined,
            creditLimit:
                clientData?.creditLimit !== undefined
                    ? clientData?.creditLimit
                    : 0,
            outstandingBalance:
                clientData?.outstandingBalance !== undefined
                    ? clientData?.outstandingBalance
                    : 0,
            priceTier:
                (clientData?.priceTier as PriceTier) || PriceTier.STANDARD,
            discountPercentage:
                clientData?.discountPercentage !== undefined
                    ? clientData?.discountPercentage
                    : 0,
            paymentTerms: clientData?.paymentTerms || 'Net 30',
            lifetimeValue:
                clientData?.lifetimeValue !== undefined
                    ? clientData?.lifetimeValue
                    : 0,
            preferredPaymentMethod:
                (clientData?.preferredPaymentMethod as PaymentMethod) ||
                undefined,
            preferredContactMethod:
                (clientData?.preferredContactMethod as ClientContactPreference) ||
                ClientContactPreference.EMAIL,
            preferredLanguage: clientData?.preferredLanguage || 'English',
            lastVisitDate: clientData?.lastVisitDate
                ? new Date(clientData?.lastVisitDate)
                : undefined,
            nextContactDate: clientData?.nextContactDate
                ? new Date(clientData?.nextContactDate)
                : undefined,
            birthday: clientData?.birthday
                ? new Date(clientData?.birthday)
                : undefined,
            anniversaryDate: clientData?.anniversaryDate
                ? new Date(clientData?.anniversaryDate)
                : undefined,
            industry: clientData?.industry || '',
            companySize:
                clientData?.companySize !== undefined
                    ? clientData?.companySize
                    : undefined,
            annualRevenue:
                clientData?.annualRevenue !== undefined
                    ? clientData?.annualRevenue
                    : undefined,
            acquisitionChannel:
                (clientData?.acquisitionChannel as AcquisitionChannel) ||
                undefined,
            acquisitionDate: clientData?.acquisitionDate
                ? new Date(clientData?.acquisitionDate)
                : undefined,
            riskLevel:
                (clientData?.riskLevel as ClientRiskLevel) ||
                ClientRiskLevel.LOW,
            satisfactionScore:
                clientData?.satisfactionScore !== undefined
                    ? clientData?.satisfactionScore
                    : undefined,
            npsScore:
                clientData?.npsScore !== undefined
                    ? clientData?.npsScore
                    : undefined,
            tags: clientData?.tags || [],
            visibleCategories: clientData?.visibleCategories || [],
            customFields: clientData?.customFields || {},
            socialProfiles: {
                linkedin: clientData?.socialProfiles?.linkedin || '',
                twitter: clientData?.socialProfiles?.twitter || '',
                facebook: clientData?.socialProfiles?.facebook || '',
                instagram: clientData?.socialProfiles?.instagram || '',
            },
            geofenceType:
                (clientData?.geofenceType as GeofenceType) || GeofenceType.NONE,
            geofenceRadius: clientData?.geofenceRadius || 500,
            enableGeofence: clientData?.enableGeofence || false,
            latitude: clientData?.latitude || undefined,
            longitude: clientData?.longitude || undefined,
        };
    };

    // Initialize form with client data
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
        defaultValues: transformClientToFormData(client),
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
                        }
                    },
                },
            );

            const data = response.data;

            if (data.publicUrl) {
                showSuccessToast('Logo uploaded successfully', toast);
                return data.publicUrl;
            } else {
                showErrorToast('Failed to upload logo image', toast);
                return null;
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            showErrorToast('Error uploading logo image', toast);
            return null;
        }
    };

    /**
     * Submits the form data to the server for updating the client
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

            // Format dates to YYYY-MM-DD to prevent database errors
            const formatDateToYYYYMMDD = (date: Date | undefined) => {
                if (!date) return undefined;
                return format(new Date(date), 'yyyy-MM-dd');
            };

            // Convert formatted dates back to Date objects for type compatibility
            const parseFormattedDateToDate = (dateStr: string | undefined) => {
                if (!dateStr) return undefined;
                const [year, month, day] = dateStr.split('-').map(Number);
                return new Date(year, month - 1, day);
            };

            // Prepare client data for API submission with formatted dates
            const apiClientData = {
                ...data,
                logo: logoUrl,
                // Format date fields to YYYY-MM-DD for API
                birthday: data.birthday
                    ? formatDateToYYYYMMDD(data.birthday)
                    : undefined,
                anniversaryDate: data.anniversaryDate
                    ? formatDateToYYYYMMDD(data.anniversaryDate)
                    : undefined,
                acquisitionDate: data.acquisitionDate
                    ? formatDateToYYYYMMDD(data.acquisitionDate)
                    : undefined,
                lastVisitDate: data.lastVisitDate
                    ? formatDateToYYYYMMDD(data.lastVisitDate)
                    : undefined,
                nextContactDate: data.nextContactDate
                    ? formatDateToYYYYMMDD(data.nextContactDate)
                    : undefined,
            };

            // Remove ref from apiClientData
            // The ref field is causing errors as it doesn't exist in the Client entity
            delete (apiClientData as any).ref;

            // Create type-compatible client data for onSubmit (with Date objects)
            const clientData: ClientFormValues = {
                ...data,
                logo: logoUrl,
            };

            // Submit the data to the parent component with API-formatted data
            // This allows the parent component to directly use the properly formatted data for the API
            await onSubmit(
                apiClientData as any as ClientFormValues,
                client.uid,
            );

            showSuccessToast('Client updated successfully', toast);
        } catch (error) {
            console.error('Error updating client:', error);
            showErrorToast(
                'Failed to update client. Please check required fields and try again.',
                toast,
            );
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
        <form
            onSubmit={handleSubmit(onFormSubmit)}
            className="space-y-6 bg-card "
        >
            <p className="mb-2 text-xs text-muted-foreground">
                <span className="text-red-500">*</span> indicates required
                fields
            </p>
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
                                        className="object-contain p-1"
                                    />
                                    <AvatarFallback className="text-lg font-normal uppercase font-body">
                                        {watch('name')?.charAt(0) ||
                                            client.name.charAt(0) ||
                                            'C'}
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
                                    className={`font-light bg-card border-border placeholder:text-xs placeholder:font-body ${
                                        errors.name
                                            ? 'border-red-500 focus:ring-red-500'
                                            : ''
                                    }`}
                                    aria-required="true"
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
                                        className={`pl-10 font-light bg-card border-border placeholder:text-xs placeholder:font-body ${
                                            errors.contactPerson
                                                ? 'border-red-500 focus:ring-red-500'
                                                : ''
                                        }`}
                                        aria-required="true"
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
                                        className={`pl-10 font-light bg-card border-border placeholder:text-xs placeholder:font-body ${
                                            errors.email
                                                ? 'border-red-500 focus:ring-red-500'
                                                : ''
                                        }`}
                                        aria-required="true"
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
                                        className={`pl-10 font-light bg-card border-border placeholder:text-xs placeholder:font-body ${
                                            errors.phone
                                                ? 'border-red-500 focus:ring-red-500'
                                                : ''
                                        }`}
                                        aria-required="true"
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
                                    className={`font-light bg-card border-border placeholder:text-xs placeholder:font-body ${
                                        errors.address?.street
                                            ? 'border-red-500 focus:ring-red-500'
                                            : ''
                                    }`}
                                    aria-required="true"
                                />
                                {errors.address?.street && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.address.street.message}
                                    </p>
                                )}
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
                                    className={`font-light bg-card border-border placeholder:text-xs placeholder:font-body ${
                                        errors.address?.suburb
                                            ? 'border-red-500 focus:ring-red-500'
                                            : ''
                                    }`}
                                    aria-required="true"
                                />
                                {errors.address?.suburb && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.address.suburb.message}
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
                                    className={`font-light bg-card border-border placeholder:text-xs placeholder:font-body ${
                                        errors.address?.city
                                            ? 'border-red-500 focus:ring-red-500'
                                            : ''
                                    }`}
                                    aria-required="true"
                                />
                                {errors.address?.city && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.address.city.message}
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
                                    className={`font-light bg-card border-border placeholder:text-xs placeholder:font-body ${
                                        errors.address?.state
                                            ? 'border-red-500 focus:ring-red-500'
                                            : ''
                                    }`}
                                    aria-required="true"
                                />
                                {errors.address?.state && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.address.state.message}
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
                                <Controller
                                    name="address.country"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger
                                                className={`w-full font-light bg-card border-border ${
                                                    errors.address?.country
                                                        ? 'border-red-500 focus:ring-red-500'
                                                        : ''
                                                }`}
                                            >
                                                {field.value ||
                                                    'Select a country'}
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[200px]">
                                                {COUNTRIES.map((country) => (
                                                    <SelectItem
                                                        key={country}
                                                        value={country}
                                                    >
                                                        {country}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.address?.country && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.address.country.message}
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
                                    className={`font-light bg-card border-border placeholder:text-xs placeholder:font-body ${
                                        errors.address?.postalCode
                                            ? 'border-red-500 focus:ring-red-500'
                                            : ''
                                    }`}
                                    aria-required="true"
                                />
                                {errors.address?.postalCode && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.address.postalCode.message}
                                    </p>
                                )}
                            </div>
                        </div>

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
                                    step="0.000001"
                                    {...register('latitude', {
                                        valueAsNumber: true,
                                    })}
                                    placeholder="51.5074"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
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
                                    step="0.000001"
                                    {...register('longitude', {
                                        valueAsNumber: true,
                                    })}
                                    placeholder="-0.1278"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Business Information Section */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <Building2 className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Business Information
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="category"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Client Category
                                </Label>
                                <Controller
                                    name="category"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="w-full font-light bg-card border-border">
                                                {field.value ||
                                                    'Select category'}
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem
                                                    value={ClientType.CONTRACT}
                                                >
                                                    Contract
                                                </SelectItem>
                                                <SelectItem
                                                    value={ClientType.STANDARD}
                                                >
                                                    Standard
                                                </SelectItem>
                                                <SelectItem
                                                    value={ClientType.RETAIL}
                                                >
                                                    Retail
                                                </SelectItem>
                                                <SelectItem
                                                    value={ClientType.WHOLESALE}
                                                >
                                                    Wholesale
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="type"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Client Type
                                </Label>
                                <Controller
                                    name="type"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="w-full font-light bg-card border-border">
                                                {field.value || 'Select type'}
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem
                                                    value={ClientType.STANDARD}
                                                >
                                                    Standard
                                                </SelectItem>
                                                <SelectItem
                                                    value={ClientType.PREMIUM}
                                                >
                                                    Premium
                                                </SelectItem>
                                                <SelectItem
                                                    value={ClientType.VIP}
                                                >
                                                    VIP
                                                </SelectItem>
                                                <SelectItem
                                                    value={
                                                        ClientType.ENTERPRISE
                                                    }
                                                >
                                                    Enterprise
                                                </SelectItem>
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
                                    Client Status
                                </Label>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="w-full font-light bg-card border-border">
                                                {field.value || 'Select status'}
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem
                                                    value={ClientStatus.ACTIVE}
                                                >
                                                    Active
                                                </SelectItem>
                                                <SelectItem
                                                    value={
                                                        ClientStatus.INACTIVE
                                                    }
                                                >
                                                    Inactive
                                                </SelectItem>
                                                <SelectItem
                                                    value={ClientStatus.PENDING}
                                                >
                                                    Pending
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="industry"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Industry
                                </Label>
                                <Input
                                    id="industry"
                                    {...register('industry')}
                                    placeholder="Technology"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="companySize"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Company Size
                                </Label>
                                <Input
                                    id="companySize"
                                    type="number"
                                    {...register('companySize', {
                                        valueAsNumber: true,
                                    })}
                                    placeholder="250"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="annualRevenue"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Annual Revenue
                                </Label>
                                <Input
                                    id="annualRevenue"
                                    type="number"
                                    {...register('annualRevenue', {
                                        valueAsNumber: true,
                                    })}
                                    placeholder="5000000"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="ref"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Reference Code
                                </Label>
                                <Input
                                    id="ref"
                                    {...register('ref')}
                                    placeholder="CL123456"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Financial Information Section */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <CreditCard className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Financial Information
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="creditLimit"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Credit Limit
                                </Label>
                                <Input
                                    id="creditLimit"
                                    type="number"
                                    {...register('creditLimit', {
                                        valueAsNumber: true,
                                    })}
                                    placeholder="50000"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="outstandingBalance"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Outstanding Balance
                                </Label>
                                <Input
                                    id="outstandingBalance"
                                    type="number"
                                    {...register('outstandingBalance', {
                                        valueAsNumber: true,
                                    })}
                                    placeholder="5000"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="lifetimeValue"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Lifetime Value
                                </Label>
                                <Input
                                    id="lifetimeValue"
                                    type="number"
                                    {...register('lifetimeValue', {
                                        valueAsNumber: true,
                                    })}
                                    placeholder="250000"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="discountPercentage"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Discount Percentage
                                </Label>
                                <Input
                                    id="discountPercentage"
                                    type="number"
                                    min="0"
                                    max="100"
                                    {...register('discountPercentage', {
                                        valueAsNumber: true,
                                    })}
                                    placeholder="10"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Value between 0-100%
                                </p>
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="priceTier"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Price Tier
                                </Label>
                                <Controller
                                    name="priceTier"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="w-full font-light bg-card border-border">
                                                {field.value ||
                                                    'Select price tier'}
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem
                                                    value={PriceTier.STANDARD}
                                                >
                                                    Standard
                                                </SelectItem>
                                                <SelectItem
                                                    value={PriceTier.PREMIUM}
                                                >
                                                    Premium
                                                </SelectItem>
                                                <SelectItem
                                                    value={PriceTier.WHOLESALE}
                                                >
                                                    Wholesale
                                                </SelectItem>
                                                <SelectItem
                                                    value={PriceTier.ENTERPRISE}
                                                >
                                                    Enterprise
                                                </SelectItem>
                                                <SelectItem
                                                    value={PriceTier.CUSTOM}
                                                >
                                                    Custom
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="paymentTerms"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Payment Terms
                                </Label>
                                <Controller
                                    name="paymentTerms"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="w-full font-light bg-card border-border">
                                                {field.value ||
                                                    'Select payment terms'}
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PAYMENT_TERMS.map((term) => (
                                                    <SelectItem
                                                        key={term}
                                                        value={term}
                                                    >
                                                        {term}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="preferredPaymentMethod"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Preferred Payment Method
                                </Label>
                                <Controller
                                    name="preferredPaymentMethod"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="w-full font-light bg-card border-border">
                                                {field.value ||
                                                    'Select payment method'}
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem
                                                    value={
                                                        PaymentMethod.CREDIT_CARD
                                                    }
                                                >
                                                    Credit Card
                                                </SelectItem>
                                                <SelectItem
                                                    value={
                                                        PaymentMethod.DEBIT_CARD
                                                    }
                                                >
                                                    Debit Card
                                                </SelectItem>
                                                <SelectItem
                                                    value={
                                                        PaymentMethod.BANK_TRANSFER
                                                    }
                                                >
                                                    Bank Transfer
                                                </SelectItem>
                                                <SelectItem
                                                    value={PaymentMethod.CASH}
                                                >
                                                    Cash
                                                </SelectItem>
                                                <SelectItem
                                                    value={PaymentMethod.CHECK}
                                                >
                                                    Check
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Preferences Section */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <Phone className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Contact Preferences
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="preferredContactMethod"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Preferred Contact Method
                                </Label>
                                <Controller
                                    name="preferredContactMethod"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="w-full font-light bg-card border-border">
                                                {field.value ||
                                                    'Select contact method'}
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem
                                                    value={
                                                        ClientContactPreference.EMAIL
                                                    }
                                                >
                                                    Email
                                                </SelectItem>
                                                <SelectItem
                                                    value={
                                                        ClientContactPreference.PHONE
                                                    }
                                                >
                                                    Phone
                                                </SelectItem>
                                                <SelectItem
                                                    value={
                                                        ClientContactPreference.SMS
                                                    }
                                                >
                                                    SMS
                                                </SelectItem>
                                                <SelectItem
                                                    value={
                                                        ClientContactPreference.WHATSAPP
                                                    }
                                                >
                                                    WhatsApp
                                                </SelectItem>
                                                <SelectItem
                                                    value={
                                                        ClientContactPreference.IN_PERSON
                                                    }
                                                >
                                                    In Person
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="preferredLanguage"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Preferred Language
                                </Label>
                                <Controller
                                    name="preferredLanguage"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="w-full font-light bg-card border-border">
                                                {field.value ||
                                                    'Select language'}
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="English">
                                                    English
                                                </SelectItem>
                                                <SelectItem value="Afrikaans">
                                                    Afrikaans
                                                </SelectItem>
                                                <SelectItem value="Zulu">
                                                    Zulu
                                                </SelectItem>
                                                <SelectItem value="Xhosa">
                                                    Xhosa
                                                </SelectItem>
                                                <SelectItem value="Sotho">
                                                    Sotho
                                                </SelectItem>
                                                <SelectItem value="Other">
                                                    Other
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="lastVisitDate"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Last Visit Date
                                </Label>
                                <Controller
                                    name="lastVisitDate"
                                    control={control}
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={`w-full justify-start text-left font-normal  bg-card font-body uppercase text-[10px] ${
                                                        !field.value &&
                                                        'text-muted-foreground'
                                                    }`}
                                                >
                                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                                    {field.value ? (
                                                        format(
                                                            field.value,
                                                            'PPP',
                                                        )
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="nextContactDate"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Next Contact Date
                                </Label>
                                <Controller
                                    name="nextContactDate"
                                    control={control}
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={`w-full justify-start text-left font-normal  bg-card font-body uppercase text-[10px] ${
                                                        !field.value &&
                                                        'text-muted-foreground'
                                                    }`}
                                                >
                                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                                    {field.value ? (
                                                        format(
                                                            field.value,
                                                            'PPP',
                                                        )
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="birthday"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Birthday
                                </Label>
                                <Controller
                                    name="birthday"
                                    control={control}
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={`w-full justify-start text-left font-normal  bg-card font-body uppercase text-[10px] ${
                                                        !field.value &&
                                                        'text-muted-foreground'
                                                    }`}
                                                >
                                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                                    {field.value ? (
                                                        format(
                                                            field.value,
                                                            'PPP',
                                                        )
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="anniversaryDate"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Anniversary Date
                                </Label>
                                <Controller
                                    name="anniversaryDate"
                                    control={control}
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={`w-full justify-start text-left font-normal  bg-card font-body uppercase text-[10px] ${
                                                        !field.value &&
                                                        'text-muted-foreground'
                                                    }`}
                                                >
                                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                                    {field.value ? (
                                                        format(
                                                            field.value,
                                                            'PPP',
                                                        )
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Acquisition and Risk Assessment Section */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <AlertTriangle
                                className="w-4 h-4"
                                strokeWidth={1.5}
                            />
                            <span className="font-light uppercase font-body">
                                Acquisition & Risk Assessment
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="acquisitionChannel"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Acquisition Channel
                                </Label>
                                <Controller
                                    name="acquisitionChannel"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="w-full font-light bg-card border-border">
                                                {field.value ||
                                                    'Select channel'}
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem
                                                    value={
                                                        AcquisitionChannel.REFERRAL
                                                    }
                                                >
                                                    Referral
                                                </SelectItem>
                                                <SelectItem
                                                    value={
                                                        AcquisitionChannel.DIRECT
                                                    }
                                                >
                                                    Direct
                                                </SelectItem>
                                                <SelectItem
                                                    value={
                                                        AcquisitionChannel.SOCIAL_MEDIA
                                                    }
                                                >
                                                    Social Media
                                                </SelectItem>
                                                <SelectItem
                                                    value={
                                                        AcquisitionChannel.ONLINE_AD
                                                    }
                                                >
                                                    Online Ad
                                                </SelectItem>
                                                <SelectItem
                                                    value={
                                                        AcquisitionChannel.ORGANIC_SEARCH
                                                    }
                                                >
                                                    Organic Search
                                                </SelectItem>
                                                <SelectItem
                                                    value={
                                                        AcquisitionChannel.PARTNER
                                                    }
                                                >
                                                    Partner
                                                </SelectItem>
                                                <SelectItem
                                                    value={
                                                        AcquisitionChannel.OTHER
                                                    }
                                                >
                                                    Other
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="acquisitionDate"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Acquisition Date
                                </Label>
                                <Controller
                                    name="acquisitionDate"
                                    control={control}
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={`w-full justify-start text-left font-normal  bg-card font-body uppercase text-[10px] ${
                                                        !field.value &&
                                                        'text-muted-foreground'
                                                    }`}
                                                >
                                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                                    {field.value ? (
                                                        format(
                                                            field.value,
                                                            'PPP',
                                                        )
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="riskLevel"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Risk Level
                                </Label>
                                <Controller
                                    name="riskLevel"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="w-full font-light bg-card border-border">
                                                {field.value ||
                                                    'Select risk level'}
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem
                                                    value={ClientRiskLevel.LOW}
                                                >
                                                    Low
                                                </SelectItem>
                                                <SelectItem
                                                    value={
                                                        ClientRiskLevel.MEDIUM
                                                    }
                                                >
                                                    Medium
                                                </SelectItem>
                                                <SelectItem
                                                    value={ClientRiskLevel.HIGH}
                                                >
                                                    High
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="satisfactionScore"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Satisfaction Score (0-10)
                                </Label>
                                <Input
                                    id="satisfactionScore"
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    {...register('satisfactionScore', {
                                        valueAsNumber: true,
                                    })}
                                    placeholder="9.5"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="npsScore"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    NPS Score (-10 to 10)
                                </Label>
                                <Input
                                    id="npsScore"
                                    type="number"
                                    min="-10"
                                    max="10"
                                    {...register('npsScore', {
                                        valueAsNumber: true,
                                    })}
                                    placeholder="8"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Geofencing Section */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <MapPin className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Geofencing
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Controller
                                name="enableGeofence"
                                control={control}
                                render={({ field }) => (
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        id="enableGeofence"
                                    />
                                )}
                            />
                            <Label
                                htmlFor="enableGeofence"
                                className="text-xs font-light uppercase font-body"
                            >
                                Enable Geofencing
                            </Label>
                        </div>

                        {watch('enableGeofence') && (
                            <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
                                <div className="space-y-1">
                                    <Label
                                        htmlFor="geofenceType"
                                        className="block text-xs font-light uppercase font-body"
                                    >
                                        Geofence Type
                                    </Label>
                                    <Controller
                                        name="geofenceType"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger className="w-full font-light bg-card border-border">
                                                    {field.value ||
                                                        'Select type'}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem
                                                        value={
                                                            GeofenceType.NONE
                                                        }
                                                    >
                                                        None
                                                    </SelectItem>
                                                    <SelectItem
                                                        value={
                                                            GeofenceType.NOTIFY
                                                        }
                                                    >
                                                        Notify Only
                                                    </SelectItem>
                                                    <SelectItem
                                                        value={
                                                            GeofenceType.ALERT
                                                        }
                                                    >
                                                        Alert
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label
                                        htmlFor="geofenceRadius"
                                        className="block text-xs font-light uppercase font-body"
                                    >
                                        Geofence Radius (meters)
                                    </Label>
                                    <Input
                                        id="geofenceRadius"
                                        type="number"
                                        min="100"
                                        max="5000"
                                        {...register('geofenceRadius', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="500"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                        Range: 100-5000 meters
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Social Media Profiles Section */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <Globe className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Social Media Profiles
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="socialProfiles.linkedin"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    LinkedIn Profile
                                </Label>
                                <Input
                                    id="socialProfiles.linkedin"
                                    {...register('socialProfiles.linkedin')}
                                    placeholder="https://www.linkedin.com/company/acme"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.socialProfiles?.linkedin && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.socialProfiles.linkedin.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="socialProfiles.twitter"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Twitter/X Profile
                                </Label>
                                <Input
                                    id="socialProfiles.twitter"
                                    {...register('socialProfiles.twitter')}
                                    placeholder="https://twitter.com/acme"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.socialProfiles?.twitter && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.socialProfiles.twitter.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="socialProfiles.facebook"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Facebook Page
                                </Label>
                                <Input
                                    id="socialProfiles.facebook"
                                    {...register('socialProfiles.facebook')}
                                    placeholder="https://www.facebook.com/acme"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.socialProfiles?.facebook && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.socialProfiles.facebook.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="socialProfiles.instagram"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Instagram Profile
                                </Label>
                                <Input
                                    id="socialProfiles.instagram"
                                    {...register('socialProfiles.instagram')}
                                    placeholder="https://www.instagram.com/acme"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.socialProfiles?.instagram && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {
                                            errors.socialProfiles.instagram
                                                .message
                                        }
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tags and Categories Section */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <Tag className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Tags & Categories
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="tags"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Tags
                                </Label>
                                <Controller
                                    name="tags"
                                    control={control}
                                    render={({ field }) => {
                                        const tags = Array.isArray(field.value)
                                            ? field.value
                                            : [];
                                        const handleTagDelete = (
                                            index: number,
                                        ) => {
                                            const newTags = tags.filter(
                                                (_, i) => i !== index,
                                            );
                                            field.onChange(newTags);
                                        };

                                        const handleTagAdd = (
                                            e: React.KeyboardEvent<HTMLInputElement>,
                                        ) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const input = e.currentTarget;
                                                const value =
                                                    input.value.trim();
                                                if (
                                                    value &&
                                                    !tags.includes(value)
                                                ) {
                                                    field.onChange([
                                                        ...tags,
                                                        value,
                                                    ]);
                                                    input.value = '';
                                                }
                                            }
                                        };

                                        return (
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap gap-2">
                                                    {tags.map(
                                                        (
                                                            tag: string,
                                                            index: number,
                                                        ) => (
                                                            <Badge
                                                                key={index}
                                                                variant="outline"
                                                                className="text-xs font-light bg-card border-border"
                                                            >
                                                                {tag}
                                                                <X
                                                                    className="w-3 h-3 ml-1 cursor-pointer"
                                                                    onClick={() =>
                                                                        handleTagDelete(
                                                                            index,
                                                                        )
                                                                    }
                                                                />
                                                            </Badge>
                                                        ),
                                                    )}
                                                </div>
                                                <Input
                                                    placeholder="Type and press Enter to add tags"
                                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                                    onKeyDown={handleTagAdd}
                                                />
                                            </div>
                                        );
                                    }}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="visibleCategories"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Visible Categories
                                </Label>
                                <Controller
                                    name="visibleCategories"
                                    control={control}
                                    render={({ field }) => {
                                        const categories = Array.isArray(
                                            field.value,
                                        )
                                            ? field.value
                                            : [];
                                        const handleCategoryDelete = (
                                            index: number,
                                        ) => {
                                            const newCategories =
                                                categories.filter(
                                                    (_, i) => i !== index,
                                                );
                                            field.onChange(newCategories);
                                        };

                                        const handleCategoryAdd = (
                                            e: React.KeyboardEvent<HTMLInputElement>,
                                        ) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const input = e.currentTarget;
                                                const value =
                                                    input.value.trim();
                                                if (
                                                    value &&
                                                    !categories.includes(value)
                                                ) {
                                                    field.onChange([
                                                        ...categories,
                                                        value,
                                                    ]);
                                                    input.value = '';
                                                }
                                            }
                                        };

                                        return (
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap gap-2">
                                                    {categories.map(
                                                        (
                                                            category: string,
                                                            index: number,
                                                        ) => (
                                                            <Badge
                                                                key={index}
                                                                variant="outline"
                                                                className="text-xs font-light bg-card border-border"
                                                            >
                                                                {category}
                                                                <X
                                                                    className="w-3 h-3 ml-1 cursor-pointer"
                                                                    onClick={() =>
                                                                        handleCategoryDelete(
                                                                            index,
                                                                        )
                                                                    }
                                                                />
                                                            </Badge>
                                                        ),
                                                    )}
                                                </div>
                                                <Input
                                                    placeholder="Type and press Enter to add categories"
                                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                                    onKeyDown={
                                                        handleCategoryAdd
                                                    }
                                                />
                                            </div>
                                        );
                                    }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </fieldset>

            {/* Submit Button */}
            <div className="pt-4 mt-6 border-t border-border">
                {Object.keys(errors).length > 0 && (
                    <div className="p-3 mb-4 text-xs text-red-800 bg-red-100 rounded-md">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            <p className="font-semibold">
                                Please fix the following errors:
                            </p>
                        </div>
                        <ul className="pl-4 mt-1 list-disc">
                            {errors.name && <li>Company Name is required</li>}
                            {errors.contactPerson && (
                                <li>Contact Person is required</li>
                            )}
                            {errors.email && <li>Valid Email is required</li>}
                            {errors.phone && <li>Valid Phone is required</li>}
                            {errors.address?.street && (
                                <li>Street Address is required</li>
                            )}
                            {errors.address?.suburb && (
                                <li>Suburb is required</li>
                            )}
                            {errors.address?.city && <li>City is required</li>}
                            {errors.address?.state && (
                                <li>State/Province is required</li>
                            )}
                            {errors.address?.country && (
                                <li>Country is required</li>
                            )}
                            {errors.address?.postalCode && (
                                <li>Postal Code is required</li>
                            )}
                            {errors.website && (
                                <li>Website must be a valid URL format</li>
                            )}
                            {errors.discountPercentage && (
                                <li>Discount must be between 0-100%</li>
                            )}
                        </ul>
                    </div>
                )}
                <div className="flex justify-end gap-2">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            className="h-9 text-[10px] font-light uppercase font-body"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={isLoading || isSubmitting}
                        className="h-9 text-[10px] font-light uppercase font-body bg-primary hover:bg-primary/90 text-white"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <span className="inline-block w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
                                <span>Updating...</span>
                            </div>
                        ) : isLoading ? (
                            'Loading...'
                        ) : (
                            'Update Client'
                        )}
                    </Button>
                </div>
            </div>
        </form>
    );
};
