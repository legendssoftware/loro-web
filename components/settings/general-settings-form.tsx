'use client';

import { useState } from 'react';
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
import { Loader2 } from 'lucide-react';

const generalSettingsSchema = z.object({
    contact: z.object({
        email: z
            .string()
            .email({ message: 'Please enter a valid email address' }),
        phone: z.object({
            code: z.string(),
            number: z.string().min(5, {
                message: 'Phone number must be at least 5 characters',
            }),
        }),
        website: z
            .string()
            .url({ message: 'Please enter a valid URL' })
            .optional()
            .or(z.literal('')),
        address: z.object({
            street: z.string().optional(),
            suburb: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            country: z.string().optional(),
            postalCode: z.string().optional(),
        }),
    }),
    regional: z.object({
        language: z.string(),
        timezone: z.string(),
        currency: z.string(),
        dateFormat: z.string(),
        timeFormat: z.string(),
    }),
    business: z.object({
        name: z
            .string()
            .min(2, { message: 'Business name must be at least 2 characters' }),
        registrationNumber: z.string().optional(),
        taxId: z.string().optional(),
        industry: z.string().optional(),
        size: z.enum(['small', 'medium', 'large', 'enterprise']),
    }),
    notifications: z.object({
        email: z.boolean(),
        sms: z.boolean(),
        push: z.boolean(),
        whatsapp: z.boolean(),
    }),
    preferences: z.object({
        defaultView: z.string(),
        itemsPerPage: z.number().min(5).max(100),
        theme: z.enum(['light', 'dark', 'system']),
        menuCollapsed: z.boolean(),
    }),
});

type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;

// This would be populated from your API in a real application
const defaultValues: GeneralSettingsFormValues = {
    contact: {
        email: '',
        phone: {
            code: '',
            number: '',
        },
        website: '',
        address: {
            street: '',
            suburb: '',
            city: '',
            state: '',
            country: '',
            postalCode: '',
        },
    },
    regional: {
        language: '',
        timezone: '',
        currency: '',
        dateFormat: '',
        timeFormat: '',
    },
    business: {
        name: '',
        registrationNumber: '',
        taxId: '',
        industry: '',
        size: 'small',
    },
    notifications: {
        email: false,
        sms: false,
        push: false,
        whatsapp: false,
    },
    preferences: {
        defaultView: '',
        itemsPerPage: 10,
        theme: 'system',
        menuCollapsed: false,
    },
};

// Country options
const countries = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'AU', label: 'Australia' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'JP', label: 'Japan' },
    { value: 'CN', label: 'China' },
    { value: 'IN', label: 'India' },
    { value: 'BR', label: 'Brazil' },
    { value: 'ZA', label: 'South Africa' },
    { value: 'NG', label: 'Nigeria' },
    { value: 'MX', label: 'Mexico' },
    { value: 'SG', label: 'Singapore' },
    { value: 'NZ', label: 'New Zealand' },
    { value: 'AE', label: 'United Arab Emirates' },
    { value: 'SA', label: 'Saudi Arabia' },
    { value: 'KE', label: 'Kenya' },
    { value: 'GH', label: 'Ghana' },
];

// Country calling codes
const countryCodes = [
    { value: '+1', label: 'United States (+1)' },
    { value: '+44', label: 'United Kingdom (+44)' },
    { value: '+61', label: 'Australia (+61)' },
    { value: '+1', label: 'Canada (+1)' },
    { value: '+49', label: 'Germany (+49)' },
    { value: '+33', label: 'France (+33)' },
    { value: '+81', label: 'Japan (+81)' },
    { value: '+86', label: 'China (+86)' },
    { value: '+91', label: 'India (+91)' },
    { value: '+55', label: 'Brazil (+55)' },
    { value: '+27', label: 'South Africa (+27)' },
    { value: '+234', label: 'Nigeria (+234)' },
    { value: '+52', label: 'Mexico (+52)' },
    { value: '+65', label: 'Singapore (+65)' },
    { value: '+64', label: 'New Zealand (+64)' },
    { value: '+971', label: 'United Arab Emirates (+971)' },
    { value: '+966', label: 'Saudi Arabia (+966)' },
    { value: '+254', label: 'Kenya (+254)' },
    { value: '+233', label: 'Ghana (+233)' },
];

