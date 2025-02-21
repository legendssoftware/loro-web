import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getOrganisationSettings, OrganisationSettings, updateOrganisationSettings } from '@/helpers/organizations';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import { useSessionStore } from '@/store/use-session-store';
import Image from 'next/image';
import { PageLoader } from '@/components/page-loader';

const FALLBACK_LOGO = '/images/fallback-logo.png';

const settingsFormSchema = z.object({
    contact: z.object({
        email: z.string().email('Invalid email address'),
        phone: z.object({
            code: z.string(),
            number: z.string().min(1, 'Phone number is required'),
        }),
        website: z.string().url('Must be a valid URL'),
        address: z.string().min(1, 'Address is required'),
    }),
    regional: z.object({
        language: z.string().min(1, 'Language is required'),
        timezone: z.string().min(1, 'Timezone is required'),
        currency: z.string().min(1, 'Currency is required'),
        dateFormat: z.string().min(1, 'Date format is required'),
        timeFormat: z.string().min(1, 'Time format is required'),
    }),
    business: z.object({
        name: z.string().min(1, 'Business name is required'),
        registrationNumber: z.string().optional(),
        taxId: z.string().min(1, 'Tax ID is required'),
        industry: z.string().optional(),
        size: z.enum(['small', 'medium', 'large', 'enterprise']).optional(),
    }),
    branding: z.object({
        logo: z.string().optional(),
        logoAltText: z.string().optional(),
        favicon: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        accentColor: z.string().optional(),
    }),
    notifications: z
        .object({
            email: z.boolean().optional(),
            sms: z.boolean().optional(),
            push: z.boolean().optional(),
            whatsapp: z.boolean().optional(),
        })
        .optional(),
    preferences: z
        .object({
            defaultView: z.string().optional(),
            itemsPerPage: z.number().optional(),
            theme: z.enum(['light', 'dark', 'system']).optional(),
            menuCollapsed: z.boolean().optional(),
        })
        .optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export function SettingsForm() {
    const { profileData } = useSessionStore();
    const queryClient = useQueryClient();
    const isAdmin = profileData?.accessLevel === 'admin';

    const { data: settingsData, isLoading } = useQuery({
        queryKey: ['organisationSettings', profileData?.organisationRef],
        queryFn: () => getOrganisationSettings(profileData?.organisationRef as string),
        enabled: !!profileData?.organisationRef,
    });

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: {
            contact: {
                email: settingsData?.settings?.contact?.email || '',
                phone: {
                    code: '+27',
                    number: settingsData?.settings?.contact?.phone?.number || '',
                },
                website: settingsData?.settings?.contact?.website || '',
                address: settingsData?.settings?.contact?.address || '',
            },
            regional: {
                language: settingsData?.settings?.regional?.language || 'en',
                timezone: settingsData?.settings?.regional?.timezone || 'SAST',
                currency: settingsData?.settings?.regional?.currency || 'ZAR',
                dateFormat: settingsData?.settings?.regional?.dateFormat || 'DD/MM/YYYY',
                timeFormat: settingsData?.settings?.regional?.timeFormat || '24',
            },
            business: {
                name: settingsData?.settings?.business?.name || '',
                registrationNumber: settingsData?.settings?.business?.registrationNumber || '',
                taxId: settingsData?.settings?.business?.taxId || '',
                industry: settingsData?.settings?.business?.industry || '',
                size: settingsData?.settings?.business?.size || 'small',
            },
            notifications: settingsData?.settings?.notifications || {
                email: true,
                sms: false,
                push: true,
                whatsapp: false,
            },
            preferences: settingsData?.settings?.preferences || {
                defaultView: 'grid',
                itemsPerPage: 10,
                theme: 'system',
                menuCollapsed: false,
            },
            branding: {
                logo: settingsData?.settings?.branding?.logo,
                logoAltText: settingsData?.settings?.branding?.logoAltText,
                favicon: settingsData?.settings?.branding?.favicon,
                primaryColor: settingsData?.settings?.branding?.primaryColor || '#FC4A4A',
                secondaryColor: settingsData?.settings?.branding?.secondaryColor || '#2196F3',
                accentColor: settingsData?.settings?.branding?.accentColor || '#4CAF50',
            },
        },
    });

    const mutation = useMutation({
        mutationFn: (values: SettingsFormValues) => {
            const settings: Partial<OrganisationSettings> = {
                ...values,
                notifications: {
                    email: values.notifications?.email ?? true,
                    sms: values.notifications?.sms ?? false,
                    push: values.notifications?.push ?? true,
                    whatsapp: values.notifications?.whatsapp ?? false,
                },
                preferences: {
                    defaultView: values.preferences?.defaultView ?? 'grid',
                    itemsPerPage: values.preferences?.itemsPerPage ?? 10,
                    theme: values.preferences?.theme ?? 'system',
                    menuCollapsed: values.preferences?.menuCollapsed ?? false,
                },
                branding: values.branding ? {
                    ...values.branding,
                    primaryColor: values.branding.primaryColor ?? '#FC4A4A',
                    secondaryColor: values.branding.secondaryColor ?? '#2196F3',
                    accentColor: values.branding.accentColor ?? '#4CAF50',
                } : undefined
            };
            return updateOrganisationSettings(profileData?.organisationRef as string, settings);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organisationSettings'] });
            toast.success('Settings updated successfully');
        },
        onError: error => {
            toast.error(error.message || 'Failed to update settings');
        },
    });

    function onSubmit(values: SettingsFormValues) {
        if (!isAdmin) {
            toast.error('Only administrators can update settings');
            return;
        }
        mutation.mutate(values);
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;

        const file = e.target.files[0];
        if (!file.type.includes('image')) {
            toast.error('Please upload an image file');
            return;
        }

        const formData = new FormData();
        formData.append('logo', file);

        try {
            // TODO: Implement your file upload logic here
            // const response = await uploadLogo(formData);
            // form.setValue('branding.logo', response.url);
            toast.success('Logo uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload logo');
        }
    };

    if (isLoading) {
        return (
            <div className='flex items-center justify-center w-full h-[600px]'>
                <PageLoader />
            </div>
        );
    }

    return (
        <div className='flex flex-col gap-8'>
            <div className='flex flex-col gap-6 mx-auto xl:w-11/12'>
                <div>
                    <h2 className='font-normal uppercase text-md font-body'>General Settings</h2>
                    <p className='text-xs font-normal uppercase font-body text-muted-foreground'>
                        Manage your business details
                    </p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                        {/* Logo Upload Section */}
                        <div className='space-y-4'>
                            <h3 className='text-sm font-normal uppercase font-body'>Logo</h3>
                            <div className='flex items-center gap-6'>
                                <div className='relative w-32 h-32 overflow-hidden border rounded-lg bg-primary/10 border-primary/20'>
                                    {form.watch('branding.logo') ? (
                                        <Image
                                            src={form.watch('branding.logo') || FALLBACK_LOGO}
                                            alt={form.watch('branding.logoAltText') || 'Company logo'}
                                            fill
                                            className='object-cover'
                                        />
                                    ) : (
                                        <div className='flex items-center justify-center w-full h-full'>
                                            <Upload className='w-8 h-8 text-muted-foreground' />
                                        </div>
                                    )}
                                </div>
                                <div className='space-y-2'>
                                    <FormField
                                        control={form.control}
                                        name='branding.logo'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className='text-xs font-normal uppercase font-body'>
                                                    Upload Logo
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type='file'
                                                        accept='image/*'
                                                        disabled={!isAdmin}
                                                        onChange={handleLogoUpload}
                                                        className='text-[10px] font-normal uppercase text-muted-foreground font-body placeholder:text-[10px]'
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='branding.logoAltText'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className='text-xs font-normal uppercase font-body'>
                                                    Logo Alt Text
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        disabled={!isAdmin}
                                                        placeholder='Company logo'
                                                        className='text-[10px] placeholder:text-[10px] font-normal uppercase text-muted-foreground font-body'
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Business Information Section */}
                        <div className='space-y-4'>
                            <h3 className='text-sm font-normal uppercase font-body'>Business Information</h3>
                            <div className='grid grid-cols-3 gap-6'>
                                <FormField
                                    control={form.control}
                                    name='business.name'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-normal uppercase font-body'>
                                                Business Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={!isAdmin}
                                                    placeholder='LORO'
                                                    className='text-xs placeholder:text-[10px]'
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='business.registrationNumber'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-normal uppercase font-body'>
                                                Registration Number
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={!isAdmin}
                                                    placeholder='2024/123456/07'
                                                    className='text-xs placeholder:text-[10px]'
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='business.taxId'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-normal uppercase font-body'>
                                                Tax ID
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={!isAdmin}
                                                    placeholder='VAT123456789'
                                                    className='text-xs placeholder:text-[10px]'
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='business.industry'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-normal uppercase font-body'>
                                                Industry
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={!isAdmin}
                                                    placeholder='Technology'
                                                    className='text-xs placeholder:text-[10px]'
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='business.size'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-normal uppercase font-body'>
                                                Business Size
                                            </FormLabel>
                                            <Select
                                                disabled={!isAdmin}
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select size' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='small'>Small</SelectItem>
                                                    <SelectItem value='medium'>Medium</SelectItem>
                                                    <SelectItem value='large'>Large</SelectItem>
                                                    <SelectItem value='enterprise'>Enterprise</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        <div className='space-y-4'>
                            <h3 className='text-sm font-normal uppercase font-body'>Contact Information</h3>
                            <div className='grid grid-cols-3 gap-6'>
                                <FormField
                                    control={form.control}
                                    name='contact.email'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-normal uppercase font-body'>
                                                Email
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={!isAdmin}
                                                    placeholder='info@loro.co.za'
                                                    className='text-xs placeholder:text-[10px]'
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='contact.phone'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-normal uppercase font-body'>
                                                Phone
                                            </FormLabel>
                                            <div className='flex gap-2'>
                                                <Select
                                                    disabled={!isAdmin}
                                                    onValueChange={value =>
                                                        field.onChange({ ...field.value, code: value })
                                                    }
                                                    value={field.value.code}
                                                >
                                                    <SelectTrigger className='w-[100px]'>
                                                        <SelectValue placeholder='Code' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value='+27'>+27</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Input
                                                    disabled={!isAdmin}
                                                    placeholder='123'
                                                    className='flex-1'
                                                    value={field.value.number}
                                                    onChange={e =>
                                                        field.onChange({ ...field.value, number: e.target.value })
                                                    }
                                                />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='contact.website'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-normal uppercase font-body'>
                                                Website
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={!isAdmin}
                                                    placeholder='https://loro.co.za'
                                                    className='text-xs placeholder:text-[10px]'
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='contact.address'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-normal uppercase font-body'>
                                                Address
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={!isAdmin}
                                                    placeholder='123 Innovation Drive, Midrand'
                                                    className='text-xs placeholder:text-[10px]'
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Regional Settings Section */}
                        <div className='space-y-4'>
                            <h3 className='text-sm font-normal uppercase font-body'>Regional Settings</h3>
                            <div className='grid grid-cols-3 gap-6'>
                                <FormField
                                    control={form.control}
                                    name='regional.language'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-normal uppercase font-body'>
                                                Language
                                            </FormLabel>
                                            <Select
                                                disabled={!isAdmin}
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select language' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='en'>English</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='regional.timezone'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-normal uppercase font-body'>
                                                Timezone
                                            </FormLabel>
                                            <Select
                                                disabled={!isAdmin}
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select timezone' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='SAST'>
                                                        South Africa Standard Time (SAST)
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='regional.currency'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-normal uppercase font-body'>
                                                Currency
                                            </FormLabel>
                                            <Select
                                                disabled={!isAdmin}
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select currency' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='ZAR'>ZAR (South African Rand)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='regional.dateFormat'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-normal uppercase font-body'>
                                                Date Format
                                            </FormLabel>
                                            <Select
                                                disabled={!isAdmin}
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select date format' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='DD/MM/YYYY'>DD/MM/YYYY</SelectItem>
                                                    <SelectItem value='MM/DD/YYYY'>MM/DD/YYYY</SelectItem>
                                                    <SelectItem value='YYYY-MM-DD'>YYYY-MM-DD</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='regional.timeFormat'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-normal uppercase font-body'>
                                                Time Format
                                            </FormLabel>
                                            <Select
                                                disabled={!isAdmin}
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select time format' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='12'>12-hour</SelectItem>
                                                    <SelectItem value='24'>24-hour</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <Button
                            type='submit'
                            disabled={!isAdmin || mutation.isPending}
                            className='w-4/12 self-end text-[10px] font-normal text-white uppercase font-body bg-primary'
                        >
                            {mutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
