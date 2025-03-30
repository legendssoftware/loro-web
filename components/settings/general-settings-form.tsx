'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import {
    organizationSettingsApi,
    getOrganizationRef,
    OrganisationSettings,
} from '@/lib/services/organization-api';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';

const contactSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address' }),
    phone: z.object({
        code: z.string().min(1, { message: 'Please select a country code' }),
        number: z
            .string()
            .min(5, { message: 'Please enter a valid phone number' }),
    }),
    website: z
        .string()
        .url({ message: 'Please enter a valid website URL' })
        .optional()
        .or(z.literal('')),
    address: z.string().min(5, { message: 'Please enter a valid address' }),
});

const regionalSchema = z.object({
    language: z.string().min(1, { message: 'Please select a language' }),
    timezone: z.string().min(1, { message: 'Please select a timezone' }),
    currency: z.string().min(1, { message: 'Please select a currency' }),
    dateFormat: z.string().min(1, { message: 'Please select a date format' }),
    timeFormat: z.string().min(1, { message: 'Please select a time format' }),
});

const businessSchema = z.object({
    name: z
        .string()
        .min(2, { message: 'Business name must be at least 2 characters' }),
    registrationNumber: z.string().optional().or(z.literal('')),
    taxId: z.string().optional().or(z.literal('')),
    industry: z.string().min(1, { message: 'Please select an industry' }),
    size: z.enum(['small', 'medium', 'large', 'enterprise'], {
        required_error: 'Please select a business size',
    }),
});

