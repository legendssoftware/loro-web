'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
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
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, Clock, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { organizationHoursApi } from '@/lib/services/organization-api';

// Time options for the schedule
const timeOptions = [
    '00:00',
    '00:30',
    '01:00',
    '01:30',
    '02:00',
    '02:30',
    '03:00',
    '03:30',
    '04:00',
    '04:30',
    '05:00',
    '05:30',
    '06:00',
    '06:30',
    '07:00',
    '07:30',
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
    '19:00',
    '19:30',
    '20:00',
    '20:30',
    '21:00',
    '21:30',
    '22:00',
    '22:30',
    '23:00',
    '23:30',
];

// Timezone options (simplified list)
const timezoneOptions = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Australia/Brisbane',
    'Australia/Perth',
    'Australia/Adelaide',
    'Australia/Gold_Coast',
    'Australia/New_Castle',
    'Pacific/Auckland',
    'Pacific/Honolulu',
    'Pacific/Fiji',
    'Pacific/Guam',
    'Pacific/Tongatapu',
    'Pacific/Tarawa',
    'Pretoria',
    'Johannesburg',
    'Cape_Town',
    'Durban',
    'Port_Elizabeth',
    'Bloemfontein',
    'Polokwane',
];

// Define the day schedule schema for each day
const dayScheduleSchema = z.object({
    start: z.string(),
    end: z.string(),
    closed: z.boolean(),
});

// Define the schema for the form
const hoursSchema = z.object({
    schedule: z.object({
        monday: dayScheduleSchema,
        tuesday: dayScheduleSchema,
        wednesday: dayScheduleSchema,
        thursday: dayScheduleSchema,
        friday: dayScheduleSchema,
        saturday: dayScheduleSchema,
        sunday: dayScheduleSchema,
    }),
    timezone: z.string(),
    holidayMode: z.boolean(),
    holidayUntil: z.date().optional().nullable(),
});

