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
    ClientLanguage,
} from '@/lib/types/client-enums';
import { ClientStatus } from '@/hooks/use-clients-query';
import { useAuthStore, selectProfileData } from '@/store/auth-store';
import { useUsersQuery } from '@/hooks/use-users-query';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '@/lib/services/api-client';
import { format } from 'date-fns';

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
    CreditCard,
    AlertTriangle,
    Calendar as CalendarIcon,
    X,
    Plus,
    Clock,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

// List of countries for dropdown
const COUNTRIES = [
    'Afghanistan',
    'Albania',
    'Algeria',
    'Andorra',
    'Angola',
    'Antigua and Barbuda',
    'Argentina',
    'Armenia',
    'Australia',
    'Austria',
    'Azerbaijan',
    'Bahamas',
    'Bahrain',
    'Bangladesh',
    'Barbados',
    'Belarus',
    'Belgium',
    'Belize',
    'Benin',
    'Bhutan',
    'Bolivia',
    'Bosnia and Herzegovina',
    'Botswana',
    'Brazil',
    'Brunei',
    'Bulgaria',
    'Burkina Faso',
    'Burundi',
    'Cabo Verde',
    'Cambodia',
    'Cameroon',
    'Canada',
    'Central African Republic',
    'Chad',
    'Chile',
    'China',
    'Colombia',
    'Comoros',
    'Congo',
    'Costa Rica',
    'Croatia',
    'Cuba',
    'Cyprus',
    'Czech Republic',
    'Denmark',
    'Djibouti',
    'Dominica',
    'Dominican Republic',
    'East Timor',
    'Ecuador',
    'Egypt',
    'El Salvador',
    'Equatorial Guinea',
    'Eritrea',
    'Estonia',
    'Eswatini',
    'Ethiopia',
    'Fiji',
    'Finland',
    'France',
    'Gabon',
    'Gambia',
    'Georgia',
    'Germany',
    'Ghana',
    'Greece',
    'Grenada',
    'Guatemala',
    'Guinea',
    'Guinea-Bissau',
    'Guyana',
    'Haiti',
    'Honduras',
    'Hungary',
    'Iceland',
    'India',
    'Indonesia',
    'Iran',
    'Iraq',
    'Ireland',
    'Israel',
    'Italy',
    'Jamaica',
    'Japan',
    'Jordan',
    'Kazakhstan',
    'Kenya',
    'Kiribati',
    'Korea, North',
    'Korea, South',
    'Kosovo',
    'Kuwait',
    'Kyrgyzstan',
    'Laos',
    'Latvia',
    'Lebanon',
    'Lesotho',
    'Liberia',
    'Libya',
    'Liechtenstein',
    'Lithuania',
    'Luxembourg',
    'Madagascar',
    'Malawi',
    'Malaysia',
    'Maldives',
    'Mali',
    'Malta',
    'Marshall Islands',
    'Mauritania',
    'Mauritius',
    'Mexico',
    'Micronesia',
    'Moldova',
    'Monaco',
    'Mongolia',
    'Montenegro',
    'Morocco',
    'Mozambique',
    'Myanmar',
    'Namibia',
    'Nauru',
    'Nepal',
    'Netherlands',
    'New Zealand',
    'Nicaragua',
    'Niger',
    'Nigeria',
    'North Macedonia',
    'Norway',
    'Oman',
    'Pakistan',
    'Palau',
    'Palestine',
    'Panama',
    'Papua New Guinea',
    'Paraguay',
    'Peru',
    'Philippines',
    'Poland',
    'Portugal',
    'Qatar',
    'Romania',
    'Russia',
    'Rwanda',
    'Saint Kitts and Nevis',
    'Saint Lucia',
    'Saint Vincent and the Grenadines',
    'Samoa',
    'San Marino',
    'Sao Tome and Principe',
    'Saudi Arabia',
    'Senegal',
    'Serbia',
    'Seychelles',
    'Sierra Leone',
    'Singapore',
    'Slovakia',
    'Slovenia',
    'Solomon Islands',
    'Somalia',
    'South Africa',
    'South Sudan',
    'Spain',
    'Sri Lanka',
    'Sudan',
    'Suriname',
    'Sweden',
    'Switzerland',
    'Syria',
    'Taiwan',
    'Tajikistan',
    'Tanzania',
    'Thailand',
    'Togo',
    'Tonga',
    'Trinidad and Tobago',
    'Tunisia',
    'Turkey',
    'Turkmenistan',
    'Tuvalu',
    'Uganda',
    'Ukraine',
    'United Arab Emirates',
    'United Kingdom',
    'United States',
    'Uruguay',
    'Uzbekistan',
    'Vanuatu',
    'Vatican City',
    'Venezuela',
    'Vietnam',
    'Yemen',
    'Zambia',
    'Zimbabwe',
];

