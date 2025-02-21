import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getOrganisationAppearance, updateOrganisationAppearance } from '@/helpers/organizations';
import { toast } from 'sonner';
import { useSessionStore } from '@/store/use-session-store';
import { HexColorPicker } from 'react-colorful';
import { useState } from 'react';
import { appearanceFormSchema, type AppearanceFormValues } from '@/lib/schemas/settings';
import { Slider } from '@/components/ui/slider';
import { PageLoader } from '@/components/page-loader';

export function AppearanceForm() {
    const { profileData } = useSessionStore();
    const queryClient = useQueryClient();
    const isAdmin = profileData?.accessLevel === 'admin';
    const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

    const { data: appearanceData, isLoading } = useQuery({
        queryKey: ['organisationAppearance', profileData?.organisationRef],
        queryFn: () => getOrganisationAppearance(profileData?.organisationRef as string),
        enabled: !!profileData?.organisationRef,
    });

    const form = useForm<AppearanceFormValues>({
        resolver: zodResolver(appearanceFormSchema),
        defaultValues: {
            branding: {
                primaryColor: appearanceData?.appearance?.branding?.primaryColor || '#FC4A4A',
                secondaryColor: appearanceData?.appearance?.branding?.secondaryColor || '#2196F3',
                accentColor: appearanceData?.appearance?.branding?.accentColor || '#4CAF50',
                errorColor: appearanceData?.appearance?.branding?.errorColor || '#ff0000',
                successColor: appearanceData?.appearance?.branding?.successColor || '#00ff00',
                logo: appearanceData?.appearance?.branding?.logo,
                logoAltText: appearanceData?.appearance?.branding?.logoAltText,
                favicon: appearanceData?.appearance?.branding?.favicon,
                theme: appearanceData?.appearance?.branding?.theme || 'default',
                mode: appearanceData?.appearance?.branding?.mode || 'system',
                fontFamily: appearanceData?.appearance?.branding?.fontFamily || 'inter',
                fontSize: appearanceData?.appearance?.branding?.fontSize || 16,
            },
            customCss: appearanceData?.appearance?.customCss || {},
        },
    });

    const mutation = useMutation({
        mutationFn: (values: AppearanceFormValues) => {
            const settings = {
                ...values,
                preferences: {
                    defaultView: values.preferences?.defaultView ?? 'grid',
                    itemsPerPage: values.preferences?.itemsPerPage ?? 10,
                    theme: values.preferences?.theme ?? 'system',
                    menuCollapsed: values.preferences?.menuCollapsed ?? false,
                }
            };
            return updateOrganisationAppearance(profileData?.organisationRef as string, settings);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organisationAppearance'] });
            toast.success('Appearance updated successfully');
        },
        onError: error => {
            toast.error(error.message || 'Failed to update appearance');
        },
    });

    function onSubmit(values: AppearanceFormValues) {
        if (!isAdmin) {
            toast.error('Only administrators can update appearance');
            return;
        }
        mutation.mutate(values);
    }

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
                    <h2 className='font-normal uppercase text-md font-body'>Appearance Settings</h2>
                    <p className='text-xs font-normal uppercase font-body text-muted-foreground'>
                        Customize the look of your POS
                    </p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                        {/* Color Settings Section */}
                        <div className='space-y-4'>
                            <div className='grid grid-cols-3 gap-6'>
                                <FormField
                                    control={form.control}
                                    name='branding.primaryColor'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-normal uppercase font-body'>
                                                Primary Color
                                            </FormLabel>
                                            <div className='flex items-center gap-2'>
                                                <div
                                                    className='w-8 h-8 rounded cursor-pointer'
                                                    style={{ backgroundColor: field.value }}
                                                    onClick={() => setActiveColorPicker('primary')}
                                                />
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        disabled={!isAdmin}
                                                        className='text-xs uppercase'
                                                    />
                                                </FormControl>
                                                {activeColorPicker === 'primary' && (
                                                    <div className='absolute z-10 mt-2'>
                                                        <div
                                                            className='fixed inset-0'
                                                            onClick={() => setActiveColorPicker(null)}
                                                        />
                                                        <HexColorPicker color={field.value} onChange={field.onChange} />
                                                    </div>
                                                )}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='branding.secondaryColor'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-normal uppercase font-body'>
                                                Secondary Color
                                            </FormLabel>
                                            <div className='flex items-center gap-2'>
                                                <div
                                                    className='w-8 h-8 rounded cursor-pointer'
                                                    style={{ backgroundColor: field.value }}
                                                    onClick={() => setActiveColorPicker('secondary')}
                                                />
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        disabled={!isAdmin}
                                                        className='text-xs uppercase'
                                                    />
                                                </FormControl>
                                                {activeColorPicker === 'secondary' && (
                                                    <div className='absolute z-10 mt-2'>
                                                        <div
                                                            className='fixed inset-0'
                                                            onClick={() => setActiveColorPicker(null)}
                                                        />
                                                        <HexColorPicker color={field.value} onChange={field.onChange} />
                                                    </div>
                                                )}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='branding.accentColor'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-normal uppercase font-body'>
                                                Accent Color
                                            </FormLabel>
                                            <div className='flex items-center gap-2'>
                                                <div
                                                    className='w-8 h-8 rounded cursor-pointer'
                                                    style={{ backgroundColor: field.value }}
                                                    onClick={() => setActiveColorPicker('accent')}
                                                />
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        disabled={!isAdmin}
                                                        className='text-xs uppercase'
                                                    />
                                                </FormControl>
                                                {activeColorPicker === 'accent' && (
                                                    <div className='absolute z-10 mt-2'>
                                                        <div
                                                            className='fixed inset-0'
                                                            onClick={() => setActiveColorPicker(null)}
                                                        />
                                                        <HexColorPicker color={field.value} onChange={field.onChange} />
                                                    </div>
                                                )}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Theme Settings */}
                        <div className='space-y-4'>
                            <h3 className='text-sm font-normal uppercase font-body'>Theme Preset</h3>
                            <div className='grid grid-cols-2 gap-6'>
                                <FormField
                                    control={form.control}
                                    name='branding.theme'
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select
                                                disabled={!isAdmin}
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger className='bg-card'>
                                                    <SelectValue placeholder='Select theme' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='default' className='text-[10px] font-normal uppercase font-body cursor-pointer'>Default (shadcn/ui)</SelectItem>
                                                    <SelectItem value='modern' className='text-[10px] font-normal uppercase font-body cursor-pointer'>Modern</SelectItem>
                                                    <SelectItem value='classic' className='text-[10px] font-normal uppercase font-body cursor-pointer'>Classic</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='branding.mode'
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select
                                                disabled={!isAdmin}
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger className='bg-card'>
                                                    <SelectValue placeholder='Select mode' className='text-[10px] font-normal uppercase font-body cursor-pointer' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='system' className='text-[10px] font-normal uppercase font-body cursor-pointer'>System</SelectItem>
                                                    <SelectItem value='light' className='text-[10px] font-normal uppercase font-body cursor-pointer'>Light</SelectItem>
                                                    <SelectItem value='dark' className='text-[10px] font-normal uppercase font-body cursor-pointer'>Dark</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Font Settings */}
                        <div className='space-y-4'>
                            <h3 className='text-sm font-normal uppercase font-body'>Font Settings</h3>
                            <div className='grid grid-cols-2 gap-6'>
                                <FormField
                                    control={form.control}
                                    name='branding.fontFamily'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-normal uppercase font-body'>
                                                Font Family
                                            </FormLabel>
                                            <Select
                                                disabled={!isAdmin}
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger className='bg-card'>
                                                    <SelectValue placeholder='Select font' className='text-[10px] font-normal uppercase font-body cursor-pointer' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='inter' className='text-[10px] font-normal uppercase font-body'>Inter</SelectItem>
                                                    <SelectItem value='roboto' className='text-[10px] font-normal uppercase font-body'>Roboto</SelectItem>
                                                    <SelectItem value='poppins' className='text-[10px] font-normal uppercase font-body'>Poppins</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='branding.fontSize'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-normal uppercase font-body'>
                                                Font Size
                                            </FormLabel>
                                            <div className='flex flex-col gap-2'>
                                                <div className='flex items-center gap-4'>
                                                    <Slider
                                                        disabled={!isAdmin}
                                                        value={[field.value]}
                                                        onValueChange={([value]) => field.onChange(value)}
                                                        max={24}
                                                        min={12}
                                                        step={1}
                                                        className='bg-card'
                                                    />
                                                    <span className='text-xs font-normal uppercase text-muted-foreground font-body'>{field.value}px</span>
                                                </div>
                                                <p
                                                    style={{ fontSize: `${field.value}px` }}
                                                    className='font-normal uppercase text-muted-foreground font-body'
                                                >
                                                    Testing awesome loro
                                                </p>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Error and Success Colors */}
                        <div className='space-y-4'>
                            <h3 className='text-sm font-normal uppercase font-body'>System Colors</h3>
                            <div className='grid grid-cols-2 gap-6'>
                                <FormField
                                    control={form.control}
                                    name='branding.errorColor'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-normal uppercase font-body'>
                                                Error Color
                                            </FormLabel>
                                            <div className='flex items-center gap-2'>
                                                <div
                                                    className='w-8 h-8 rounded cursor-pointer'
                                                    style={{ backgroundColor: field.value }}
                                                    onClick={() => setActiveColorPicker('error')}
                                                />
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        disabled={!isAdmin}
                                                        className='text-xs uppercase'
                                                    />
                                                </FormControl>
                                                {activeColorPicker === 'error' && (
                                                    <div className='absolute z-10 mt-2'>
                                                        <div
                                                            className='fixed inset-0'
                                                            onClick={() => setActiveColorPicker(null)}
                                                        />
                                                        <HexColorPicker color={field.value} onChange={field.onChange} />
                                                    </div>
                                                )}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='branding.successColor'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-normal uppercase font-body'>
                                                Success Color
                                            </FormLabel>
                                            <div className='flex items-center gap-2'>
                                                <div
                                                    className='w-8 h-8 rounded cursor-pointer'
                                                    style={{ backgroundColor: field.value }}
                                                    onClick={() => setActiveColorPicker('success')}
                                                />
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        disabled={!isAdmin}
                                                        className='text-xs uppercase'
                                                    />
                                                </FormControl>
                                                {activeColorPicker === 'success' && (
                                                    <div className='absolute z-10 mt-2'>
                                                        <div
                                                            className='fixed inset-0'
                                                            onClick={() => setActiveColorPicker(null)}
                                                        />
                                                        <HexColorPicker color={field.value} onChange={field.onChange} />
                                                    </div>
                                                )}
                                            </div>
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
