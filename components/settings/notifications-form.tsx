'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
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
import { Loader2 } from 'lucide-react';
import { organizationSettingsApi } from '@/lib/services/organization-api';

const notificationsSchema = z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    push: z.boolean().default(true),
    whatsapp: z.boolean().default(false),
    taskNotifications: z.boolean().default(true),
    feedbackTokenExpiryDays: z.number().int().min(1).max(30),
});

export default function NotificationsForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const form = useForm<z.infer<typeof notificationsSchema>>({
        resolver: zodResolver(notificationsSchema),
        defaultValues: {
            email: true,
            sms: false,
            push: true,
            whatsapp: false,
            taskNotifications: true,
            feedbackTokenExpiryDays: 7,
        },
    });

    // Fetch notification settings when component mounts
    useEffect(() => {
        const fetchSettings = async () => {
            setIsInitialLoading(true);
            try {
                const settings = await organizationSettingsApi.getSettings();

                if (settings?.notifications) {
                    form.reset({
                        email: settings.notifications.email ?? true,
                        sms: settings.notifications.sms ?? false,
                        push: settings.notifications.push ?? true,
                        whatsapp: settings.notifications.whatsapp ?? false,
                        taskNotifications:
                            settings.notifications.taskNotifications ?? true,
                        feedbackTokenExpiryDays:
                            settings.notifications.feedbackTokenExpiryDays ?? 7,
                    });
                }
            } catch (error) {
                console.error('Error fetching notification settings:', error);
                toast.error(
                    'Failed to load notification settings. Please try again.',
                );
            } finally {
                setIsInitialLoading(false);
            }
        };

        fetchSettings();
    }, [form]);

    async function onSubmit(values: z.infer<typeof notificationsSchema>) {
        setIsLoading(true);
        try {
            // Prepare data for server submission
            const settingsData = {
                notifications: {
                    ...values,
                },
            };

            console.log(
                'Notification settings data to be sent to server:',
                settingsData,
            );

            // Submit data to server
            await organizationSettingsApi.updateSettings(settingsData);

            toast.success('Notification settings updated successfully');
        } catch (error) {
            console.error('Error updating notification settings:', error);
            toast.error(
                'Failed to update notification settings. Please try again.',
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
                            Loading notification settings...
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
                    Notification Settings
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <div className="space-y-4">
                            <h3 className="text-sm font-thin uppercase font-body u">
                                Notification Channels
                            </h3>
                            <p className="text-[10px] font-thin uppercase text-muted-foreground font-body">
                                Select which channels you'd like to receive
                                notifications on.
                            </p>

                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-xs font-thin uppercase font-body">
                                                    Email Notifications
                                                </FormLabel>
                                                <FormDescription className="text-[10px] font-thin uppercase font-body">
                                                    Receive notifications and
                                                    updates via email
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="sms"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-xs font-thin uppercase font-body">
                                                    SMS Notifications
                                                </FormLabel>
                                                <FormDescription className="text-[10px] font-thin uppercase font-body">
                                                    Receive text message alerts
                                                    for important updates
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="push"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-xs font-thin uppercase font-body">
                                                    Push Notifications
                                                </FormLabel>
                                                <FormDescription className="text-[10px] font-thin uppercase font-body">
                                                    Receive in-app and mobile
                                                    push notifications
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="whatsapp"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-xs font-thin uppercase font-body">
                                                    WhatsApp Notifications
                                                </FormLabel>
                                                <FormDescription className="text-[10px] font-thin uppercase font-body">
                                                    Receive notifications via
                                                    WhatsApp messages
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="pt-6 space-y-4 border-t">
                            <h3 className="text-sm font-medium font-body">
                                Task Notifications
                            </h3>

                            <FormField
                                control={form.control}
                                name="taskNotifications"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-xs font-thin uppercase font-body">
                                                Enable Task Notifications
                                            </FormLabel>
                                            <FormDescription className="text-[10px] font-thin uppercase font-body">
                                                Notify users about task
                                                assignments, updates, and
                                                deadlines
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

                            <FormField
                                control={form.control}
                                name="feedbackTokenExpiryDays"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-thin uppercase font-body">
                                            Feedback Token Expiry (Days)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={30}
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormDescription className="text-[10px] font-thin uppercase font-body">
                                            Number of days before feedback
                                            tokens expire (1-30 days)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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
