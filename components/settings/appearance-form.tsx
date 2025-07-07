'use client';

import { useState } from 'react';
import {
    Card,
    CardContent,
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
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import { useAppearanceSettings } from '@/hooks/use-organization-settings';
import { toast } from 'react-hot-toast';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';

export default function AppearanceForm() {
    const [activeTab, setActiveTab] = useState('branding');
    
    const {
        form,
        data,
        isLoading,
        isSaving,
        error,
        handleSubmit,
        isDirty,
    } = useAppearanceSettings();

    // Show loading state while fetching initial data
    if (isLoading) {
        return (
            <Card className="border-border/50">
                <CardContent className="flex justify-center items-center p-8">
                    <div className="text-center">
                        <Loader2 className="mx-auto mb-4 w-8 h-8 animate-spin" />
                        <p className="text-xs font-normal uppercase font-body">
                            Loading appearance settings...
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Show error state if there's an error
    if (error) {
        return (
            <Card className="border-border/50">
                <CardContent className="p-8">
                    <div className="text-center text-red-500">
                        <p className="text-xs font-normal uppercase font-body">
                            Error loading appearance settings: {error.message}
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
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-6"
                    >
                        {/* Status indicator */}
                        {(isDirty || isSaving) && (
                            <div className="flex justify-between items-center mb-2 text-xs">
                                {isDirty && !isSaving && (
                                    <span className="text-amber-500 dark:text-amber-400">
                                        Changes not saved
                                    </span>
                                )}
                                {isSaving && (
                                    <span className="text-blue-500 dark:text-blue-400">
                                        Saving changes...
                                    </span>
                                )}
                                {!isDirty && !isSaving && (
                                    <span className="text-green-500 dark:text-green-400">
                                        Changes saved
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="flex overflow-x-auto items-center mb-6 border-b border-border/10">
                                {['branding', 'theme', 'customization'].map(
                                    (tab) => (
                                        <div
                                            key={tab}
                                        className="flex relative gap-1 justify-center items-center mr-8 w-28 cursor-pointer"
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

                        {activeTab === 'branding' && (
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
                                                            className="w-10 h-10 rounded-md border cursor-pointer font-body"
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
                                                            className="w-10 h-10 rounded cursor-pointer outline-none"
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
                                                            className="w-10 h-10 rounded-md border cursor-pointer"
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
                                                            className="w-10 h-10 rounded-md border cursor-pointer"
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
                                                            className="w-10 h-10 rounded-md border cursor-pointer"
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
                                            <div className="flex justify-center items-center p-2 w-full h-20 rounded-md border">
                                                <img
                                                    src={form.watch('logoUrl')}
                                                    alt={form.watch('logoAltText')}
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
                        )}

                        {activeTab === 'theme' && (
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
                                                onValueChange={field.onChange}
                                                    value={field.value}
                                                    className="grid grid-cols-1 gap-8 pt-2 md:grid-cols-3"
                                                >
                                                <FormItem className="flex relative flex-col items-center p-4 space-y-3 rounded-md border hover:shadow-sm">
                                                        <FormControl>
                                                            <RadioGroupItem
                                                                value="light"
                                                            className="absolute top-2 right-2"
                                                            />
                                                        </FormControl>
                                                    <div className="space-y-1 w-full text-center">
                                                        <div className="mb-2 w-full h-20 bg-white rounded-md border"></div>
                                                            <FormLabel className="text-xs font-normal uppercase font-body">
                                                                Light
                                                            </FormLabel>
                                                            <FormDescription className="text-[10px] font-thin uppercase font-body">
                                                                Clean, bright
                                                                interface
                                                            </FormDescription>
                                                        </div>
                                                    </FormItem>
                                                <FormItem className="flex relative flex-col items-center p-4 space-y-3 rounded-md border hover:shadow-sm">
                                                        <FormControl>
                                                            <RadioGroupItem
                                                                value="dark"
                                                            className="absolute top-2 right-2"
                                                            />
                                                        </FormControl>
                                                    <div className="space-y-1 w-full text-center">
                                                        <div className="mb-2 w-full h-20 rounded-md bg-slate-900"></div>
                                                            <FormLabel className="text-xs font-normal uppercase font-body">
                                                                Dark
                                                            </FormLabel>
                                                            <FormDescription className="text-[10px] font-thin uppercase font-body">
                                                                Easy on the eyes
                                                            </FormDescription>
                                                        </div>
                                                    </FormItem>
                                                <FormItem className="flex relative flex-col items-center p-4 space-y-3 rounded-md border hover:shadow-sm">
                                                        <FormControl>
                                                            <RadioGroupItem
                                                                value="system"
                                                            className="absolute top-2 right-2"
                                                            />
                                                        </FormControl>
                                                    <div className="space-y-1 w-full text-center">
                                                        <div className="mb-2 w-full h-20 bg-gradient-to-r from-white rounded-md to-slate-900"></div>
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
                        )}

                        {activeTab === 'customization' && (
                            <div className="space-y-4">
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
                                                    className="flex px-3 py-2 w-full text-sm rounded-md border min-h-24 border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="w-full text-xs font-thin text-white uppercase md:w-auto font-body bg-primary"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
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