export default function BusinessHoursForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const form = useForm<z.infer<typeof hoursSchema>>({
        resolver: zodResolver(hoursSchema),
        defaultValues: {
            schedule: {
                monday: { start: '09:00', end: '17:00', closed: false },
                tuesday: { start: '09:00', end: '17:00', closed: false },
                wednesday: { start: '09:00', end: '17:00', closed: false },
                thursday: { start: '09:00', end: '17:00', closed: false },
                friday: { start: '09:00', end: '17:00', closed: false },
                saturday: { start: '10:00', end: '16:00', closed: true },
                sunday: { start: '10:00', end: '16:00', closed: true },
            },
            timezone: 'UTC',
            holidayMode: false,
            holidayUntil: null,
        },
    });

    // Watch holiday mode to conditionally show date picker
    const holidayMode = form.watch('holidayMode');

    // Fetch current hours when component mounts
    useEffect(() => {
        const fetchHours = async () => {
            setIsInitialLoading(true);
            try {
                const hours = await organizationHoursApi.getHours();

                // Reset form with fetched hours
                form.reset({
                    schedule: hours.schedule || {
                        monday: { start: '09:00', end: '17:00', closed: false },
                        tuesday: {
                            start: '09:00',
                            end: '17:00',
                            closed: false,
                        },
                        wednesday: {
                            start: '09:00',
                            end: '17:00',
                            closed: false,
                        },
                        thursday: {
                            start: '09:00',
                            end: '17:00',
                            closed: false,
                        },
                        friday: { start: '09:00', end: '17:00', closed: false },
                        saturday: {
                            start: '10:00',
                            end: '16:00',
                            closed: true,
                        },
                        sunday: { start: '10:00', end: '16:00', closed: true },
                    },
                    timezone: hours.timezone || 'UTC',
                    holidayMode: hours.holidayMode || false,
                    holidayUntil: hours.holidayUntil
                        ? new Date(hours.holidayUntil)
                        : null,
                });
            } catch (error) {
                console.error('Error fetching business hours:', error);
                toast.error('Failed to load business hours. Please try again.');
            } finally {
                setIsInitialLoading(false);
            }
        };

        fetchHours();
    }, [form]);

    async function onSubmit(values: z.infer<typeof hoursSchema>) {
        setIsLoading(true);
        try {
            // Prepare data for submission
            const hoursData = {
                ...values,
                // Convert Date object to ISO string if it exists
                holidayUntil: values.holidayUntil
                    ? values.holidayUntil.toISOString()
                    : undefined,
            };

            console.log('Business hours data to be sent to server:', hoursData);

            // Submit data to server
            await organizationHoursApi.updateHours(hoursData);

            toast.success('Business hours updated successfully');
        } catch (error) {
            console.error('Error updating business hours:', error);
            toast.error('Failed to update business hours. Please try again.');
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
                            Loading business hours...
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
                    Business Hours
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <div className="space-y-6">
                            <FormField
                                control={form.control}
                                name="timezone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-normal uppercase font-body">
                                            Timezone
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select timezone" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {timezoneOptions.map(
                                                    (timezone) => (
                                                        <SelectItem
                                                            key={timezone}
                                                            value={timezone}
                                                            className="text-[10px] font-thin uppercase font-body"
                                                        >
                                                            {timezone}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription className="text-[10px] font-thin uppercase font-body">
                                            Your business hours will be
                                            displayed in this timezone
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div>
                                <h3 className="mb-4 text-sm font-thin uppercase font-body">
                                    Weekly Schedule
                                </h3>
                                <div className="space-y-4">
                                    {/* Monday */}
                                    <DaySchedule
                                        day="monday"
                                        label="Monday"
                                        form={form}
                                        timeOptions={timeOptions}
                                    />

                                    {/* Tuesday */}
                                    <DaySchedule
                                        day="tuesday"
                                        label="Tuesday"
                                        form={form}
                                        timeOptions={timeOptions}
                                    />

                                    {/* Wednesday */}
                                    <DaySchedule
                                        day="wednesday"
                                        label="Wednesday"
                                        form={form}
                                        timeOptions={timeOptions}
                                    />

                                    {/* Thursday */}
                                    <DaySchedule
                                        day="thursday"
                                        label="Thursday"
                                        form={form}
                                        timeOptions={timeOptions}
                                    />

                                    {/* Friday */}
                                    <DaySchedule
                                        day="friday"
                                        label="Friday"
                                        form={form}
                                        timeOptions={timeOptions}
                                    />

                                    {/* Saturday */}
                                    <DaySchedule
                                        day="saturday"
                                        label="Saturday"
                                        form={form}
                                        timeOptions={timeOptions}
                                    />

                                    {/* Sunday */}
                                    <DaySchedule
                                        day="sunday"
                                        label="Sunday"
                                        form={form}
                                        timeOptions={timeOptions}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <FormField
                                    control={form.control}
                                    name="holidayMode"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-xs font-normal uppercase font-body">
                                                    Holiday Mode
                                                </FormLabel>
                                                <FormDescription className="text-[10px] font-thin uppercase font-body">
                                                    When enabled, your business
                                                    will appear as closed
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

                                {holidayMode && (
                                    <div className="mt-4">
                                        <FormField
                                            control={form.control}
                                            name="holidayUntil"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel className="text-xs font-normal uppercase font-body">
                                                        Closed Until
                                                    </FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant="outline"
                                                                    className={cn(
                                                                        'w-full pl-3 text-left font-normal',
                                                                        !field.value &&
                                                                            'text-muted-foreground',
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(
                                                                            field.value,
                                                                            'PPP',
                                                                        )
                                                                    ) : (
                                                                        <span>
                                                                            Pick
                                                                            a
                                                                            date
                                                                        </span>
                                                                    )}
                                                                    <CalendarIcon className="w-4 h-4 ml-auto opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent
                                                            className="w-auto p-0"
                                                            align="start"
                                                        >
                                                            <Calendar
                                                                mode="single"
                                                                selected={
                                                                    field.value ||
                                                                    undefined
                                                                }
                                                                onSelect={
                                                                    field.onChange
                                                                }
                                                                disabled={(
                                                                    date,
                                                                ) =>
                                                                    date <
                                                                    new Date()
                                                                }
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormDescription>
                                                        Your business will
                                                        appear as closed until
                                                        this date
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="text-xs font-thin text-white uppercase font-body bg-primary"
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

// Component for daily schedule inputs
type DayScheduleProps = {
    day:
        | 'monday'
        | 'tuesday'
        | 'wednesday'
        | 'thursday'
        | 'friday'
        | 'saturday'
        | 'sunday';
    label: string;
    form: any;
    timeOptions: string[];
};

function DaySchedule({ day, label, form, timeOptions }: DayScheduleProps) {
    const closed = form.watch(`schedule.${day}.closed`);

    return (
        <div className="grid grid-cols-12 gap-4 p-4 border rounded-md">
            <div className="flex items-center col-span-12 sm:col-span-3">
                <h4 className="text-xs font-thin uppercase font-body">
                    {label}
                </h4>
            </div>
            <div className="flex items-center col-span-12 sm:col-span-3">
                <FormField
                    control={form.control}
                    name={`schedule.${day}.closed`}
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between space-x-2">
                            <FormLabel className="text-xs font-thin uppercase font-body">
                                Closed
                            </FormLabel>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>

            {!closed && (
                <>
                    <div className="col-span-12 sm:col-span-3">
                        <FormField
                            control={form.control}
                            name={`schedule.${day}.start`}
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center space-x-1">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <FormLabel className="text-xs font-thin uppercase font-body">
                                            Start
                                        </FormLabel>
                                    </div>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue
                                                    placeholder="Start time"
                                                    className="text-xs font-thin uppercase font-body"
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {timeOptions.map((time) => (
                                                <SelectItem
                                                    key={`${day}-start-${time}`}
                                                    value={time}
                                                    className="text-[10px] font-thin uppercase font-body"
                                                >
                                                    {time}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="col-span-12 sm:col-span-3">
                        <FormField
                            control={form.control}
                            name={`schedule.${day}.end`}
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center space-x-1">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <FormLabel className="text-xs font-thin uppercase font-body">
                                            End
                                        </FormLabel>
                                    </div>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="End time" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {timeOptions.map((time) => (
                                                <SelectItem
                                                    key={`${day}-end-${time}`}
                                                    value={time}
                                                    className="text-[10px] font-thin uppercase font-body"
                                                >
                                                    {time}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