// List of payment terms
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
    // Financial Information
    creditLimit: z.number().optional(),
    outstandingBalance: z.number().optional(),
    priceTier: z.nativeEnum(PriceTier).default(PriceTier.STANDARD).optional(),
    discountPercentage: z.number().min(0).max(100).optional(),
    paymentTerms: z.string().optional(),
    lifetimeValue: z.number().optional(),
    preferredPaymentMethod: z.nativeEnum(PaymentMethod).optional(),
    // Contact preferences and dates
    preferredContactMethod: z
        .nativeEnum(ClientContactPreference)
        .default(ClientContactPreference.EMAIL)
        .optional(),
    preferredLanguage: z.string().optional(),
    lastVisitDate: z.date().optional(),
    nextContactDate: z.date().optional(),
    birthday: z.date().optional(),
    anniversaryDate: z.date().optional(),
    // Business information
    industry: z.string().optional(),
    companySize: z.number().optional(),
    annualRevenue: z.number().optional(),
    // Customer insights
    acquisitionChannel: z.nativeEnum(AcquisitionChannel).optional(),
    acquisitionDate: z.date().optional(),
    riskLevel: z
        .nativeEnum(ClientRiskLevel)
        .default(ClientRiskLevel.LOW)
        .optional(),
    satisfactionScore: z.number().min(0).max(10).optional(),
    npsScore: z.number().min(-10).max(10).optional(),
    // Categorization and geofencing
    tags: z.array(z.string()).optional(),
    visibleCategories: z.array(z.string()).optional(),
    customFields: z.record(z.string(), z.any()).optional(),
    socialProfiles: z
        .object({
            linkedin: z.string().url().optional(),
            twitter: z.string().url().optional(),
            facebook: z.string().url().optional(),
            instagram: z.string().url().optional(),
        })
        .optional(),
    geofenceType: z
        .nativeEnum(GeofenceType)
        .default(GeofenceType.NONE)
        .optional(),
    geofenceRadius: z.number().min(100).max(5000).default(500).optional(),
    enableGeofence: z.boolean().default(false).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
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
        // Additional fields
        creditLimit: 0,
        outstandingBalance: 0,
        priceTier: PriceTier.STANDARD,
        discountPercentage: 0,
        paymentTerms: 'Net 30',
        preferredContactMethod: ClientContactPreference.EMAIL,
        preferredLanguage: 'English',
        riskLevel: ClientRiskLevel.LOW,
        tags: [],
        visibleCategories: [],
        customFields: {},
        socialProfiles: {
            linkedin: '',
            twitter: '',
            facebook: '',
            instagram: '',
        },
        geofenceType: GeofenceType.NONE,
        geofenceRadius: 500,
        enableGeofence: false,
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
                                <Controller
                                    control={control}
                                    name="address.country"
                                    render={({ field }) => (
                                        <div className="relative">
                                            <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                <div className="flex items-center gap-2">
                                                    <Globe
                                                        className="w-4 h-4 text-muted-foreground"
                                                        strokeWidth={1.5}
                                                    />
                                                    <span className="text-[10px] font-thin font-body">
                                                        {field.value ||
                                                            'SELECT COUNTRY'}
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
                                                <SelectContent className="max-h-[300px] overflow-y-auto">
                                                    {COUNTRIES.map(
                                                        (country) => (
                                                            <SelectItem
                                                                key={country}
                                                                value={country}
                                                            >
                                                                <span className="text-[10px] font-normal font-body">
                                                                    {country}
                                                                </span>
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
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
                                {errors.industry && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.industry.message}
                                    </p>
                                )}
                                <p className="text-[10px] text-muted-foreground">
                                    The industry sector this client operates in
                                </p>
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
                                {errors.companySize && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.companySize.message}
                                    </p>
                                )}
                                <p className="text-[10px] text-muted-foreground">
                                    Number of employees
                                </p>
                            </div>
                        </div>

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
                                {errors.creditLimit && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.creditLimit.message}
                                    </p>
                                )}
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
                                {errors.outstandingBalance && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.outstandingBalance.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="paymentTerms"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Payment Terms
                                </Label>
                                <Controller
                                    control={control}
                                    name="paymentTerms"
                                    render={({ field }) => (
                                        <div className="relative">
                                            <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard
                                                        className="w-4 h-4 text-muted-foreground"
                                                        strokeWidth={1.5}
                                                    />
                                                    <span className="text-[10px] font-thin font-body">
                                                        {field.value ||
                                                            'SELECT PAYMENT TERMS'}
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
                                                    {PAYMENT_TERMS.map(
                                                        (term) => (
                                                            <SelectItem
                                                                key={term}
                                                                value={term}
                                                            >
                                                                <span className="text-[10px] font-normal font-body">
                                                                    {term}
                                                                </span>
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Standard payment terms for this client
                                </p>
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="discountPercentage"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Discount (%)
                                </Label>
                                <Input
                                    id="discountPercentage"
                                    type="number"
                                    min="0"
                                    max="100"
                                    {...register('discountPercentage', {
                                        valueAsNumber: true,
                                        min: 0,
                                        max: 100,
                                    })}
                                    placeholder="10"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.discountPercentage && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.discountPercentage.message}
                                    </p>
                                )}
                                <p className="text-[10px] text-muted-foreground">
                                    Discount percentage (0-100%)
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="preferredPaymentMethod"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Preferred Payment Method
                                </Label>
                                <Controller
                                    control={control}
                                    name="preferredPaymentMethod"
                                    render={({ field }) => (
                                        <div className="relative">
                                            <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard
                                                        className="w-4 h-4 text-muted-foreground"
                                                        strokeWidth={1.5}
                                                    />
                                                    <span className="uppercase text-[10px] font-thin font-body">
                                                        {field.value
                                                            ? field.value.replace(
                                                                  /_/g,
                                                                  ' ',
                                                              )
                                                            : 'SELECT PAYMENT METHOD'}
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
                                                        PaymentMethod,
                                                    ).map((method) => (
                                                        <SelectItem
                                                            key={method}
                                                            value={method}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <CreditCard
                                                                    className="w-4 h-4"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                />
                                                                <span className="uppercase text-[10px] font-thin font-body">
                                                                    {method.replace(
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
                                    htmlFor="priceTier"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Price Tier
                                </Label>
                                <Controller
                                    control={control}
                                    name="priceTier"
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
                                                            : 'SELECT PRICE TIER'}
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
                                                        PriceTier,
                                                    ).map((tier) => (
                                                        <SelectItem
                                                            key={tier}
                                                            value={tier}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Tag
                                                                    className="w-4 h-4"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                />
                                                                <span className="uppercase text-[10px] font-thin font-body">
                                                                    {tier.replace(
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

                {/* Tags & Categories */}
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
                        <div className="space-y-3">
                            <Label
                                htmlFor="tags"
                                className="block text-xs font-light uppercase font-body"
                            >
                                Tags
                            </Label>
                            <Controller
                                control={control}
                                name="tags"
                                render={({ field }) => (
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            {field.value?.map((tag, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="flex items-center gap-1 text-[10px] h-6 bg-card border border-border"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newTags = [
                                                                ...(field.value ||
                                                                    []),
                                                            ];
                                                            newTags.splice(
                                                                index,
                                                                1,
                                                            );
                                                            field.onChange(
                                                                newTags,
                                                            );
                                                        }}
                                                        className="ml-1 text-muted-foreground hover:text-foreground"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                id="tag-input"
                                                placeholder="Add tag and press Enter"
                                                className="font-light bg-card border-border placeholder:text-xs placeholder:font-body h-9"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const input =
                                                            e.currentTarget;
                                                        const tag =
                                                            input.value.trim();
                                                        if (
                                                            tag &&
                                                            (!field.value ||
                                                                !field.value.includes(
                                                                    tag,
                                                                ))
                                                        ) {
                                                            const newTags = [
                                                                ...(field.value ||
                                                                    []),
                                                                tag,
                                                            ];
                                                            field.onChange(
                                                                newTags,
                                                            );
                                                            input.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-9"
                                                onClick={() => {
                                                    const input =
                                                        document.getElementById(
                                                            'tag-input',
                                                        ) as HTMLInputElement;
                                                    const tag =
                                                        input.value.trim();
                                                    if (
                                                        tag &&
                                                        (!field.value ||
                                                            !field.value.includes(
                                                                tag,
                                                            ))
                                                    ) {
                                                        const newTags = [
                                                            ...(field.value ||
                                                                []),
                                                            tag,
                                                        ];
                                                        field.onChange(newTags);
                                                        input.value = '';
                                                    }
                                                }}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Add tags to categorize this client (e.g., VIP,
                                Regular, Bulk Buyer)
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Label
                                htmlFor="visibleCategories"
                                className="block text-xs font-light uppercase font-body"
                            >
                                Visible Product Categories
                            </Label>
                            <Controller
                                control={control}
                                name="visibleCategories"
                                render={({ field }) => (
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            {field.value?.map(
                                                (category, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="secondary"
                                                        className="flex items-center gap-1 text-[10px] h-6 bg-card border border-border"
                                                    >
                                                        {category}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newCategories =
                                                                    [
                                                                        ...(field.value ||
                                                                            []),
                                                                    ];
                                                                newCategories.splice(
                                                                    index,
                                                                    1,
                                                                );
                                                                field.onChange(
                                                                    newCategories,
                                                                );
                                                            }}
                                                            className="ml-1 text-muted-foreground hover:text-foreground"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </Badge>
                                                ),
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                id="category-input"
                                                placeholder="Add product category and press Enter"
                                                className="font-light bg-card border-border placeholder:text-xs placeholder:font-body h-9"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const input =
                                                            e.currentTarget;
                                                        const category =
                                                            input.value.trim();
                                                        if (
                                                            category &&
                                                            (!field.value ||
                                                                !field.value.includes(
                                                                    category,
                                                                ))
                                                        ) {
                                                            const newCategories =
                                                                [
                                                                    ...(field.value ||
                                                                        []),
                                                                    category,
                                                                ];
                                                            field.onChange(
                                                                newCategories,
                                                            );
                                                            input.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-9"
                                                onClick={() => {
                                                    const input =
                                                        document.getElementById(
                                                            'category-input',
                                                        ) as HTMLInputElement;
                                                    const category =
                                                        input.value.trim();
                                                    if (
                                                        category &&
                                                        (!field.value ||
                                                            !field.value.includes(
                                                                category,
                                                            ))
                                                    ) {
                                                        const newCategories = [
                                                            ...(field.value ||
                                                                []),
                                                            category,
                                                        ];
                                                        field.onChange(
                                                            newCategories,
                                                        );
                                                        input.value = '';
                                                    }
                                                }}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Product categories this client can access (e.g.,
                                Electronics, Software, Services)
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Customer Insights */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <Users className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Customer Insights
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                        min: 0,
                                        max: 10,
                                    })}
                                    placeholder="8.5"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.satisfactionScore && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.satisfactionScore.message}
                                    </p>
                                )}
                                <p className="text-[10px] text-muted-foreground">
                                    Overall customer satisfaction score
                                </p>
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
                                        min: -10,
                                        max: 10,
                                    })}
                                    placeholder="8"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.npsScore && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.npsScore.message}
                                    </p>
                                )}
                                <p className="text-[10px] text-muted-foreground">
                                    Net Promoter Score
                                </p>
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="acquisitionChannel"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Acquisition Channel
                                </Label>
                                <Controller
                                    control={control}
                                    name="acquisitionChannel"
                                    render={({ field }) => (
                                        <div className="relative">
                                            <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                <div className="flex items-center gap-2">
                                                    <Users
                                                        className="w-4 h-4 text-muted-foreground"
                                                        strokeWidth={1.5}
                                                    />
                                                    <span className="uppercase text-[10px] font-thin font-body">
                                                        {field.value
                                                            ? field.value.replace(
                                                                  /_/g,
                                                                  ' ',
                                                              )
                                                            : 'SELECT ACQUISITION CHANNEL'}
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
                                                        AcquisitionChannel,
                                                    ).map((channel) => (
                                                        <SelectItem
                                                            key={channel}
                                                            value={channel}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Users
                                                                    className="w-4 h-4"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                />
                                                                <span className="uppercase text-[10px] font-thin font-body">
                                                                    {channel.replace(
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
                                    htmlFor="acquisitionDate"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Acquisition Date
                                </Label>
                                <Controller
                                    control={control}
                                    name="acquisitionDate"
                                    render={({ field }) => {
                                        const [selectedTime, setSelectedTime] =
                                            useState<string>(
                                                field.value
                                                    ? format(
                                                          new Date(field.value),
                                                          'HH:mm',
                                                      )
                                                    : '12:00',
                                            );

                                        const updateDateWithTime = (
                                            date: Date | undefined,
                                            timeString: string,
                                        ) => {
                                            if (!date) return;

                                            const [hours, minutes] = timeString
                                                .split(':')
                                                .map(Number);
                                            const newDate = new Date(date);
                                            newDate.setHours(hours, minutes);
                                            field.onChange(newDate);
                                        };

                                        return (
                                            <div className="relative">
                                                <div className="flex space-x-2">
                                                    <div className="relative w-3/5">
                                                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                            <div className="flex items-center gap-2">
                                                                <CalendarIcon
                                                                    className="w-4 h-4 text-muted-foreground"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                />
                                                                <span className="text-[10px] font-thin font-body">
                                                                    {field.value
                                                                        ? format(
                                                                              new Date(
                                                                                  field.value,
                                                                              ),
                                                                              'MMM d, yyyy',
                                                                          )
                                                                        : 'SELECT DATE'}
                                                                </span>
                                                            </div>
                                                            <ChevronDown
                                                                className="w-4 h-4 ml-2 opacity-50"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                            />
                                                        </div>
                                                        <Popover>
                                                            <PopoverTrigger className="absolute top-0 left-0 w-full h-10 opacity-0 cursor-pointer" />
                                                            <PopoverContent className="w-auto p-0">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={
                                                                        field.value
                                                                            ? new Date(
                                                                                  field.value,
                                                                              )
                                                                            : undefined
                                                                    }
                                                                    onSelect={(
                                                                        date,
                                                                    ) => {
                                                                        if (
                                                                            date
                                                                        ) {
                                                                            updateDateWithTime(
                                                                                date,
                                                                                selectedTime,
                                                                            );
                                                                        } else {
                                                                            field.onChange(
                                                                                undefined,
                                                                            );
                                                                        }
                                                                    }}
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>

                                                    <div className="relative w-2/5">
                                                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                            <div className="flex items-center gap-2">
                                                                <Clock
                                                                    className="w-4 h-4 text-muted-foreground"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                />
                                                                <span className="text-[10px] font-thin font-body">
                                                                    {field.value
                                                                        ? format(
                                                                              new Date(
                                                                                  field.value,
                                                                              ),
                                                                              'h:mm a',
                                                                          )
                                                                        : 'TIME'}
                                                                </span>
                                                            </div>
                                                            <ChevronDown
                                                                className="w-4 h-4 ml-2 opacity-50"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                            />
                                                        </div>
                                                        <Popover>
                                                            <PopoverTrigger className="absolute top-0 left-0 w-full h-10 opacity-0 cursor-pointer" />
                                                            <PopoverContent className="w-auto p-3">
                                                                <div className="space-y-2">
                                                                    <div className="text-[10px] font-thin uppercase font-body">
                                                                        Time
                                                                    </div>
                                                                    <input
                                                                        type="time"
                                                                        className="w-full h-10 px-3 text-sm border rounded bg-card border-border"
                                                                        value={
                                                                            selectedTime
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) => {
                                                                            const newTime =
                                                                                e
                                                                                    .target
                                                                                    .value;
                                                                            setSelectedTime(
                                                                                newTime,
                                                                            );
                                                                            if (
                                                                                field.value
                                                                            ) {
                                                                                updateDateWithTime(
                                                                                    new Date(
                                                                                        field.value,
                                                                                    ),
                                                                                    newTime,
                                                                                );
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                                {errors.acquisitionDate && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {
                                            errors.acquisitionDate
                                                .message as string
                                        }
                                    </p>
                                )}
                                <p className="text-[10px] text-muted-foreground">
                                    Date when client was acquired
                                </p>
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="riskLevel"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Risk Level
                                </Label>
                                <Controller
                                    control={control}
                                    name="riskLevel"
                                    render={({ field }) => (
                                        <div className="relative">
                                            <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle
                                                        className="w-4 h-4 text-muted-foreground"
                                                        strokeWidth={1.5}
                                                    />
                                                    <span className="uppercase text-[10px] font-thin font-body">
                                                        {field.value
                                                            ? field.value.replace(
                                                                  /_/g,
                                                                  ' ',
                                                              )
                                                            : 'SELECT RISK LEVEL'}
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
                                                        ClientRiskLevel,
                                                    ).map((level) => (
                                                        <SelectItem
                                                            key={level}
                                                            value={level}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <AlertTriangle
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
                                {errors.lifetimeValue && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.lifetimeValue.message}
                                    </p>
                                )}
                                <p className="text-[10px] text-muted-foreground">
                                    Total value of the client relationship
                                </p>
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
                                {errors.annualRevenue && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.annualRevenue.message}
                                    </p>
                                )}
                                <p className="text-[10px] text-muted-foreground">
                                    Client's annual revenue
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Preferences & Dates */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <CalendarIcon
                                className="w-4 h-4"
                                strokeWidth={1.5}
                            />
                            <span className="font-light uppercase font-body">
                                Contact Preferences & Important Dates
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
                                    control={control}
                                    name="preferredContactMethod"
                                    render={({ field }) => (
                                        <div className="relative">
                                            <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                <div className="flex items-center gap-2">
                                                    <Mail
                                                        className="w-4 h-4 text-muted-foreground"
                                                        strokeWidth={1.5}
                                                    />
                                                    <span className="uppercase text-[10px] font-thin font-body">
                                                        {field.value
                                                            ? field.value.replace(
                                                                  /_/g,
                                                                  ' ',
                                                              )
                                                            : 'SELECT CONTACT METHOD'}
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
                                                        ClientContactPreference,
                                                    ).map((method) => (
                                                        <SelectItem
                                                            key={method}
                                                            value={method}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Mail
                                                                    className="w-4 h-4"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                />
                                                                <span className="uppercase text-[10px] font-thin font-body">
                                                                    {method.replace(
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
                                    htmlFor="preferredLanguage"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Preferred Language
                                </Label>
                                <Controller
                                    control={control}
                                    name="preferredLanguage"
                                    render={({ field }) => (
                                        <div className="relative">
                                            <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                <div className="flex items-center gap-2">
                                                    <Globe
                                                        className="w-4 h-4 text-muted-foreground"
                                                        strokeWidth={1.5}
                                                    />
                                                    <span className="uppercase text-[10px] font-thin font-body">
                                                        {field.value
                                                            ? field.value.replace(
                                                                  /_/g,
                                                                  ' ',
                                                              )
                                                            : 'SELECT LANGUAGE'}
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
                                                        ClientLanguage,
                                                    ).map((language) => (
                                                        <SelectItem
                                                            key={language}
                                                            value={language}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Globe
                                                                    className="w-4 h-4"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                />
                                                                <span className="uppercase text-[10px] font-thin font-body">
                                                                    {language.replace(
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
                                    htmlFor="anniversaryDate"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Anniversary Date
                                </Label>
                                <Controller
                                    control={control}
                                    name="anniversaryDate"
                                    render={({ field }) => {
                                        const [selectedTime, setSelectedTime] =
                                            useState<string>(
                                                field.value
                                                    ? format(
                                                          new Date(field.value),
                                                          'HH:mm',
                                                      )
                                                    : '12:00',
                                            );

                                        const updateDateWithTime = (
                                            date: Date | undefined,
                                            timeString: string,
                                        ) => {
                                            if (!date) return;

                                            const [hours, minutes] = timeString
                                                .split(':')
                                                .map(Number);
                                            const newDate = new Date(date);
                                            newDate.setHours(hours, minutes);
                                            field.onChange(newDate);
                                        };

                                        return (
                                            <div className="relative">
                                                <div className="flex space-x-2">
                                                    <div className="relative w-3/5">
                                                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                            <div className="flex items-center gap-2">
                                                                <CalendarIcon
                                                                    className="w-4 h-4 text-muted-foreground"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                />
                                                                <span className="text-[10px] font-thin font-body">
                                                                    {field.value
                                                                        ? format(
                                                                              new Date(
                                                                                  field.value,
                                                                              ),
                                                                              'MMM d, yyyy',
                                                                          )
                                                                        : 'SELECT DATE'}
                                                                </span>
                                                            </div>
                                                            <ChevronDown
                                                                className="w-4 h-4 ml-2 opacity-50"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                            />
                                                        </div>
                                                        <Popover>
                                                            <PopoverTrigger className="absolute top-0 left-0 w-full h-10 opacity-0 cursor-pointer" />
                                                            <PopoverContent className="w-auto p-0">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={
                                                                        field.value
                                                                            ? new Date(
                                                                                  field.value,
                                                                              )
                                                                            : undefined
                                                                    }
                                                                    onSelect={(
                                                                        date,
                                                                    ) => {
                                                                        if (
                                                                            date
                                                                        ) {
                                                                            updateDateWithTime(
                                                                                date,
                                                                                selectedTime,
                                                                            );
                                                                        } else {
                                                                            field.onChange(
                                                                                undefined,
                                                                            );
                                                                        }
                                                                    }}
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>

                                                    <div className="relative w-2/5">
                                                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                            <div className="flex items-center gap-2">
                                                                <Clock
                                                                    className="w-4 h-4 text-muted-foreground"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                />
                                                                <span className="text-[10px] font-thin font-body">
                                                                    {field.value
                                                                        ? format(
                                                                              new Date(
                                                                                  field.value,
                                                                              ),
                                                                              'h:mm a',
                                                                          )
                                                                        : 'TIME'}
                                                                </span>
                                                            </div>
                                                            <ChevronDown
                                                                className="w-4 h-4 ml-2 opacity-50"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                            />
                                                        </div>
                                                        <Popover>
                                                            <PopoverTrigger className="absolute top-0 left-0 w-full h-10 opacity-0 cursor-pointer" />
                                                            <PopoverContent className="w-auto p-3">
                                                                <div className="space-y-2">
                                                                    <div className="text-[10px] font-thin uppercase font-body">
                                                                        Time
                                                                    </div>
                                                                    <input
                                                                        type="time"
                                                                        className="w-full h-10 px-3 text-sm border rounded bg-card border-border"
                                                                        value={
                                                                            selectedTime
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) => {
                                                                            const newTime =
                                                                                e
                                                                                    .target
                                                                                    .value;
                                                                            setSelectedTime(
                                                                                newTime,
                                                                            );
                                                                            if (
                                                                                field.value
                                                                            ) {
                                                                                updateDateWithTime(
                                                                                    new Date(
                                                                                        field.value,
                                                                                    ),
                                                                                    newTime,
                                                                                );
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                                {errors.anniversaryDate && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.anniversaryDate.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="birthday"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Birthday
                                </Label>
                                <Controller
                                    control={control}
                                    name="birthday"
                                    render={({ field }) => {
                                        const [selectedTime, setSelectedTime] =
                                            useState<string>(
                                                field.value
                                                    ? format(
                                                          new Date(field.value),
                                                          'HH:mm',
                                                      )
                                                    : '12:00',
                                            );

                                        const updateDateWithTime = (
                                            date: Date | undefined,
                                            timeString: string,
                                        ) => {
                                            if (!date) return;

                                            const [hours, minutes] = timeString
                                                .split(':')
                                                .map(Number);
                                            const newDate = new Date(date);
                                            newDate.setHours(hours, minutes);
                                            field.onChange(newDate);
                                        };

                                        return (
                                            <div className="relative">
                                                <div className="flex space-x-2">
                                                    <div className="relative w-3/5">
                                                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                            <div className="flex items-center gap-2">
                                                                <CalendarIcon
                                                                    className="w-4 h-4 text-muted-foreground"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                />
                                                                <span className="text-[10px] font-thin font-body">
                                                                    {field.value
                                                                        ? format(
                                                                              new Date(
                                                                                  field.value,
                                                                              ),
                                                                              'MMM d, yyyy',
                                                                          )
                                                                        : 'SELECT DATE'}
                                                                </span>
                                                            </div>
                                                            <ChevronDown
                                                                className="w-4 h-4 ml-2 opacity-50"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                            />
                                                        </div>
                                                        <Popover>
                                                            <PopoverTrigger className="absolute top-0 left-0 w-full h-10 opacity-0 cursor-pointer" />
                                                            <PopoverContent className="w-auto p-0">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={
                                                                        field.value
                                                                            ? new Date(
                                                                                  field.value,
                                                                              )
                                                                            : undefined
                                                                    }
                                                                    onSelect={(
                                                                        date,
                                                                    ) => {
                                                                        if (
                                                                            date
                                                                        ) {
                                                                            updateDateWithTime(
                                                                                date,
                                                                                selectedTime,
                                                                            );
                                                                        } else {
                                                                            field.onChange(
                                                                                undefined,
                                                                            );
                                                                        }
                                                                    }}
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>

                                                    <div className="relative w-2/5">
                                                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                            <div className="flex items-center gap-2">
                                                                <Clock
                                                                    className="w-4 h-4 text-muted-foreground"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                />
                                                                <span className="text-[10px] font-thin font-body">
                                                                    {field.value
                                                                        ? format(
                                                                              new Date(
                                                                                  field.value,
                                                                              ),
                                                                              'h:mm a',
                                                                          )
                                                                        : ' TIME'}
                                                                </span>
                                                            </div>
                                                            <ChevronDown
                                                                className="w-4 h-4 ml-2 opacity-50"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                            />
                                                        </div>
                                                        <Popover>
                                                            <PopoverTrigger className="absolute top-0 left-0 w-full h-10 opacity-0 cursor-pointer" />
                                                            <PopoverContent className="w-auto p-3">
                                                                <div className="space-y-2">
                                                                    <div className="text-[10px] font-thin uppercase font-body">
                                                                        Time
                                                                    </div>
                                                                    <input
                                                                        type="time"
                                                                        className="w-full h-10 px-3 text-sm border rounded bg-card border-border"
                                                                        value={
                                                                            selectedTime
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) => {
                                                                            const newTime =
                                                                                e
                                                                                    .target
                                                                                    .value;
                                                                            setSelectedTime(
                                                                                newTime,
                                                                            );
                                                                            if (
                                                                                field.value
                                                                            ) {
                                                                                updateDateWithTime(
                                                                                    new Date(
                                                                                        field.value,
                                                                                    ),
                                                                                    newTime,
                                                                                );
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                                {errors.birthday && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.birthday.message as string}
                                    </p>
                                )}
                                <p className="text-[10px] text-muted-foreground">
                                    For sending special offers and greetings
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Social Media Profiles */}
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
                                    LinkedIn
                                </Label>
                                <Input
                                    id="socialProfiles.linkedin"
                                    {...register('socialProfiles.linkedin')}
                                    placeholder="https://www.linkedin.com/company/acme"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.socialProfiles?.linkedin && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {
                                            errors.socialProfiles.linkedin
                                                .message as string
                                        }
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="socialProfiles.twitter"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Twitter/X
                                </Label>
                                <Input
                                    id="socialProfiles.twitter"
                                    {...register('socialProfiles.twitter')}
                                    placeholder="https://twitter.com/acme"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.socialProfiles?.twitter && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {
                                            errors.socialProfiles.twitter
                                                .message as string
                                        }
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="socialProfiles.facebook"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Facebook
                                </Label>
                                <Input
                                    id="socialProfiles.facebook"
                                    {...register('socialProfiles.facebook')}
                                    placeholder="https://www.facebook.com/acme"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.socialProfiles?.facebook && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {
                                            errors.socialProfiles.facebook
                                                .message as string
                                        }
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="socialProfiles.instagram"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Instagram
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
                                                .message as string
                                        }
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Geofencing */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <MapPin className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Geofencing Settings
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="enableGeofence"
                                        className="text-xs font-light uppercase font-body"
                                    >
                                        Enable Geofencing
                                    </Label>
                                    <Controller
                                        control={control}
                                        name="enableGeofence"
                                        render={({ field }) => (
                                            <Switch
                                                id="enableGeofence"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Track and notify when users are near this
                                    client's location
                                </p>
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="geofenceType"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Geofence Type
                                </Label>
                                <Controller
                                    control={control}
                                    name="geofenceType"
                                    render={({ field }) => (
                                        <div className="relative">
                                            <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                <div className="flex items-center gap-2">
                                                    <MapPin
                                                        className="w-4 h-4 text-muted-foreground"
                                                        strokeWidth={1.5}
                                                    />
                                                    <span className="uppercase text-[10px] font-thin font-body">
                                                        {field.value
                                                            ? field.value.replace(
                                                                  /_/g,
                                                                  ' ',
                                                              )
                                                            : 'SELECT GEOFENCE TYPE'}
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
                                                        GeofenceType,
                                                    ).map((type) => (
                                                        <SelectItem
                                                            key={type}
                                                            value={type}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <MapPin
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
                                    htmlFor="geofenceRadius"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Geofence Radius (m)
                                </Label>
                                <Input
                                    id="geofenceRadius"
                                    type="number"
                                    min="100"
                                    max="5000"
                                    {...register('geofenceRadius', {
                                        valueAsNumber: true,
                                        min: 100,
                                        max: 5000,
                                    })}
                                    placeholder="500"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.geofenceRadius && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.geofenceRadius.message}
                                    </p>
                                )}
                                <p className="text-[10px] text-muted-foreground">
                                    Radius in meters (100-5000)
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
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
                                        step="0.0000001"
                                        {...register('latitude', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="51.5074"
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
                                        step="0.0000001"
                                        {...register('longitude', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="-0.1278"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.longitude && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.longitude.message}
                                        </p>
                                    )}
                                </div>
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