export default function GeneralSettingsForm() {
    const [activeTab, setActiveTab] = useState('contact');
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [organisationRef] = useState(getOrganizationRef());
    const [originalSettings, setOriginalSettings] =
        useState<OrganisationSettings>({});

    const contactForm = useForm<z.infer<typeof contactSchema>>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            email: '',
            phone: {
                code: '',
                number: '',
            },
            website: '',
            address: '',
        },
    });

    const regionalForm = useForm<z.infer<typeof regionalSchema>>({
        resolver: zodResolver(regionalSchema),
        defaultValues: {
            language: '',
            timezone: '',
            currency: '',
            dateFormat: '',
            timeFormat: '',
        },
    });

    const businessForm = useForm<z.infer<typeof businessSchema>>({
        resolver: zodResolver(businessSchema),
        defaultValues: {
            name: '',
            registrationNumber: '',
            taxId: '',
            industry: '',
            size: 'small',
        },
    });

    useEffect(() => {
        const fetchSettings = async () => {
            setIsInitialLoading(true);
            try {
                const settings = await organizationSettingsApi.getSettings();
                setOriginalSettings(settings);

                if (settings.contact) {
                    contactForm.reset({
                        email: settings.contact.email || '',
                        phone: settings.contact.phone || {
                            code: '',
                            number: '',
                        },
                        website: settings.contact.website || '',
                        address: settings.contact.address || '',
                    });
                }

                if (settings.regional) {
                    regionalForm.reset({
                        language: settings.regional.language || '',
                        timezone: settings.regional.timezone || '',
                        currency: settings.regional.currency || '',
                        dateFormat: settings.regional.dateFormat || '',
                        timeFormat: settings.regional.timeFormat || '',
                    });
                }

                if (settings.business) {
                    businessForm.reset({
                        name: settings.business.name || '',
                        registrationNumber:
                            settings.business.registrationNumber || '',
                        taxId: settings.business.taxId || '',
                        industry: settings.business.industry || '',
                        size: settings.business.size || 'small',
                    });
                }
            } catch (error) {
                console.error('Error fetching organization settings:', error);
                // Silently handle the error without showing a toast
                // Initialize with default values instead
                
                // Initialize contact form with defaults
                contactForm.reset({
                    email: '',
                    phone: { code: '', number: '' },
                    website: '',
                    address: '',
                });
                
                // Initialize regional form with defaults
                regionalForm.reset({
                    language: '',
                    timezone: '',
                    currency: '',
                    dateFormat: '',
                    timeFormat: '',
                });
                
                // Initialize business form with defaults
                businessForm.reset({
                    name: '',
                    registrationNumber: '',
                    taxId: '',
                    industry: '',
                    size: 'small',
                });
            } finally {
                setIsInitialLoading(false);
            }
        };

        fetchSettings();
    }, []);

    // Helper function to get changed fields only
    const getChangedFields = <T extends Record<string, any>>(
        formValues: T,
        originalValues?: T,
    ): Partial<T> => {
        if (!originalValues) return formValues;

        const changedFields: Partial<T> = {};

        Object.keys(formValues).forEach((key) => {
            const formValue = formValues[key];
            const originalValue = originalValues[key];

            // Handle nested objects (like phone)
            if (
                typeof formValue === 'object' &&
                formValue !== null &&
                typeof originalValue === 'object' &&
                originalValue !== null
            ) {
                const nestedChanges = getChangedFields(
                    formValue,
                    originalValue,
                );
                if (Object.keys(nestedChanges).length > 0) {
                    changedFields[key as keyof T] = {
                        ...originalValue,
                        ...nestedChanges,
                    } as any;
                }
            }
            // For primitive values, compare directly
            else if (formValue !== originalValue) {
                changedFields[key as keyof T] = formValue;
            }
        });

        return changedFields;
    };

    async function onContactSubmit(values: z.infer<typeof contactSchema>) {
        setIsLoading(true);
        try {
            // Get only changed fields
            const changedFields = getChangedFields(
                values,
                originalSettings.contact,
            );

            // If website is empty string, ensure it's included in the update
            if (values.website === '' && originalSettings.contact?.website) {
                changedFields.website = '';
            }

            // Only send update if there are changes
            if (Object.keys(changedFields).length > 0) {
                // Create a complete contact object with all required fields
                const contactData = {
                    email: values.email,
                    phone: values.phone,
                    website: changedFields.website ?? values.website ?? '',
                    address: values.address,
                    ...changedFields
                } as Required<typeof originalSettings.contact>;

                const settingsData: Partial<OrganisationSettings> = {
                    contact: contactData
                };

                await organizationSettingsApi.updateSettings(settingsData);
                // Update original settings
                setOriginalSettings((prev) => ({
                    ...prev,
                    contact: contactData
                }));
                showSuccessToast('Contact information updated', toast);
            } else {
                showSuccessToast('No changes to save', toast);
            }
        } catch (error) {
            showErrorToast(
                'There was a problem saving your contact information.',
                toast,
            );
            console.error('Error saving contact settings:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function onRegionalSubmit(values: z.infer<typeof regionalSchema>) {
        setIsLoading(true);
        try {
            // Get only changed fields
            const changedFields = getChangedFields(
                values,
                originalSettings.regional,
            );

            // Only send update if there are changes
            if (Object.keys(changedFields).length > 0) {
                // Create a complete regional object with all required fields
                const regionalData = {
                    language: values.language,
                    timezone: values.timezone,
                    currency: values.currency,
                    dateFormat: values.dateFormat,
                    timeFormat: values.timeFormat,
                    ...changedFields
                } as Required<typeof originalSettings.regional>;

                const settingsData: Partial<OrganisationSettings> = {
                    regional: regionalData
                };

                await organizationSettingsApi.updateSettings(settingsData);
                // Update original settings
                setOriginalSettings((prev) => ({
                    ...prev,
                    regional: regionalData
                }));
                showSuccessToast('Regional settings updated', toast);
            } else {
                showSuccessToast('No changes to save', toast);
            }
        } catch (error) {
            showErrorToast(
                'There was a problem saving your regional settings.',
                toast,
            );
            console.error('Error saving regional settings:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function onBusinessSubmit(values: z.infer<typeof businessSchema>) {
        setIsLoading(true);
        try {
            // Get only changed fields
            const changedFields = getChangedFields(
                values,
                originalSettings.business,
            );

            // Ensure empty strings are properly handled for optional fields
            if (
                values.registrationNumber === '' &&
                originalSettings.business?.registrationNumber
            ) {
                changedFields.registrationNumber = '';
            }
            if (values.taxId === '' && originalSettings.business?.taxId) {
                changedFields.taxId = '';
            }

            // Only send update if there are changes
            if (Object.keys(changedFields).length > 0) {
                // Create a complete business object with all required fields
                const businessData = {
                    name: values.name,
                    industry: values.industry,
                    size: values.size,
                    registrationNumber: changedFields.registrationNumber ?? values.registrationNumber ?? '',
                    taxId: changedFields.taxId ?? values.taxId ?? '',
                    ...changedFields
                } as Required<typeof originalSettings.business>;

                const settingsData: Partial<OrganisationSettings> = {
                    business: businessData
                };

                await organizationSettingsApi.updateSettings(settingsData);
                // Update original settings
                setOriginalSettings((prev) => ({
                    ...prev,
                    business: businessData
                }));
                showSuccessToast('Business information updated', toast);
            } else {
                showSuccessToast('No changes to save', toast);
            }
        } catch (error) {
            showErrorToast(
                'There was a problem saving your business information.',
                toast,
            );
            console.error('Error saving business information:', error);
        } finally {
            setIsLoading(false);
        }
    }

    if (isInitialLoading) {
        return (
            <Card className="border-border/50">
                <CardContent className="flex items-center justify-center p-8">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
                        <p className="text-xs font-normal uppercase font-body">
                            Loading settings...
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50">
            <CardContent className="p-0">
                <div className="mb-4">
                    <h2 className="px-4 pt-4 mb-1 text-xl font-thin uppercase font-body">
                        General Settings
                    </h2>
                    <p className="px-4 text-xs font-thin uppercase font-body text-muted-foreground">
                        Configure your organization's contact information,
                        regional settings, and business details.
                    </p>
                </div>

                <div className="flex items-center px-4 mb-6 overflow-x-auto border-b border-border/10">
                    {['contact', 'regional', 'business'].map((tab) => (
                        <div
                            key={tab}
                            className="relative flex items-center justify-center gap-1 mr-8 cursor-pointer w-28"
                        >
                            <div
                                className={`mb-3 font-body px-0 font-normal cursor-pointer ${
                                    activeTab === tab
                                        ? 'text-primary dark:text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                                onClick={() => setActiveTab(tab)}
                            >
                                <span className="text-xs font-thin uppercase font-body">
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </span>
                            </div>
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-primary" />
                            )}
                        </div>
                    ))}
                </div>

                {activeTab === 'contact' && (
                    <div className="px-4 py-4">
                        <Form {...contactForm}>
                            <form
                                onSubmit={contactForm.handleSubmit(
                                    onContactSubmit,
                                )}
                                className="space-y-4"
                            >
                                <FormField
                                    control={contactForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-normal uppercase font-body">
                                                Email
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="contact@yourcompany.com"
                                                    {...field}
                                                    className="h-9"
                                                />
                                            </FormControl>
                                            <FormDescription className="text-[10px] uppercase text-muted-foreground font-body">
                                                This email will be used for
                                                official communications.
                                            </FormDescription>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <FormField
                                        control={contactForm.control}
                                        name="phone.code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-normal uppercase font-body">
                                                    Country Code
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue
                                                                placeholder="Select country code"
                                                                className="text-[10px] font-thin font-body"
                                                            />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem
                                                            value="+1"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            +1 (US/Canada)
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="+44"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            +44 (UK)
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="+61"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            +61 (Australia)
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="+91"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            +91 (India)
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={contactForm.control}
                                        name="phone.number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-normal uppercase font-body">
                                                    Phone Number
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="555-123-4567"
                                                        {...field}
                                                        className="h-9"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={contactForm.control}
                                    name="website"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-normal uppercase font-body">
                                                Website
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="https://yourcompany.com"
                                                    {...field}
                                                    className="h-9"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={contactForm.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-normal uppercase font-body">
                                                Address
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="123 Business St, City, Country"
                                                    {...field}
                                                    className="h-9"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="h-9 text-[10px] font-normal uppercase font-body text-white"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2
                                                className="w-4 h-4 mr-2 animate-spin"
                                                strokeWidth={1.5}
                                            />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Contact Information'
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </div>
                )}

                {activeTab === 'regional' && (
                    <div className="px-4 py-4">
                        <Form {...regionalForm}>
                            <form
                                onSubmit={regionalForm.handleSubmit(
                                    onRegionalSubmit,
                                )}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <FormField
                                        control={regionalForm.control}
                                        name="language"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-normal uppercase font-body">
                                                    Language
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue
                                                                placeholder="Select language"
                                                                className="text-[10px] font-thin font-body"
                                                            />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem
                                                            value="en-US"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            English (US)
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="en-GB"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            English (UK)
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="es"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            Spanish
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="fr"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            French
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="de"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            German
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={regionalForm.control}
                                        name="timezone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-normal uppercase font-body">
                                                    Timezone
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue
                                                                placeholder="Select timezone"
                                                                className="text-[10px] font-thin font-body"
                                                            />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem
                                                            value="UTC-8"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            Pacific Time (UTC-8)
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="UTC-5"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            Eastern Time (UTC-5)
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="UTC+0"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            GMT (UTC+0)
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="UTC+1"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            Central European
                                                            Time (UTC+1)
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="UTC+8"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            China Standard Time
                                                            (UTC+8)
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <FormField
                                        control={regionalForm.control}
                                        name="currency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-normal uppercase font-body">
                                                    Currency
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue
                                                                placeholder="Select currency"
                                                                className="text-[10px] font-thin font-body"
                                                            />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem
                                                            value="USD"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            US Dollar (USD)
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="EUR"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            Euro (EUR)
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="GBP"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            British Pound (GBP)
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="JPY"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            Japanese Yen (JPY)
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="AUD"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            Australian Dollar
                                                            (AUD)
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={regionalForm.control}
                                        name="dateFormat"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-normal uppercase font-body">
                                                    Date Format
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue
                                                                placeholder="Select date format"
                                                                className="text-[10px] font-thin font-body"
                                                            />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem
                                                            value="MM/DD/YYYY"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            MM/DD/YYYY
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="DD/MM/YYYY"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            DD/MM/YYYY
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="YYYY-MM-DD"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            YYYY-MM-DD
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={regionalForm.control}
                                    name="timeFormat"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-normal uppercase font-body">
                                                Time Format
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-9">
                                                        <SelectValue
                                                            placeholder="Select time format"
                                                            className="text-[10px] font-thin font-body"
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem
                                                        value="12h"
                                                        className="text-[10px] font-thin font-body"
                                                    >
                                                        12-hour (AM/PM)
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="24h"
                                                        className="text-[10px] font-thin font-body"
                                                    >
                                                        24-hour
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="h-9 text-[10px] font-normal uppercase font-body text-white"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2
                                                className="w-4 h-4 mr-2 animate-spin"
                                                strokeWidth={1.5}
                                            />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Regional Settings'
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </div>
                )}

                {activeTab === 'business' && (
                    <div className="px-4 py-4">
                        <Form {...businessForm}>
                            <form
                                onSubmit={businessForm.handleSubmit(
                                    onBusinessSubmit,
                                )}
                                className="space-y-4"
                            >
                                <FormField
                                    control={businessForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-normal uppercase font-body">
                                                Business Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Your Company Name"
                                                    {...field}
                                                    className="h-9"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <FormField
                                        control={businessForm.control}
                                        name="registrationNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-normal uppercase font-body">
                                                    Registration Number
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Business registration number"
                                                        {...field}
                                                        className="h-9"
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-[10px] uppercase text-muted-foreground font-body">
                                                    Your official business
                                                    registration number
                                                    (optional)
                                                </FormDescription>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={businessForm.control}
                                        name="taxId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-normal uppercase font-body">
                                                    Tax ID
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Tax identification number"
                                                        {...field}
                                                        className="h-9"
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-[10px] uppercase text-muted-foreground font-body">
                                                    Your tax identification
                                                    number (optional)
                                                </FormDescription>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <FormField
                                        control={businessForm.control}
                                        name="industry"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-normal uppercase font-body">
                                                    Industry
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue
                                                                placeholder="Select industry"
                                                                className="text-[10px] font-thin font-body"
                                                            />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem
                                                            value="technology"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            Technology
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="healthcare"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            Healthcare
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="finance"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            Finance
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="education"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            Education
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="retail"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            Retail
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="manufacturing"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            Manufacturing
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="other"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            Other
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={businessForm.control}
                                        name="size"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-normal uppercase font-body">
                                                    Business Size
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue
                                                                placeholder="Select business size"
                                                                className="text-[10px] font-thin font-body"
                                                            />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem
                                                            value="small"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            Small (1-50
                                                            employees)
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="medium"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            Medium (51-250
                                                            employees)
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="large"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            Large (251-1000
                                                            employees)
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="enterprise"
                                                            className="text-[10px] font-thin font-body"
                                                        >
                                                            Enterprise (1000+
                                                            employees)
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="h-9 text-[10px] font-normal uppercase font-body text-white"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2
                                                className="w-4 h-4 mr-2 animate-spin"
                                                strokeWidth={1.5}
                                            />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Business Information'
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
