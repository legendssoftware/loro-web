'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Loader2 } from 'lucide-react';
import { organizationSettingsApi } from '@/lib/services/organization-api';

const geofenceSchema = z.object({
    enabled: z.boolean().default(false),
    radius: z.number().min(10).max(10000),
    trackingInterval: z.number().min(5).max(600),
    alertDistance: z.number().min(5).max(1000),
});

export default function GeofenceSettingsForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const form = useForm<z.infer<typeof geofenceSchema>>({
        resolver: zodResolver(geofenceSchema),
        defaultValues: {
            enabled: false,
            radius: 100,
            trackingInterval: 60,
            alertDistance: 50,
        },
    });

    // Watch the enabled value to show/hide other settings
    const geofenceEnabled = form.watch('enabled');

    useEffect(() => {
        const fetchSettings = async () => {
            setIsInitialLoading(true);
            try {
                const settings = await organizationSettingsApi.getSettings();

                if (settings?.geofence) {
                    form.reset({
                        enabled: settings.geofence.enabled || false,
                        radius: settings.geofence.radius || 100,
                        trackingInterval:
                            settings.geofence.trackingInterval || 60,
                        alertDistance: settings.geofence.alertDistance || 50,
                    });
                }
            } catch (error: any) {
                console.error('Error fetching geofence settings:', error);
                
                if (error?.message?.includes('Organization reference not found') ||
                    error?.message?.includes('Please log in again')) {
                    showErrorToast('Please log in again to access your organization settings.', toast);
                } else if (error?.message?.includes('not found')) {
                    // Settings not created yet, use defaults
                    showSuccessToast('Geofence settings not found. Using default values.', toast);
                } else {
                    showErrorToast('Failed to load geofence settings. Please try again.', toast);
                }
            } finally {
                setIsInitialLoading(false);
            }
        };

        fetchSettings();
    }, [form]);

    async function onSubmit(values: z.infer<typeof geofenceSchema>) {
        setIsLoading(true);
        try {
            // Prepare data for server submission
            const settingsData = {
                geofence: {
                    ...values,
                },
            };

            console.log(
                'Geofence settings data to be sent to server:',
                settingsData,
            );

            // Submit data to server
            await organizationSettingsApi.updateSettings(settingsData);

            showSuccessToast('Geofence settings updated successfully', toast);
        } catch (error) {
            console.error('Error updating geofence settings:', error);
            showErrorToast(
                'Failed to update geofence settings. Please try again.',
                toast
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
                            Loading geofence settings...
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
                    Geofence Settings
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <FormField
                            control={form.control}
                            name="enabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-xs font-normal uppercase font-body">
                                            Enable Geofencing
                                        </FormLabel>
                                        <FormDescription className="text-[10px] font-thin uppercase font-body">
                                            Track when tasks are started within
                                            a defined radius
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {geofenceEnabled && (
                            <div className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="radius"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-normal uppercase font-body">
                                                Default Radius (meters)
                                            </FormLabel>
                                            <FormControl>
                                                <div className="space-y-4">
                                                    <Slider
                                                        min={10}
                                                        max={1000}
                                                        step={10}
                                                        defaultValue={[
                                                            field.value,
                                                        ]}
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            field.onChange(
                                                                value[0],
                                                            )
                                                        }
                                                    />
                                                    <div className="flex justify-between">
                                                        <span className="text-xs text-muted-foreground font-body">
                                                            10m
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            className="w-24 h-8 text-xs text-center font-body"
                                                            value={field.value}
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            min={10}
                                                            max={1000}
                                                        />
                                                        <span className="text-xs text-muted-foreground font-body">
                                                            1000m
                                                        </span>
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormDescription className="text-[10px] font-thin uppercase font-body">
                                                The default radius around a task
                                                location where users can check
                                                in
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="trackingInterval"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-normal uppercase font-body">
                                                Location Tracking Interval
                                                (seconds)
                                            </FormLabel>
                                            <FormControl>
                                                <div className="space-y-4">
                                                    <Slider
                                                        min={5}
                                                        max={600}
                                                        step={5}
                                                        defaultValue={[
                                                            field.value,
                                                        ]}
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            field.onChange(
                                                                value[0],
                                                            )
                                                        }
                                                    />
                                                    <div className="flex justify-between">
                                                        <span className="text-xs text-muted-foreground font-body">
                                                            5s
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            className="w-24 h-8 text-xs text-center font-body"
                                                            value={field.value}
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            min={5}
                                                            max={600}
                                                        />
                                                        <span className="text-xs text-muted-foreground font-body">
                                                            600s
                                                        </span>
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormDescription className="text-[10px] font-thin uppercase font-body">
                                                How frequently the app checks
                                                the user's location
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="alertDistance"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-normal uppercase font-body">
                                                Alert Distance (meters)
                                            </FormLabel>
                                            <FormControl>
                                                <div className="space-y-4">
                                                    <Slider
                                                        min={5}
                                                        max={500}
                                                        step={5}
                                                        defaultValue={[
                                                            field.value,
                                                        ]}
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            field.onChange(
                                                                value[0],
                                                            )
                                                        }
                                                    />
                                                    <div className="flex justify-between">
                                                        <span className="text-xs text-muted-foreground font-body">
                                                            5m
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            className="w-24 h-8 text-xs text-center font-body"
                                                            value={field.value}
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            min={5}
                                                            max={500}
                                                        />
                                                        <span className="text-xs text-muted-foreground font-body">
                                                            500m
                                                        </span>
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormDescription className="text-[10px] font-thin uppercase font-body">
                                                Distance from the task location
                                                when the user will receive
                                                notifications
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="text-xs font-thin text-white uppercase bg-primary font-body"
                            >
                                {isLoading && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
