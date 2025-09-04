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
    CommunicationType,
    CommunicationFrequency,
} from '@/lib/types/client-enums';
import { ClientStatus } from '@/hooks/use-clients-query';
import { useAuthStore, selectProfileData } from '@/store/auth-store';
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

// Form schema definition with improved validation to match server DTOs
export const clientFormSchema = z.object({
    name: z.string()
        .min(2, { message: 'Client name must be at least 2 characters' })
        .max(100, { message: 'Client name must not exceed 100 characters' }),
    contactPerson: z
        .string()
        .min(2, { message: 'Contact person name must be at least 2 characters' })
        .max(100, { message: 'Contact person name must not exceed 100 characters' }),
    email: z.string()
        .email({ message: 'Please provide a valid email address' })
        .transform(val => val.toLowerCase().trim()),
    // Phone validation - South African phone numbers with +27 country code
    phone: z.string()
        .regex(/^\+27\s?\d{2}\s?\d{3}\s?\d{4}$/, {
            message: 'Please provide a valid South African phone number with country code (+27)'
        }),
    alternativePhone: z.string()
        .regex(/^\+27\s?\d{2}\s?\d{3}\s?\d{4}$/, {
            message: 'Alternative phone number must be a valid South African phone number with country code (+27)'
        })
        .optional()
        .or(z.literal('')),
    // Website validation - must include protocol
    website: z
        .string()
        .url({ message: 'Website must be a valid URL with protocol (http/https)' })
        .optional()
        .or(z.literal('')),
    logo: z.string()
        .url({ message: 'Logo URL must be a valid URL with protocol (http/https)' })
        .optional()
        .or(z.literal('')),
    description: z.string()
        .max(1000, { message: 'Description must not exceed 1000 characters' })
        .optional(),
    address: z.object({
        street: z.string()
            .min(5, { message: 'Street address must be at least 5 characters' })
            .max(200, { message: 'Street address must not exceed 200 characters' }),
        suburb: z.string()
            .min(2, { message: 'Suburb must be at least 2 characters' })
            .max(100, { message: 'Suburb must not exceed 100 characters' }),
        city: z.string()
            .min(2, { message: 'City must be at least 2 characters' })
            .max(100, { message: 'City must not exceed 100 characters' }),
        state: z.string()
            .min(2, { message: 'State/Province must be at least 2 characters' })
            .max(100, { message: 'State/Province must not exceed 100 characters' }),
        country: z.string()
            .min(2, { message: 'Country must be at least 2 characters' })
            .max(100, { message: 'Country must not exceed 100 characters' }),
        postalCode: z.string()
            .regex(/^[0-9]{4}$/, { message: 'South African postal code must be 4 digits' }),
    }),
    category: z.string()
        .min(2, { message: 'Category must be at least 2 characters' })
        .max(50, { message: 'Category must not exceed 50 characters' })
        .optional(),
    type: z.nativeEnum(ClientType).default(ClientType.STANDARD),
    // Using ClientStatus from the frontend which maps to the backend enum names correctly
    status: z.nativeEnum(ClientStatus).default(ClientStatus.ACTIVE),
    ref: z.string(),
    assignedSalesRep: z
        .object({
            uid: z.number(),
        })
        .optional(),
    // Financial Information - all optional with proper validation
    creditLimit: z.union([
        z.number().positive({ message: 'Credit limit must be a positive number' }),
        z.literal('')
    ]).transform(v => v === '' ? undefined : v).optional(),
    outstandingBalance: z.union([
        z.number().min(0, { message: 'Outstanding balance cannot be negative' }),
        z.literal('')
    ]).transform(v => v === '' ? undefined : v).optional(),
    priceTier: z.nativeEnum(PriceTier).optional(),
    discountPercentage: z.union([z.number().min(0).max(100), z.literal('')]).transform(v => v === '' ? undefined : v).optional(),
    paymentTerms: z.string().optional(),
    lifetimeValue: z.any().optional(),
    preferredPaymentMethod: z.nativeEnum(PaymentMethod).optional(),
    // Contact preferences and dates - all optional
    preferredContactMethod: z
        .nativeEnum(ClientContactPreference)
        .optional(),
    preferredLanguage: z.string().optional(),
    lastVisitDate: z.date().optional(),
    nextContactDate: z.date().optional(),
    birthday: z.date().optional(),
    anniversaryDate: z.date().optional(),
    // Business information - all optional
    industry: z.string().optional(),
    companySize: z.any().optional(),
    annualRevenue: z.any().optional(),
    // Customer insights - all optional
    acquisitionChannel: z.nativeEnum(AcquisitionChannel).optional().catch(undefined),
    acquisitionDate: z.date().optional().catch(undefined),
    riskLevel: z
        .nativeEnum(ClientRiskLevel)
        .optional()
        .catch(undefined),
    satisfactionScore: z.any().optional(),
    npsScore: z.any().optional(),
    // Categorization and geofencing - all optional
    tags: z.array(z.string()).optional(),
    visibleCategories: z.array(z.string()).optional(),
    customFields: z.record(z.string(), z.any()).optional(),
    socialProfiles: z
        .object({
            linkedin: z.string()
                .url({ message: 'LinkedIn URL must be a valid URL with protocol (http/https)' })
                .optional()
                .or(z.literal('')),
            twitter: z.string()
                .url({ message: 'Twitter URL must be a valid URL with protocol (http/https)' })
                .optional()
                .or(z.literal('')),
            facebook: z.string()
                .url({ message: 'Facebook URL must be a valid URL with protocol (http/https)' })
                .optional()
                .or(z.literal('')),
            instagram: z.string()
                .url({ message: 'Instagram URL must be a valid URL with protocol (http/https)' })
                .optional()
                .or(z.literal('')),
        })
        .optional(),
    geofenceType: z
        .nativeEnum(GeofenceType)
        .optional()
        .catch(undefined),
    geofenceRadius: z.union([
        z.number().min(100).max(5000),
        z.literal('')
    ]).transform(v => v === '' ? undefined : v).optional(),
    enableGeofence: z.boolean().optional(),
    latitude: z.union([
        z.number().min(-90).max(90),
        z.literal('')
    ]).transform(v => v === '' ? undefined : v).optional(),
    longitude: z.union([
        z.number().min(-180).max(180),
        z.literal('')
    ]).transform(v => v === '' ? undefined : v).optional(),
    // Communication preferences - simplified structure
    communicationSchedules: z
        .array(
            z.object({
                uid: z.number().optional(), // For existing schedules
                communicationType: z.nativeEnum(CommunicationType).optional(),
                frequency: z.nativeEnum(CommunicationFrequency).optional(),
                customFrequencyDays: z.number().min(1).max(365).optional(),
                preferredTime: z.string().optional(), // Format: "HH:MM"
                preferredDays: z.array(z.number().min(0).max(6)).optional(), // 0=Sunday, 6=Saturday
                nextScheduledDate: z.date().optional(),
                isActive: z.boolean().default(true),
                notes: z.string().optional(),
                assignedToUserId: z.number().optional(),
                metadata: z.record(z.string(), z.any()).optional(),
            }),
        )
        .optional()
        .default([{}]), // Default with one empty object
    
    // User Target Fields - optional section for managing user targets and costs
    userTargets: z.object({
        // Target amounts
        targetSalesAmount: z.union([
            z.number().min(0, { message: 'Target sales amount must be positive' }),
            z.literal('')
        ]).transform(v => v === '' ? undefined : v).optional(),
        currentSalesAmount: z.union([
            z.number().min(0, { message: 'Current sales amount must be positive' }),
            z.literal('')
        ]).transform(v => v === '' ? undefined : v).optional(),
        targetQuotationsAmount: z.union([
            z.number().min(0, { message: 'Target quotations amount must be positive' }),
            z.literal('')
        ]).transform(v => v === '' ? undefined : v).optional(),
        currentQuotationsAmount: z.union([
            z.number().min(0, { message: 'Current quotations amount must be positive' }),
            z.literal('')
        ]).transform(v => v === '' ? undefined : v).optional(),
        currentOrdersAmount: z.union([
            z.number().min(0, { message: 'Current orders amount must be positive' }),
            z.literal('')
        ]).transform(v => v === '' ? undefined : v).optional(),
        
        // Target counts
        targetHoursWorked: z.union([
            z.number().min(0, { message: 'Target hours worked must be positive' }),
            z.literal('')
        ]).transform(v => v === '' ? undefined : v).optional(),
        currentHoursWorked: z.union([
            z.number().min(0, { message: 'Current hours worked must be positive' }),
            z.literal('')
        ]).transform(v => v === '' ? undefined : v).optional(),
        targetNewClients: z.union([
            z.number().min(0, { message: 'Target new clients must be positive' }),
            z.literal('')
        ]).transform(v => v === '' ? undefined : v).optional(),
        currentNewClients: z.union([
            z.number().min(0, { message: 'Current new clients must be positive' }),
            z.literal('')
        ]).transform(v => v === '' ? undefined : v).optional(),
        targetNewLeads: z.union([
            z.number().min(0, { message: 'Target new leads must be positive' }),
            z.literal('')
        ]).transform(v => v === '' ? undefined : v).optional(),
        currentNewLeads: z.union([
            z.number().min(0, { message: 'Current new leads must be positive' }),
            z.literal('')
        ]).transform(v => v === '' ? undefined : v).optional(),
        targetCheckIns: z.union([
            z.number().min(0, { message: 'Target check-ins must be positive' }),
            z.literal('')
        ]).transform(v => v === '' ? undefined : v).optional(),
        currentCheckIns: z.union([
            z.number().min(0, { message: 'Current check-ins must be positive' }),
            z.literal('')
        ]).transform(v => v === '' ? undefined : v).optional(),
        targetCalls: z.union([
            z.number().min(0, { message: 'Target calls must be positive' }),
            z.literal('')
        ]).transform(v => v === '' ? undefined : v).optional(),
        currentCalls: z.union([
            z.number().min(0, { message: 'Current calls must be positive' }),
            z.literal('')
        ]).transform(v => v === '' ? undefined : v).optional(),

        // Financial fields - salary and costs
        baseSalary: z.union([
            z.number().min(0, { message: 'Base salary must be positive' }),
            z.literal('')
        ]).transform(v => v === '' ? undefined : v).optional(),
        carInstalment: z.union([
            z.number().min(0, { message: 'Car instalment must be positive' }),
            z.literal('')
        ]).transform(v => v === '' ? undefined : v).optional(),
        carInsurance: z.union([
            z.number().min(0, { message: 'Car insurance must be positive' }),
            z.literal('')
        ]).transform(v => v === '' ? undefined : v).optional(),
        fuel: z.union([
            z.number().min(0, { message: 'Fuel cost must be positive' }),
            z.literal('')
        ]).transform(v => v === '' ? undefined : v).optional(),
        cellPhoneAllowance: z.union([
            z.number().min(0, { message: 'Cell phone allowance must be positive' }),
            z.literal('')
        ]).transform(v => v === '' ? undefined : v).optional(),
        carMaintenance: z.union([
            z.number().min(0, { message: 'Car maintenance must be positive' }),
            z.literal('')
        ]).transform(v => v === '' ? undefined : v).optional(),
        cgicCosts: z.union([
            z.number().min(0, { message: 'CGIC costs must be positive' }),
            z.literal('')
        ]).transform(v => v === '' ? undefined : v).optional(),
        totalCost: z.union([
            z.number().min(0, { message: 'Total cost must be positive' }),
            z.literal('')
        ]).transform(v => v === '' ? undefined : v).optional(),

        // Period and currency settings
        targetCurrency: z.string()
            .optional()
            .default('ZAR'),
        targetPeriod: z.string()
            .optional(),
        periodStartDate: z.date().optional(),
        periodEndDate: z.date().optional(),
    }).optional(),
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
        phone: '+27 ',
        alternativePhone: '',
        website: '',
        logo: '',
        description: '',
        address: {
            street: '',
            suburb: '',
            city: '',
            state: 'Gauteng',
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
        communicationSchedules: [{ isActive: true }], // Single empty object for communication preferences
        userTargets: {
            targetSalesAmount: undefined,
            currentSalesAmount: undefined,
            targetQuotationsAmount: undefined,
            currentQuotationsAmount: undefined,
            currentOrdersAmount: undefined,
            targetHoursWorked: undefined,
            currentHoursWorked: undefined,
            targetNewClients: undefined,
            currentNewClients: undefined,
            targetNewLeads: undefined,
            currentNewLeads: undefined,
            targetCheckIns: undefined,
            currentCheckIns: undefined,
            targetCalls: undefined,
            currentCalls: undefined,
            baseSalary: undefined,
            carInstalment: undefined,
            carInsurance: undefined,
            fuel: undefined,
            cellPhoneAllowance: undefined,
            carMaintenance: undefined,
            cgicCosts: undefined,
            totalCost: undefined,
            targetCurrency: 'ZAR',
            targetPeriod: 'Monthly',
            periodStartDate: undefined,
            periodEndDate: undefined,
        },
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

            // Prepare client data for API submission
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

            // Create type-compatible client data for onSubmit (with Date objects)
            const clientData: ClientFormValues = {
                ...data,
                logo: logoUrl,
                ref: data.ref || generateClientRef(),
                // Other fields remain unchanged
            };

            // Submit the data to the parent component with API-formatted data
            // This allows the parent component to directly use the properly formatted data for the API
            await onSubmit(apiClientData as any as ClientFormValues);

            // Reset form after successful submission
            showSuccessToast('Client created successfully', toast);
            reset(defaultValues);
            setLogoImage(null);
            setSelectedFile(null);
        } catch (error) {
            console.error('Error submitting client form:', error);
            showErrorToast(
                'Failed to create client. Please check required fields and try again.',
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
            className="space-y-6 bg-card"
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
                        <CardTitle className="flex gap-2 items-center text-sm font-medium">
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
                                    className="absolute right-0 bottom-0 p-1 rounded-full cursor-pointer bg-primary hover:bg-primary/80"
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
                        <CardTitle className="flex gap-2 items-center text-sm font-medium">
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
                                        className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground"
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
                                        className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground"
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
                                        className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground"
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
                                        className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground"
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
                                        className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground"
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
                        <CardTitle className="flex gap-2 items-center text-sm font-medium">
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
                                    className={`font-light bg-card border-border placeholder:text-xs placeholder:font-body ${
                                        errors.address?.suburb
                                            ? 'border-red-500 focus:ring-red-500'
                                            : ''
                                    }`}
                                    aria-required="true"
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
                                    className={`font-light bg-card border-border placeholder:text-xs placeholder:font-body ${
                                        errors.address?.city
                                            ? 'border-red-500 focus:ring-red-500'
                                            : ''
                                    }`}
                                    aria-required="true"
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
                                    className={`font-light bg-card border-border placeholder:text-xs placeholder:font-body ${
                                        errors.address?.state
                                            ? 'border-red-500 focus:ring-red-500'
                                            : ''
                                    }`}
                                    aria-required="true"
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
                                            <div
                                                className={`flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card ${
                                                    errors.address?.country
                                                        ? 'border-red-500 focus:ring-red-500'
                                                        : 'border-border'
                                                }`}
                                            >
                                                <div className="flex gap-2 items-center">
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
                                    className={`font-light bg-card border-border placeholder:text-xs placeholder:font-body ${
                                        errors.address?.postalCode
                                            ? 'border-red-500 focus:ring-red-500'
                                            : ''
                                    }`}
                                    aria-required="true"
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
                        <CardTitle className="flex gap-2 items-center text-sm font-medium">
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
                                            <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                <div className="flex gap-2 items-center">
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
                                                        ClientType,
                                                    ).map((type) => (
                                                        <SelectItem
                                                            key={type}
                                                            value={type}
                                                        >
                                                            <div className="flex gap-2 items-center">
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
                                            <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                <div className="flex gap-2 items-center">
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
                                                    className="ml-2 w-4 h-4 opacity-50"
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
                                                                <div className="flex gap-2 items-center">
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
                                            <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                <div className="flex gap-2 items-center">
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
                                                        ClientType,
                                                    ).map((type) => (
                                                        <SelectItem
                                                            key={type}
                                                            value={type}
                                                        >
                                                            <div className="flex gap-2 items-center">
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
                                                        ClientStatus,
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
                                            <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                <div className="flex gap-2 items-center">
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
                                            <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                <div className="flex gap-2 items-center">
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
                                                        PaymentMethod,
                                                    ).map((method) => (
                                                        <SelectItem
                                                            key={method}
                                                            value={method}
                                                        >
                                                            <div className="flex gap-2 items-center">
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
                                            <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                <div className="flex gap-2 items-center">
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
                                                        PriceTier,
                                                    ).map((tier) => (
                                                        <SelectItem
                                                            key={tier}
                                                            value={tier}
                                                        >
                                                            <div className="flex gap-2 items-center">
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
                        <CardTitle className="flex gap-2 items-center text-sm font-medium">
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
                                                    <Button
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
                                                        className="p-0 ml-1 h-auto bg-transparent text-muted-foreground hover:text-foreground hover:bg-transparent"
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                id="tag-input"
                                                placeholder="Add tag and press Enter"
                                                className="h-9 font-light bg-card border-border placeholder:text-xs placeholder:font-body"
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
                                                className="h-9 font-light bg-card border-border placeholder:text-xs placeholder:font-body"
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
                        <CardTitle className="flex gap-2 items-center text-sm font-medium">
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
                                        {typeof errors.npsScore.message === 'string' ? errors.npsScore.message : 'Invalid NPS score'}
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
                                            <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                <div className="flex gap-2 items-center">
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
                                                        AcquisitionChannel,
                                                    ).map((channel) => (
                                                        <SelectItem
                                                            key={channel}
                                                            value={channel}
                                                        >
                                                            <div className="flex gap-2 items-center">
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
                                                        <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                            <div className="flex gap-2 items-center">
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
                                                                className="ml-2 w-4 h-4 opacity-50"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                            />
                                                        </div>
                                                        <Popover>
                                                            <PopoverTrigger className="absolute top-0 left-0 w-full h-10 opacity-0 cursor-pointer" />
                                                            <PopoverContent className="p-0 w-auto">
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
                                                        <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                            <div className="flex gap-2 items-center">
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
                                                                className="ml-2 w-4 h-4 opacity-50"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                            />
                                                        </div>
                                                        <Popover>
                                                            <PopoverTrigger className="absolute top-0 left-0 w-full h-10 opacity-0 cursor-pointer" />
                                                            <PopoverContent className="p-3 w-auto">
                                                                <div className="space-y-2">
                                                                    <div className="text-[10px] font-thin uppercase font-body">
                                                                        Time
                                                                    </div>
                                                                    <input
                                                                        type="time"
                                                                        className="px-3 w-full h-10 text-sm rounded border bg-card border-border"
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
                                            <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                <div className="flex gap-2 items-center">
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
                                                        ClientRiskLevel,
                                                    ).map((level) => (
                                                        <SelectItem
                                                            key={level}
                                                            value={level}
                                                        >
                                                            <div className="flex gap-2 items-center">
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
                                        {typeof errors.lifetimeValue.message === 'string' ? errors.lifetimeValue.message : 'Invalid value'}
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
                                        {typeof errors.annualRevenue.message === 'string' ? errors.annualRevenue.message : 'Invalid value'}
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
                        <CardTitle className="flex gap-2 items-center text-sm font-medium">
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
                                            <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                <div className="flex gap-2 items-center">
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
                                                        ClientContactPreference,
                                                    ).map((method) => (
                                                        <SelectItem
                                                            key={method}
                                                            value={method}
                                                        >
                                                            <div className="flex gap-2 items-center">
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
                                            <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                <div className="flex gap-2 items-center">
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
                                                        ClientLanguage,
                                                    ).map((language) => (
                                                        <SelectItem
                                                            key={language}
                                                            value={language}
                                                        >
                                                            <div className="flex gap-2 items-center">
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
                                                        <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                            <div className="flex gap-2 items-center">
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
                                                                className="ml-2 w-4 h-4 opacity-50"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                            />
                                                        </div>
                                                        <Popover>
                                                            <PopoverTrigger className="absolute top-0 left-0 w-full h-10 opacity-0 cursor-pointer" />
                                                            <PopoverContent className="p-0 w-auto">
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
                                                        <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                            <div className="flex gap-2 items-center">
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
                                                                className="ml-2 w-4 h-4 opacity-50"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                            />
                                                        </div>
                                                        <Popover>
                                                            <PopoverTrigger className="absolute top-0 left-0 w-full h-10 opacity-0 cursor-pointer" />
                                                            <PopoverContent className="p-3 w-auto">
                                                                <div className="space-y-2">
                                                                    <div className="text-[10px] font-thin uppercase font-body">
                                                                        Time
                                                                    </div>
                                                                    <input
                                                                        type="time"
                                                                        className="px-3 w-full h-10 text-sm rounded border bg-card border-border"
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
                                                        <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                            <div className="flex gap-2 items-center">
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
                                                                className="ml-2 w-4 h-4 opacity-50"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                            />
                                                        </div>
                                                        <Popover>
                                                            <PopoverTrigger className="absolute top-0 left-0 w-full h-10 opacity-0 cursor-pointer" />
                                                            <PopoverContent className="p-0 w-auto">
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
                                                        <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                            <div className="flex gap-2 items-center">
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
                                                                className="ml-2 w-4 h-4 opacity-50"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                            />
                                                        </div>
                                                        <Popover>
                                                            <PopoverTrigger className="absolute top-0 left-0 w-full h-10 opacity-0 cursor-pointer" />
                                                            <PopoverContent className="p-3 w-auto">
                                                                <div className="space-y-2">
                                                                    <div className="text-[10px] font-thin uppercase font-body">
                                                                        Time
                                                                    </div>
                                                                    <input
                                                                        type="time"
                                                                        className="px-3 w-full h-10 text-sm rounded border bg-card border-border"
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
                        <CardTitle className="flex gap-2 items-center text-sm font-medium">
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

                {/* Communication Preferences */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex gap-2 items-center text-sm font-medium">
                            <Clock className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Communication Preferences
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="primaryCommunicationType"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Primary Communication Type
                                </Label>
                                <Controller
                                    control={control}
                                    name="communicationSchedules.0.communicationType"
                                    render={({ field }) => (
                                        <div className="relative">
                                            <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                <div className="flex gap-2 items-center">
                                                    <Mail
                                                        className="w-4 h-4 text-muted-foreground"
                                                        strokeWidth={1.5}
                                                    />
                                                    <span className="uppercase text-[10px] font-thin font-body">
                                                        {field.value
                                                            ? field.value.replace('_', ' ')
                                                            : 'SELECT COMMUNICATION TYPE'}
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
                                                    <SelectItem value={CommunicationType.PHONE_CALL}>
                                                        <span className="text-[10px] font-thin font-body uppercase">Phone Call</span>
                                                    </SelectItem>
                                                    <SelectItem value={CommunicationType.EMAIL}>
                                                        <span className="text-[10px] font-thin font-body uppercase">Email</span>
                                                    </SelectItem>
                                                    <SelectItem value={CommunicationType.IN_PERSON_VISIT}>
                                                        <span className="text-[10px] font-thin font-body uppercase">In-Person Visit</span>
                                                    </SelectItem>
                                                    <SelectItem value={CommunicationType.VIDEO_CALL}>
                                                        <span className="text-[10px] font-thin font-body uppercase">Video Call</span>
                                                    </SelectItem>
                                                    <SelectItem value={CommunicationType.WHATSAPP}>
                                                        <span className="text-[10px] font-thin font-body uppercase">WhatsApp</span>
                                                    </SelectItem>
                                                    <SelectItem value={CommunicationType.SMS}>
                                                        <span className="text-[10px] font-thin font-body uppercase">SMS</span>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Preferred method for regular communications
                                </p>
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="communicationFrequency"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Communication Frequency
                                </Label>
                                <Controller
                                    control={control}
                                    name="communicationSchedules.0.frequency"
                                    render={({ field }) => (
                                        <div className="relative">
                                            <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                <div className="flex gap-2 items-center">
                                                    <Clock
                                                        className="w-4 h-4 text-muted-foreground"
                                                        strokeWidth={1.5}
                                                    />
                                                    <span className="uppercase text-[10px] font-thin font-body">
                                                        {field.value
                                                            ? field.value.replace('_', ' ')
                                                            : 'SELECT FREQUENCY'}
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
                                                    <SelectItem value={CommunicationFrequency.DAILY}>
                                                        <span className="text-[10px] font-thin font-body uppercase">Daily</span>
                                                    </SelectItem>
                                                    <SelectItem value={CommunicationFrequency.WEEKLY}>
                                                        <span className="text-[10px] font-thin font-body uppercase">Weekly</span>
                                                    </SelectItem>
                                                    <SelectItem value={CommunicationFrequency.BIWEEKLY}>
                                                        <span className="text-[10px] font-thin font-body uppercase">Bi-weekly</span>
                                                    </SelectItem>
                                                    <SelectItem value={CommunicationFrequency.MONTHLY}>
                                                        <span className="text-[10px] font-thin font-body uppercase">Monthly</span>
                                                    </SelectItem>
                                                    <SelectItem value={CommunicationFrequency.QUARTERLY}>
                                                        <span className="text-[10px] font-thin font-body uppercase">Quarterly</span>
                                                    </SelectItem>
                                                    <SelectItem value={CommunicationFrequency.SEMIANNUALLY}>
                                                        <span className="text-[10px] font-thin font-body uppercase">Semi-annually</span>
                                                    </SelectItem>
                                                    <SelectItem value={CommunicationFrequency.ANNUALLY}>
                                                        <span className="text-[10px] font-thin font-body uppercase">Annually</span>
                                                    </SelectItem>
                                                    <SelectItem value={CommunicationFrequency.CUSTOM}>
                                                        <span className="text-[10px] font-thin font-body uppercase">Custom</span>
                                                    </SelectItem>
                                                    <SelectItem value={CommunicationFrequency.NONE}>
                                                        <span className="text-[10px] font-thin font-body uppercase">None</span>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    How often to contact this client
                                </p>
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="preferredTime"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Preferred Contact Time
                                </Label>
                                <Input
                                    id="preferredTime"
                                    type="time"
                                    {...register('communicationSchedules.0.preferredTime')}
                                    className="font-light bg-card border-border"
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Best time to contact this client
                                </p>
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="communicationNotes"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Communication Notes
                                </Label>
                                <Textarea
                                    id="communicationNotes"
                                    {...register('communicationSchedules.0.notes')}
                                    placeholder="Special communication preferences or notes..."
                                    rows={3}
                                    className="font-light resize-none bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Any special notes about communicating with this client
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Geofencing */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex gap-2 items-center text-sm font-medium">
                            <MapPin className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Geofencing Settings
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
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
                                            <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                                                <div className="flex gap-2 items-center">
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
                                                        GeofenceType,
                                                    ).map((type) => (
                                                        <SelectItem
                                                            key={type}
                                                            value={type}
                                                        >
                                                            <div className="flex gap-2 items-center">
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
                                        {typeof errors.geofenceRadius.message === 'string' ? errors.geofenceRadius.message : 'Invalid radius'}
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
                                            {typeof errors.latitude.message === 'string' ? errors.latitude.message : 'Invalid latitude'}
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
                                            {typeof errors.longitude.message === 'string' ? errors.longitude.message : 'Invalid longitude'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* User Targets & Cost Management Section */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex gap-2 items-center text-sm font-medium">
                            <CreditCard className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                User Targets & Cost Management
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Target Period & Currency */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <Label htmlFor="userTargets.targetPeriod" className="text-[10px] font-thin uppercase font-body">
                                    Target Period
                                </Label>
                                <Controller
                                    name="userTargets.targetPeriod"
                                    control={control}
                                    render={({ field }) => (
                                        <Select 
                                            value={field.value || 'Monthly'} 
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="font-light bg-card border-border">
                                                <div className="text-xs font-body">
                                                    {field.value || 'Monthly'}
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Weekly">Weekly</SelectItem>
                                                <SelectItem value="Monthly">Monthly</SelectItem>
                                                <SelectItem value="Quarterly">Quarterly</SelectItem>
                                                <SelectItem value="Annually">Annually</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div>
                                <Label htmlFor="userTargets.targetCurrency" className="text-[10px] font-thin uppercase font-body">
                                    Currency
                                </Label>
                                <Controller
                                    name="userTargets.targetCurrency"
                                    control={control}
                                    render={({ field }) => (
                                        <Select 
                                            value={field.value || 'ZAR'} 
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="font-light bg-card border-border">
                                                <div className="text-xs font-body">
                                                    {field.value || 'ZAR'}
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ZAR">ZAR (South African Rand)</SelectItem>
                                                <SelectItem value="USD">USD (US Dollar)</SelectItem>
                                                <SelectItem value="EUR">EUR (Euro)</SelectItem>
                                                <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Period Dates */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="userTargets.periodStartDate" className="text-[10px] font-thin uppercase font-body">
                                    Period Start Date
                                </Label>
                                <Controller
                                    name="userTargets.periodStartDate"
                                    control={control}
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="justify-between w-full h-10 font-light bg-card border-border"
                                                >
                                                    <span className="text-xs font-body">
                                                        {field.value
                                                            ? format(field.value, 'PPP')
                                                            : 'Select start date'}
                                                    </span>
                                                    <CalendarIcon className="w-4 h-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="p-0 w-auto">
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

                            <div>
                                <Label htmlFor="userTargets.periodEndDate" className="text-[10px] font-thin uppercase font-body">
                                    Period End Date
                                </Label>
                                <Controller
                                    name="userTargets.periodEndDate"
                                    control={control}
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="justify-between w-full h-10 font-light bg-card border-border"
                                                >
                                                    <span className="text-xs font-body">
                                                        {field.value
                                                            ? format(field.value, 'PPP')
                                                            : 'Select end date'}
                                                    </span>
                                                    <CalendarIcon className="w-4 h-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="p-0 w-auto">
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

                        {/* Sales Targets */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-primary">Sales Targets</h4>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="userTargets.targetSalesAmount" className="text-[10px] font-thin uppercase font-body">
                                        Target Sales Amount (ZAR)
                                    </Label>
                                    <Input
                                        id="userTargets.targetSalesAmount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...register('userTargets.targetSalesAmount', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="50000.00"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.userTargets?.targetSalesAmount && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.userTargets.targetSalesAmount.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="userTargets.currentSalesAmount" className="text-[10px] font-thin uppercase font-body">
                                        Current Sales Amount (ZAR)
                                    </Label>
                                    <Input
                                        id="userTargets.currentSalesAmount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...register('userTargets.currentSalesAmount', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="25000.00"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.userTargets?.currentSalesAmount && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.userTargets.currentSalesAmount.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="userTargets.targetQuotationsAmount" className="text-[10px] font-thin uppercase font-body">
                                        Target Quotations Amount (ZAR)
                                    </Label>
                                    <Input
                                        id="userTargets.targetQuotationsAmount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...register('userTargets.targetQuotationsAmount', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="30000.00"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.userTargets?.targetQuotationsAmount && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.userTargets.targetQuotationsAmount.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="userTargets.currentQuotationsAmount" className="text-[10px] font-thin uppercase font-body">
                                        Current Quotations Amount (ZAR)
                                    </Label>
                                    <Input
                                        id="userTargets.currentQuotationsAmount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...register('userTargets.currentQuotationsAmount', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="15000.00"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.userTargets?.currentQuotationsAmount && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.userTargets.currentQuotationsAmount.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="userTargets.currentOrdersAmount" className="text-[10px] font-thin uppercase font-body">
                                        Current Orders Amount (ZAR)
                                    </Label>
                                    <Input
                                        id="userTargets.currentOrdersAmount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...register('userTargets.currentOrdersAmount', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="10000.00"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.userTargets?.currentOrdersAmount && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.userTargets.currentOrdersAmount.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Activity Targets */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-primary">Activity Targets</h4>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="userTargets.targetHoursWorked" className="text-[10px] font-thin uppercase font-body">
                                        Target Hours Worked
                                    </Label>
                                    <Input
                                        id="userTargets.targetHoursWorked"
                                        type="number"
                                        min="0"
                                        {...register('userTargets.targetHoursWorked', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="160"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.userTargets?.targetHoursWorked && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.userTargets.targetHoursWorked.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="userTargets.currentHoursWorked" className="text-[10px] font-thin uppercase font-body">
                                        Current Hours Worked
                                    </Label>
                                    <Input
                                        id="userTargets.currentHoursWorked"
                                        type="number"
                                        min="0"
                                        {...register('userTargets.currentHoursWorked', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="80"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.userTargets?.currentHoursWorked && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.userTargets.currentHoursWorked.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="userTargets.targetNewClients" className="text-[10px] font-thin uppercase font-body">
                                        Target New Clients
                                    </Label>
                                    <Input
                                        id="userTargets.targetNewClients"
                                        type="number"
                                        min="0"
                                        {...register('userTargets.targetNewClients', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="10"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.userTargets?.targetNewClients && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.userTargets.targetNewClients.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="userTargets.currentNewClients" className="text-[10px] font-thin uppercase font-body">
                                        Current New Clients
                                    </Label>
                                    <Input
                                        id="userTargets.currentNewClients"
                                        type="number"
                                        min="0"
                                        {...register('userTargets.currentNewClients', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="5"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.userTargets?.currentNewClients && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.userTargets.currentNewClients.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="userTargets.targetNewLeads" className="text-[10px] font-thin uppercase font-body">
                                        Target New Leads
                                    </Label>
                                    <Input
                                        id="userTargets.targetNewLeads"
                                        type="number"
                                        min="0"
                                        {...register('userTargets.targetNewLeads', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="20"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.userTargets?.targetNewLeads && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.userTargets.targetNewLeads.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="userTargets.currentNewLeads" className="text-[10px] font-thin uppercase font-body">
                                        Current New Leads
                                    </Label>
                                    <Input
                                        id="userTargets.currentNewLeads"
                                        type="number"
                                        min="0"
                                        {...register('userTargets.currentNewLeads', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="12"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.userTargets?.currentNewLeads && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.userTargets.currentNewLeads.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="userTargets.targetCheckIns" className="text-[10px] font-thin uppercase font-body">
                                        Target Check-Ins
                                    </Label>
                                    <Input
                                        id="userTargets.targetCheckIns"
                                        type="number"
                                        min="0"
                                        {...register('userTargets.targetCheckIns', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="50"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.userTargets?.targetCheckIns && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.userTargets.targetCheckIns.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="userTargets.currentCheckIns" className="text-[10px] font-thin uppercase font-body">
                                        Current Check-Ins
                                    </Label>
                                    <Input
                                        id="userTargets.currentCheckIns"
                                        type="number"
                                        min="0"
                                        {...register('userTargets.currentCheckIns', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="25"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.userTargets?.currentCheckIns && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.userTargets.currentCheckIns.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="userTargets.targetCalls" className="text-[10px] font-thin uppercase font-body">
                                        Target Calls
                                    </Label>
                                    <Input
                                        id="userTargets.targetCalls"
                                        type="number"
                                        min="0"
                                        {...register('userTargets.targetCalls', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="100"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.userTargets?.targetCalls && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.userTargets.targetCalls.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="userTargets.currentCalls" className="text-[10px] font-thin uppercase font-body">
                                        Current Calls
                                    </Label>
                                    <Input
                                        id="userTargets.currentCalls"
                                        type="number"
                                        min="0"
                                        {...register('userTargets.currentCalls', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="60"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.userTargets?.currentCalls && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.userTargets.currentCalls.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Cost Management */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-primary">Cost Management</h4>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="userTargets.baseSalary" className="text-[10px] font-thin uppercase font-body">
                                        Base Salary (ZAR)
                                    </Label>
                                    <Input
                                        id="userTargets.baseSalary"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...register('userTargets.baseSalary', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="25000.00"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.userTargets?.baseSalary && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.userTargets.baseSalary.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="userTargets.carInstalment" className="text-[10px] font-thin uppercase font-body">
                                        Car Instalment (ZAR)
                                    </Label>
                                    <Input
                                        id="userTargets.carInstalment"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...register('userTargets.carInstalment', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="5000.00"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.userTargets?.carInstalment && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.userTargets.carInstalment.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="userTargets.carInsurance" className="text-[10px] font-thin uppercase font-body">
                                        Car Insurance (ZAR)
                                    </Label>
                                    <Input
                                        id="userTargets.carInsurance"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...register('userTargets.carInsurance', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="1500.00"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.userTargets?.carInsurance && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.userTargets.carInsurance.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="userTargets.fuel" className="text-[10px] font-thin uppercase font-body">
                                        Fuel Costs (ZAR)
                                    </Label>
                                    <Input
                                        id="userTargets.fuel"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...register('userTargets.fuel', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="3000.00"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.userTargets?.fuel && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.userTargets.fuel.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="userTargets.cellPhoneAllowance" className="text-[10px] font-thin uppercase font-body">
                                        Cell Phone Allowance (ZAR)
                                    </Label>
                                    <Input
                                        id="userTargets.cellPhoneAllowance"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...register('userTargets.cellPhoneAllowance', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="500.00"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.userTargets?.cellPhoneAllowance && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.userTargets.cellPhoneAllowance.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="userTargets.carMaintenance" className="text-[10px] font-thin uppercase font-body">
                                        Car Maintenance (ZAR)
                                    </Label>
                                    <Input
                                        id="userTargets.carMaintenance"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...register('userTargets.carMaintenance', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="1000.00"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.userTargets?.carMaintenance && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.userTargets.carMaintenance.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="userTargets.cgicCosts" className="text-[10px] font-thin uppercase font-body">
                                        CGIC Costs (ZAR)
                                    </Label>
                                    <Input
                                        id="userTargets.cgicCosts"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...register('userTargets.cgicCosts', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="2000.00"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.userTargets?.cgicCosts && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.userTargets.cgicCosts.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="userTargets.totalCost" className="text-[10px] font-thin uppercase font-body">
                                        Total Cost (ZAR)
                                    </Label>
                                    <Input
                                        id="userTargets.totalCost"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...register('userTargets.totalCost', {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="38000.00"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.userTargets?.totalCost && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.userTargets.totalCost.message}
                                        </p>
                                    )}
                                    <p className="text-[10px] text-muted-foreground">
                                        Total of all cost components
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Cost Breakdown Summary */}
                        <div className="p-4 rounded-lg border bg-muted/30 border-border">
                            <h5 className="mb-2 text-xs font-medium uppercase text-primary">Cost Breakdown Summary</h5>
                            <div className="text-xs text-muted-foreground">
                                <p>Base Salary: R {watch('userTargets.baseSalary')?.toLocaleString() || '0'}</p>
                                <p>Car Instalment: R {watch('userTargets.carInstalment')?.toLocaleString() || '0'}</p>
                                <p>Car Insurance: R {watch('userTargets.carInsurance')?.toLocaleString() || '0'}</p>
                                <p>Fuel: R {watch('userTargets.fuel')?.toLocaleString() || '0'}</p>
                                <p>Cell Phone: R {watch('userTargets.cellPhoneAllowance')?.toLocaleString() || '0'}</p>
                                <p>Car Maintenance: R {watch('userTargets.carMaintenance')?.toLocaleString() || '0'}</p>
                                <p>CGIC Costs: R {watch('userTargets.cgicCosts')?.toLocaleString() || '0'}</p>
                                <hr className="my-2 border-border" />
                                <p className="font-medium">
                                    Calculated Total: R {
                                        (
                                            (watch('userTargets.baseSalary') || 0) +
                                            (watch('userTargets.carInstalment') || 0) +
                                            (watch('userTargets.carInsurance') || 0) +
                                            (watch('userTargets.fuel') || 0) +
                                            (watch('userTargets.cellPhoneAllowance') || 0) +
                                            (watch('userTargets.carMaintenance') || 0) +
                                            (watch('userTargets.cgicCosts') || 0)
                                        ).toLocaleString()
                                    }
                                </p>
                                {watch('userTargets.currentSalesAmount') && watch('userTargets.totalCost') && (
                                    <p className="mt-2 font-medium text-primary">
                                        Basket Total: R {
                                            (
                                                (watch('userTargets.currentSalesAmount') || 0) - 
                                                (watch('userTargets.totalCost') || 0)
                                            ).toLocaleString()
                                        }
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </fieldset>

            {/* Submit Button */}
            <div className="pt-4 mt-6 border-t border-border">
                {Object.keys(errors).length > 0 && (
                    <div className="p-3 mb-4 text-xs text-red-800 bg-red-100 rounded-md">
                        <div className="flex gap-2 items-center">
                            <AlertTriangle className="w-4 h-4" />
                            <p className="text-xs font-semibold uppercase font-body">
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
                <div className="flex gap-2 justify-end">
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
                            <div className="flex gap-2 items-center">
                                <span className="inline-block w-4 h-4 rounded-full border-2 border-white animate-spin border-t-transparent"></span>
                                <span>Creating...</span>
                            </div>
                        ) : isLoading ? (
                            'Loading...'
                        ) : (
                            'Create Client'
                        )}
                    </Button>
                </div>
            </div>
        </form>
    );
};