export default function GeneralSettingsForm() {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<GeneralSettingsFormValues>({
        resolver: zodResolver(generalSettingsSchema),
        defaultValues,
    });

    async function onSubmit(data: GeneralSettingsFormValues) {
        setIsLoading(true);
        try {
            // In a real app, this would call your API
            await new Promise((resolve) => setTimeout(resolve, 1000));

            toast.success('General settings saved successfully');
        } catch (error) {
            console.error('Error saving general settings:', error);
            toast.error('Failed to save general settings');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex items-center px-2 overflow-x-auto border-b border-border/10">
                    <div className="relative flex items-center justify-center gap-1 mr-8 cursor-pointer w-36">
                        <div className="flex items-center gap-2 px-0 mb-3 font-normal cursor-pointer font-body text-primary dark:text-primary">
                            <span className="text-xs font-normal uppercase font-body">
                                CONTACT
                            </span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-primary" />
                    </div>
                    <div className="relative flex items-center justify-center gap-1 mr-8 cursor-pointer w-36">
                        <div className="flex items-center gap-2 px-0 mb-3 font-normal cursor-pointer font-body text-muted-foreground hover:text-foreground">
                            <span className="text-xs font-normal uppercase font-body">
                                REGIONAL
                            </span>
                        </div>
                    </div>
                    <div className="relative flex items-center justify-center gap-1 mr-8 cursor-pointer w-36">
                        <div className="flex items-center gap-2 px-0 mb-3 font-normal cursor-pointer font-body text-muted-foreground hover:text-foreground">
                            <span className="text-xs font-normal uppercase font-body">
                                BUSINESS
                            </span>
                        </div>
                    </div>
                    <div className="relative flex items-center justify-center gap-1 mr-8 cursor-pointer w-36">
                        <div className="flex items-center gap-2 px-0 mb-3 font-normal cursor-pointer font-body text-muted-foreground hover:text-foreground">
                            <span className="text-xs font-normal uppercase font-body">
                                NOTIFICATIONS
                            </span>
                        </div>
                    </div>
                    <div className="relative flex items-center justify-center gap-1 mr-8 cursor-pointer w-36">
                        <div className="flex items-center gap-2 px-0 mb-3 font-normal cursor-pointer font-body text-muted-foreground hover:text-foreground">
                            <span className="text-xs font-normal uppercase font-body">
                                PREFERENCES
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 space-y-6 contact-section">
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="contact.email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-normal uppercase font-body">
                                        EMAIL ADDRESS
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="contact@example.com"
                                            {...field}
                                            className="font-light bg-card border-border placeholder:text-[10px] placeholder:font-body"
                                        />
                                    </FormControl>
                                    <FormDescription className="text-[10px] uppercase text-muted-foreground">
                                        THE PRIMARY CONTACT EMAIL FOR YOUR ORGANISATION
                                    </FormDescription>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="contact.website"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-normal uppercase font-body">
                                        WEBSITE
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://example.com"
                                            {...field}
                                            className="font-light bg-card border-border placeholder:text-[10px] placeholder:font-body"
                                        />
                                    </FormControl>
                                    <FormDescription className="text-[10px] uppercase text-muted-foreground">
                                        YOUR ORGANISATION'S WEBSITE URL
                                    </FormDescription>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="contact.phone.code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-normal uppercase font-body">
                                        COUNTRY CODE
                                    </FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-10 font-light bg-card border-border">
                                                <SelectValue
                                                    placeholder="Select country code"
                                                    className="text-[10px] font-thin font-body"
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {countryCodes.map((code) => (
                                                <SelectItem
                                                    key={code.value}
                                                    value={code.value}
                                                    className="text-[10px] font-thin font-body"
                                                >
                                                    {code.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="contact.phone.number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-normal uppercase font-body">
                                        PHONE NUMBER
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="011 287 3920"
                                            {...field}
                                            className="font-light bg-card border-border placeholder:text-[10px] placeholder:font-body"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-normal uppercase font-body">
                            ADDRESS
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="contact.address.street"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-normal uppercase font-body">
                                            STREET
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="123 Main St"
                                                {...field}
                                                className="font-light bg-card border-border placeholder:text-[10px] placeholder:font-body"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="contact.address.suburb"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-normal uppercase font-body">
                                            SUBURB
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Downtown"
                                                {...field}
                                                className="font-light bg-card border-border placeholder:text-[10px] placeholder:font-body"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="contact.address.city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-normal uppercase font-body">
                                            CITY
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="New York"
                                                {...field}
                                                className="font-light bg-card border-border placeholder:text-[10px] placeholder:font-body"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="contact.address.state"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-normal uppercase font-body">
                                            STATE/PROVINCE
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="NY"
                                                {...field}
                                                className="font-light bg-card border-border placeholder:text-[10px] placeholder:font-body"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="contact.address.postalCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-normal uppercase font-body">
                                            POSTAL CODE
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="10001"
                                                {...field}
                                                className="font-light bg-card border-border placeholder:text-[10px] placeholder:font-body"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="contact.address.country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-normal uppercase font-body">
                                            COUNTRY
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-10 font-light bg-card border-border">
                                                    <SelectValue
                                                        placeholder="Select country"
                                                        className="text-[10px] font-thin font-body"
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {countries.map((country) => (
                                                    <SelectItem
                                                        key={country.value}
                                                        value={country.value}
                                                        className="text-[10px] font-thin font-body"
                                                    >
                                                        {country.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 mt-6 border-t border-border">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="h-9 text-[10px] font-normal uppercase font-body bg-primary hover:bg-primary/90 text-white"
                    >
                        {isLoading ? (
                            <>
                                <Loader2
                                    className="w-4 h-4 mr-2 animate-spin"
                                    strokeWidth={1.5}
                                />
                                SAVING...
                            </>
                        ) : (
                            'SAVE CHANGES'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
