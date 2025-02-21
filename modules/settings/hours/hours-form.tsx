import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { getOrganisationHours, updateOrganisationHours } from '@/helpers/organizations';
import { toast } from 'sonner';
import { useSessionStore } from '@/store/use-session-store';

const hoursFormSchema = z.object({
    openTime: z.string().min(1, 'Opening time is required'),
    closeTime: z.string().min(1, 'Closing time is required'),
    weeklySchedule: z.object({
        monday: z.boolean(),
        tuesday: z.boolean(),
        wednesday: z.boolean(),
        thursday: z.boolean(),
        friday: z.boolean(),
        saturday: z.boolean(),
        sunday: z.boolean(),
    }),
    specialHours: z.array(z.object({
        date: z.string(),
        openTime: z.string(),
        closeTime: z.string(),
    })).optional(),
});

type HoursFormValues = z.infer<typeof hoursFormSchema>;

export function HoursForm() {
    const { profileData } = useSessionStore();
    const queryClient = useQueryClient();
    const isAdmin = profileData?.accessLevel === 'admin';

    const { data: hoursData, isLoading } = useQuery({
        queryKey: ['organisationHours', profileData?.organisationRef],
        queryFn: () => getOrganisationHours(profileData?.organisationRef as string),
        enabled: !!profileData?.organisationRef,
    });

    const form = useForm<HoursFormValues>({
        resolver: zodResolver(hoursFormSchema),
        defaultValues: {
            openTime: hoursData?.hours?.openTime || '09:00',
            closeTime: hoursData?.hours?.closeTime || '17:00',
            weeklySchedule: hoursData?.hours?.weeklySchedule || {
                monday: true,
                tuesday: true,
                wednesday: true,
                thursday: true,
                friday: true,
                saturday: false,
                sunday: false,
            },
            specialHours: hoursData?.hours?.specialHours || [],
        },
    });

    const mutation = useMutation({
        mutationFn: (values: HoursFormValues) =>
            updateOrganisationHours(profileData?.organisationRef as string, values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organisationHours'] });
            toast.success('Hours updated successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update hours');
        },
    });

    function onSubmit(values: HoursFormValues) {
        if (!isAdmin) {
            toast.error('Only administrators can update hours');
            return;
        }
        mutation.mutate(values);
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className='flex flex-col gap-8'>
            <div className='flex flex-col gap-6 mx-auto xl:w-11/12'>
                <div>
                    <h2 className='font-normal uppercase text-md font-body'>Business Hours</h2>
                    <p className='text-xs font-normal uppercase font-body text-muted-foreground'>
                        Set your organization's operating hours
                    </p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                        {/* Regular Hours Section */}
                        <div className='space-y-4'>
                            <h3 className='text-sm font-normal uppercase font-body'>Regular Hours</h3>
                            <div className='grid grid-cols-3 gap-6'>
                                <FormField
                                    control={form.control}
                                    name='openTime'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-normal uppercase font-body'>Opening Time</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type='time'
                                                    disabled={!isAdmin}
                                                    className='text-xs'
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='closeTime'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-normal uppercase font-body'>Closing Time</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type='time'
                                                    disabled={!isAdmin}
                                                    className='text-xs'
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Weekly Schedule Section */}
                        <div className='space-y-4'>
                            <h3 className='text-sm font-normal uppercase font-body'>Weekly Schedule</h3>
                            <div className='grid grid-cols-3 gap-6'>
                                {Object.entries(form.watch('weeklySchedule')).map(([day, value]) => (
                                    <FormField
                                        key={day}
                                        control={form.control}
                                        name={`weeklySchedule.${day}` as any}
                                        render={({ field }) => (
                                            <FormItem className='flex items-center justify-between rounded-lg border p-4'>
                                                <FormLabel className='text-xs font-normal uppercase font-body'>
                                                    {day.charAt(0).toUpperCase() + day.slice(1)}
                                                </FormLabel>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={!isAdmin}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                ))}
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
