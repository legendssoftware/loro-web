'use client';

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
import { useBusinessHours } from '@/hooks/use-organization-settings';
import {z} from 'zod'
import { toast } from 'react-hot-toast';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';

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
    const {
        form,
        data,
        isLoading,
        isSaving,
        error,
        handleSubmit,
        isDirty,
        refetch,
    } = useBusinessHours();

    // Watch holiday mode to conditionally show date picker
    const holidayMode = form.watch('holidayMode');

    // Show loading state while fetching initial data
    if (isLoading) {
        return (
            <Card className="border-border/50">
                <CardContent className="flex justify-center items-center p-8">
                    <div className="text-center">
                        <Loader2 className="mx-auto mb-4 w-8 h-8 animate-spin" />
                        <p className="text-xs font-normal uppercase font-body">
                            Loading business hours...
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
                    <div className="text-center">
                        <div className="mb-4 text-red-500">
                            <p className="mb-2 text-xs font-normal uppercase font-body">
                                Error loading business hours
                            </p>
                            <p className="text-[10px] font-thin text-muted-foreground font-body">
                                {error.message}
                            </p>
                        </div>
                        <Button 
                            onClick={() => refetch()} 
                            variant="outline" 
                            size="sm"
                            className="text-xs font-thin uppercase font-body"
                        >
                            Try Again
                        </Button>
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
                                        <FormItem className="flex flex-row justify-between items-center">
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
                                                                    <CalendarIcon className="ml-auto w-4 h-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent
                                                            className="p-0 w-auto"
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
                                disabled={isSaving}
                                className="text-xs font-thin text-white uppercase font-body bg-primary"
                            >
                                {isSaving && (
                                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
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
        <div className="grid grid-cols-12 gap-4 p-4 rounded-md border">
            <div className="flex col-span-12 items-center sm:col-span-3">
                <h4 className="text-xs font-thin uppercase font-body">
                    {label}
                </h4>
            </div>
            <div className="flex col-span-12 items-center sm:col-span-3">
                <FormField
                    control={form.control}
                    name={`schedule.${day}.closed`}
                    render={({ field }) => (
                        <FormItem className="flex justify-between items-center space-x-2">
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
