'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { organizationAppearanceApi } from '@/lib/services/organization-api';

const appearanceSchema = z.object({
    primaryColor: z.string().min(4, 'Please enter a valid color'),
    secondaryColor: z.string().min(4, 'Please enter a valid color'),
    accentColor: z.string().min(4, 'Please enter a valid color'),
    errorColor: z.string().min(4, 'Please enter a valid color'),
    successColor: z.string().min(4, 'Please enter a valid color'),
    logoUrl: z
        .string()
        .url('Please enter a valid URL')
        .or(z.string().length(0)),
    logoAltText: z.string(),
    theme: z.enum(['light', 'dark', 'system']),
    customFont: z.string().optional(),
    customCss: z.string().optional(),
});

export default function AppearanceForm() {
    const [activeTab, setActiveTab] = useState('branding');
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [originalAppearance, setOriginalAppearance] = useState<z.infer<
        typeof appearanceSchema
    > | null>(null);

    const form = useForm<z.infer<typeof appearanceSchema>>({
        resolver: zodResolver(appearanceSchema),
        defaultValues: {
            primaryColor: '#4f46e5',
            secondaryColor: '#6b7280',
            accentColor: '#f97316',
            errorColor: '#ef4444',
            successColor: '#22c55e',
            logoUrl: '',
            logoAltText: 'Company Logo',
            theme: 'light',
            customFont: '',
            customCss: '',
        },
    });

    useEffect(() => {
        const fetchAppearance = async () => {
            setIsInitialLoading(true);
            try {
                const appearance =
                    await organizationAppearanceApi.getAppearance();

                const formattedAppearance = {
                    primaryColor: appearance.primaryColor || '#4f46e5',
                    secondaryColor: appearance.secondaryColor || '#6b7280',
                    accentColor: appearance.accentColor || '#f97316',
                    errorColor: appearance.errorColor || '#ef4444',
                    successColor: appearance.successColor || '#22c55e',
                    logoUrl: appearance.logoUrl || '',
                    logoAltText: appearance.logoAltText || 'Company Logo',
                    theme: appearance.theme || 'light',
                    customFont: appearance.customFont || '',
                    customCss: appearance.customCss || '',
                };

                setOriginalAppearance(formattedAppearance);
                form.reset(formattedAppearance);
            } catch (error) {
                console.error('Error fetching appearance settings:', error);
                toast.error(
                    'Failed to load appearance settings. Please try again.',
                );
            } finally {
                setIsInitialLoading(false);
            }
        };

        fetchAppearance();
    }, [form]);

    // Helper function to get only the changed fields
    const getChangedFields = (
        currentValues: z.infer<typeof appearanceSchema>,
    ) => {
        if (!originalAppearance) return currentValues;

        const changedFields: Partial<z.infer<typeof appearanceSchema>> = {};

        Object.keys(currentValues).forEach((key) => {
            const typedKey = key as keyof z.infer<typeof appearanceSchema>;
            if (currentValues[typedKey] !== originalAppearance[typedKey]) {
                changedFields[typedKey] = currentValues[typedKey] as any;
            }
        });

        return changedFields;
    };

    async function onSubmit(values: z.infer<typeof appearanceSchema>) {
        setIsLoading(true);
        try {
            // Get only changed fields
            const changedFields = getChangedFields(values);

            // Only send update if there are changes
            if (Object.keys(changedFields).length > 0) {
                await organizationAppearanceApi.updateAppearance(changedFields);
                setOriginalAppearance(values); // Update original values
                toast.success('Appearance settings updated successfully');
            } else {
                toast.success('No changes to save');
            }
        } catch (error) {
            console.error('Error updating appearance settings:', error);
            toast.error(
                'Failed to update appearance settings. Please try again.',
            );
        } finally {
            setIsLoading(false);
        }
    }

    // Show loading state while fetching initial data
    if (isInitialLoading) {
        return (
            <Card className="border-border/50">
                <CardContent className="flex items-center justify-center p-8">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
                        <p className="text-xs font-normal uppercase font-body">
                            Loading appearance settings...
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50">
            <CardHeader>
                <CardTitle className="text-xl font-thin uppercase font-body">
                    Appearance Settings
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            defaultValue="branding"
                        >
                            <div className="flex items-center mb-6 overflow-x-auto border-b border-border/10">
                                {['branding', 'theme', 'customization'].map(
                                    (tab) => (
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
                                                onClick={() =>
                                                    setActiveTab(tab)
                                                }
                                            >
                                                <span className="text-xs font-thin uppercase font-body">
                                                    {tab
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        tab.slice(1)}
                                                </span>
                                            </div>
                                            {activeTab === tab && (
                                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-primary" />
                                            )}
                                        </div>
                                    ),
                                )}
                            </div>

                            <TabsContent value="branding" className="space-y-4">
                                <div className="space-y-4">
                                    <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                                        <div className="w-full md:w-1/2">
                                            <FormField
                                                control={form.control}
                                                name="primaryColor"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-normal uppercase font-body">
                                                            Primary Color
                                                        </FormLabel>
                                                        <div className="flex space-x-2">
                                                            <input
                                                                type="color"
                                                                className="w-10 h-10 border rounded-md cursor-pointer font-body"
                                                                {...field}
                                                            />
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    className="text-[10px] font-thin uppercase font-body"
                                                                />
                                                            </FormControl>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="w-full md:w-1/2">
                                            <FormField
                                                control={form.control}
                                                name="secondaryColor"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-normal uppercase font-body">
                                                            Secondary Color
                                                        </FormLabel>
                                                        <div className="flex space-x-2">
                                                            <input
                                                                type="color"
                                                                className="w-10 h-10 rounded outline-none cursor-pointer"
                                                                {...field}
                                                            />
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    className="text-[10px] font-thin uppercase font-body"
                                                                />
                                                            </FormControl>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                                        <div className="w-full md:w-1/3">
                                            <FormField
                                                control={form.control}
                                                name="accentColor"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-normal uppercase font-body">
                                                            Accent Color
                                                        </FormLabel>
                                                        <div className="flex space-x-2">
                                                            <input
                                                                type="color"
                                                                className="w-10 h-10 border rounded-md cursor-pointer"
                                                                {...field}
                                                            />
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    className="text-[10px] font-thin uppercase font-body"
                                                                />
                                                            </FormControl>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="w-full md:w-1/3">
                                            <FormField
                                                control={form.control}
                                                name="errorColor"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-normal uppercase font-body">
                                                            Error Color
                                                        </FormLabel>
                                                        <div className="flex space-x-2">
                                                            <input
                                                                type="color"
                                                                className="w-10 h-10 border rounded-md cursor-pointer"
                                                                {...field}
                                                            />
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    className="text-[10px] font-thin uppercase font-body"
                                                                />
                                                            </FormControl>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="w-full md:w-1/3">
                                            <FormField
                                                control={form.control}
                                                name="successColor"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-normal uppercase font-body">
                                                            Success Color
                                                        </FormLabel>
                                                        <div className="flex space-x-2">
                                                            <input
                                                                type="color"
                                                                className="w-10 h-10 border rounded-md cursor-pointer"
                                                                {...field}
                                                            />
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    className="text-[10px] font-thin uppercase font-body"
                                                                />
                                                            </FormControl>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8 space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="logoUrl"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-normal uppercase font-body">
                                                        Logo URL
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="https://example.com/logo.png"
                                                        />
                                                    </FormControl>
                                                    <FormDescription className="text-[10px] font-thin uppercase font-body">
                                                        Enter the URL for your
                                                        company logo
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="logoAltText"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-normal uppercase font-body">
                                                        Logo Alt Text
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Company Logo"
                                                            className="text-[10px] font-thin uppercase font-body"
                                                        />
                                                    </FormControl>
                                                    <FormDescription className="text-[10px] font-thin uppercase font-body">
                                                        Alternative text for
                                                        your logo image
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {form.watch('logoUrl') && (
                                            <div className="mt-4">
                                                <p className="mb-2 text-xs font-normal uppercase font-body">
                                                    Logo Preview
                                                </p>
                                                <div className="flex items-center justify-center w-full h-20 p-2 border rounded-md">
                                                    <img
                                                        src={form.watch(
                                                            'logoUrl',
                                                        )}
                                                        alt={form.watch(
                                                            'logoAltText',
                                                        )}
                                                        className="object-contain max-w-full max-h-full"
                                                        onError={(e) => {
                                                            e.currentTarget.src =
                                                                'https://placehold.co/300x150?text=Invalid+Image';
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="theme" className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="theme"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-normal uppercase font-body">
                                                Theme
                                            </FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                    className="grid grid-cols-1 gap-8 pt-2 md:grid-cols-3"
                                                >
                                                    <FormItem className="relative flex flex-col items-center p-4 space-y-3 border rounded-md hover:shadow-sm">
                                                        <FormControl>
                                                            <RadioGroupItem
                                                                value="light"
                                                                className="absolute right-2 top-2"
                                                            />
                                                        </FormControl>
                                                        <div className="w-full space-y-1 text-center">
                                                            <div className="w-full h-20 mb-2 bg-white border rounded-md"></div>
                                                            <FormLabel className="text-xs font-normal uppercase font-body">
                                                                Light
                                                            </FormLabel>
                                                            <FormDescription className="text-[10px] font-thin uppercase font-body">
                                                                Clean, bright
                                                                interface
                                                            </FormDescription>
                                                        </div>
                                                    </FormItem>
                                                    <FormItem className="relative flex flex-col items-center p-4 space-y-3 border rounded-md hover:shadow-sm">
                                                        <FormControl>
                                                            <RadioGroupItem
                                                                value="dark"
                                                                className="absolute right-2 top-2"
                                                            />
                                                        </FormControl>
                                                        <div className="w-full space-y-1 text-center">
                                                            <div className="w-full h-20 mb-2 rounded-md bg-slate-900"></div>
                                                            <FormLabel className="text-xs font-normal uppercase font-body">
                                                                Dark
                                                            </FormLabel>
                                                            <FormDescription className="text-[10px] font-thin uppercase font-body">
                                                                Easy on the eyes
                                                            </FormDescription>
                                                        </div>
                                                    </FormItem>
                                                    <FormItem className="relative flex flex-col items-center p-4 space-y-3 border rounded-md hover:shadow-sm">
                                                        <FormControl>
                                                            <RadioGroupItem
                                                                value="system"
                                                                className="absolute right-2 top-2"
                                                            />
                                                        </FormControl>
                                                        <div className="w-full space-y-1 text-center">
                                                            <div className="w-full h-20 mb-2 rounded-md bg-gradient-to-r from-white to-slate-900"></div>
                                                            <FormLabel className="text-xs font-normal uppercase font-body">
                                                                System
                                                            </FormLabel>
                                                            <FormDescription className="text-[10px] font-thin uppercase font-body">
                                                                Follows device
                                                                preference
                                                            </FormDescription>
                                                        </div>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            <TabsContent
                                value="customization"
                                className="space-y-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="customFont"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-normal uppercase font-body">
                                                Custom Font
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter Google Font name or URL"
                                                />
                                            </FormControl>
                                            <FormDescription className="text-[10px] font-thin uppercase font-body">
                                                Enter a Google Font name (e.g.,
                                                "Roboto") or the URL to your
                                                custom font
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="customCss"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-normal uppercase font-body">
                                                Custom CSS
                                            </FormLabel>
                                            <FormControl>
                                                <textarea
                                                    className="flex w-full px-3 py-2 text-sm border rounded-md min-h-24 border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    placeholder=":root { --custom-variable: value; }"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription className="text-[10px] font-thin uppercase font-body">
                                                Add custom CSS variables or
                                                overrides (use with caution)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>
                        </Tabs>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full text-xs font-thin text-white uppercase md:w-auto font-body bg-primary"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
