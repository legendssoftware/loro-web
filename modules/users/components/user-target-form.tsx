'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import toast from 'react-hot-toast';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { axiosInstance } from '@/lib/services/api-client';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const periodOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
];

const currencyOptions = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
    { value: 'CAD', label: 'CAD' },
    { value: 'AUD', label: 'AUD' },
    { value: 'JPY', label: 'JPY' },
    { value: 'CNY', label: 'CNY' },
    { value: 'INR', label: 'INR' },
    { value: 'ZAR', label: 'ZAR' },
    { value: 'NGN', label: 'NGN' },
];

// Schema for the form validation
const userTargetSchema = z.object({
    targetSalesAmount: z.preprocess(
        (val) => (val === '' || val === null ? undefined : String(val)), // Preprocess: Ensure string or undefined
        z
            .string()
            .optional()
            .transform((val) => {
                // Validate/Transform the string
                if (val === undefined) return undefined;
                const num = parseFloat(val);
                return isNaN(num) ? undefined : num;
            }),
    ),
    targetCurrency: z.string().optional(),
    targetHoursWorked: z.preprocess(
        (val) => (val === '' || val === null ? undefined : String(val)),
        z
            .string()
            .optional()
            .transform((val) => {
                if (val === undefined) return undefined;
                const num = parseInt(val);
                return isNaN(num) ? undefined : num;
            }),
    ),
    targetNewClients: z.preprocess(
        (val) => (val === '' || val === null ? undefined : String(val)),
        z
            .string()
            .optional()
            .transform((val) => {
                if (val === undefined) return undefined;
                const num = parseInt(val);
                return isNaN(num) ? undefined : num;
            }),
    ),
    targetNewLeads: z.preprocess(
        (val) => (val === '' || val === null ? undefined : String(val)),
        z
            .string()
            .optional()
            .transform((val) => {
                if (val === undefined) return undefined;
                const num = parseInt(val);
                return isNaN(num) ? undefined : num;
            }),
    ),
    targetCheckIns: z.preprocess(
        (val) => (val === '' || val === null ? undefined : String(val)),
        z
            .string()
            .optional()
            .transform((val) => {
                if (val === undefined) return undefined;
                const num = parseInt(val);
                return isNaN(num) ? undefined : num;
            }),
    ),
    targetCalls: z.preprocess(
        (val) => (val === '' || val === null ? undefined : String(val)),
        z
            .string()
            .optional()
            .transform((val) => {
                if (val === undefined) return undefined;
                const num = parseInt(val);
                return isNaN(num) ? undefined : num;
            }),
    ),
    targetPeriod: z.string().optional(),
    periodStartDate: z.date().optional().nullable(),
    periodEndDate: z.date().optional().nullable(),
});

// Form input type (string values)
type UserTargetFormInput = {
    targetSalesAmount: string;
    targetCurrency?: string;
    targetHoursWorked: string;
    targetNewClients: string;
    targetNewLeads: string;
    targetCheckIns: string;
    targetCalls: string;
    targetPeriod?: string;
    periodStartDate?: Date;
    periodEndDate?: Date;
};

// Exported type for transformed values (number values)
export type UserTargetFormValues = z.output<typeof userTargetSchema>;

interface UserTarget {
    id?: number;
    targetSalesAmount?: number;
    targetCurrency?: string;
    targetHoursWorked?: number;
    targetNewClients?: number;
    targetNewLeads?: number;
    targetCheckIns?: number;
    targetCalls?: number;
    targetPeriod?: string;
    periodStartDate?: Date;
    periodEndDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

interface UserTargetFormProps {
    userId: number;
    initialData?: UserTarget | null;
    onSubmit: (data: UserTargetFormValues, hasExistingTargets: boolean) => void;
    isLoading?: boolean;
}

export default function UserTargetForm({
    userId,
    initialData,
    onSubmit,
    isLoading = false,
}: UserTargetFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentTarget, setCurrentTarget] = useState<UserTarget | null>(null);
    const [loadingTarget, setLoadingTarget] = useState(false);

    // Initialize the form with default values
    const form = useForm<UserTargetFormInput>({
        resolver: zodResolver(userTargetSchema),
        defaultValues: {
            targetSalesAmount: initialData?.targetSalesAmount
                ? initialData.targetSalesAmount.toString()
                : '',
            targetCurrency: initialData?.targetCurrency || 'USD',
            targetHoursWorked: initialData?.targetHoursWorked
                ? initialData.targetHoursWorked.toString()
                : '',
            targetNewClients: initialData?.targetNewClients
                ? initialData.targetNewClients.toString()
                : '',
            targetNewLeads: initialData?.targetNewLeads
                ? initialData.targetNewLeads.toString()
                : '',
            targetCheckIns: initialData?.targetCheckIns
                ? initialData.targetCheckIns.toString()
                : '',
            targetCalls: initialData?.targetCalls
                ? initialData.targetCalls.toString()
                : '',
            targetPeriod: initialData?.targetPeriod || 'monthly',
            periodStartDate: initialData?.periodStartDate
                ? new Date(initialData.periodStartDate)
                : undefined,
            periodEndDate: initialData?.periodEndDate
                ? new Date(initialData.periodEndDate)
                : undefined,
        },
    });

    // Fetch user target if not provided as initialData
    useEffect(() => {
        if (!initialData && userId) {
            setLoadingTarget(true);
            axiosInstance
                .get(`/user/${userId}/target`)
                .then((response) => {
                    if (response.data?.userTarget) {
                        setCurrentTarget(response.data.userTarget);

                        // Update form values
                        const userTarget = response.data.userTarget;
                        form.reset({
                            targetSalesAmount: userTarget.targetSalesAmount
                                ? userTarget.targetSalesAmount.toString()
                                : '',
                            targetCurrency: userTarget.targetCurrency || 'USD',
                            targetHoursWorked: userTarget.targetHoursWorked
                                ? userTarget.targetHoursWorked.toString()
                                : '',
                            targetNewClients: userTarget.targetNewClients
                                ? userTarget.targetNewClients.toString()
                                : '',
                            targetNewLeads: userTarget.targetNewLeads
                                ? userTarget.targetNewLeads.toString()
                                : '',
                            targetCheckIns: userTarget.targetCheckIns
                                ? userTarget.targetCheckIns.toString()
                                : '',
                            targetCalls: userTarget.targetCalls
                                ? userTarget.targetCalls.toString()
                                : '',
                            targetPeriod: userTarget.targetPeriod || 'monthly',
                            periodStartDate: userTarget.periodStartDate
                                ? new Date(userTarget.periodStartDate)
                                : undefined,
                            periodEndDate: userTarget.periodEndDate
                                ? new Date(userTarget.periodEndDate)
                                : undefined,
                        });
                    }
                })
                .catch((err) => {
                    console.error('Error fetching user target:', err);
                    setError('Failed to load user targets');
                    showErrorToast('Failed to load user targets', toast);
                })
                .finally(() => {
                    setLoadingTarget(false);
                });
        } else if (initialData) {
            setCurrentTarget(initialData);
        }
    }, [userId, initialData, form]);

    // Handle form submission
    const handleSubmit = async (data: UserTargetFormInput) => {
        setIsSubmitting(true);
        setError(null);

        try {
            // Transform the data according to the schema
            const transformedData = userTargetSchema.parse({
                ...data,
                // Ensure null values become undefined for dates
                periodStartDate: data.periodStartDate || undefined,
                periodEndDate: data.periodEndDate || undefined,
            });

            // Forward the transformed data to the parent component along with target existence status
            onSubmit(transformedData, !!currentTarget);
        } catch (err) {
            console.error('Error submitting form:', err);
            if (err instanceof z.ZodError) {
                const errorMessage = err.errors
                    .map((e) => `${e.path.join('.')}: ${e.message}`)
                    .join(', ');
                setError(`Validation error: ${errorMessage}`);
            } else {
                setError('An error occurred while submitting the form.');
            }
            showErrorToast('Failed to save user targets', toast);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle deleting user targets
    const handleDeleteClick = () => {
        setShowDeleteConfirmation(true);
    };

    const confirmDeleteTargets = async () => {
        try {
            setIsDeleting(true);
            await axiosInstance.delete(`/user/${userId}/target`);
            showSuccessToast('User targets deleted successfully', toast);

            // Reset the form and current target
            setCurrentTarget(null);
            form.reset({
                targetSalesAmount: '',
                targetCurrency: 'USD',
                targetHoursWorked: '',
                targetNewClients: '',
                targetNewLeads: '',
                targetCheckIns: '',
                targetCalls: '',
                targetPeriod: 'monthly',
                periodStartDate: undefined,
                periodEndDate: undefined,
            });

            setShowDeleteConfirmation(false);
        } catch (err) {
            console.error('Error deleting user targets:', err);
            showErrorToast('Failed to delete user targets', toast);
        } finally {
            setIsDeleting(false);
        }
    };

    if (loadingTarget) {
        return (
            <div className="flex items-center justify-center h-40">
                Loading user targets...
            </div>
        );
    }

    return (
        <>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-6"
                >
                    {error && (
                        <div className="p-3 text-sm text-red-500 rounded-md bg-red-50 dark:bg-red-900/20 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Sales Target */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-thin uppercase font-body">
                                Sales Targets
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="targetSalesAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-body">
                                                Target Amount
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    placeholder="enter target amount"
                                                    className="font-thin font-body"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="targetCurrency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-body">
                                                Currency
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="font-thin font-body">
                                                        <SelectValue placeholder="Select currency" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {currencyOptions.map(
                                                        (option) => (
                                                            <SelectItem
                                                                key={
                                                                    option.value
                                                                }
                                                                value={
                                                                    option.value
                                                                }
                                                                className="font-thin font-body"
                                                            >
                                                                {option.label}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Time Target */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-thin uppercase font-body">
                                Time Targets
                            </h3>
                            <FormField
                                control={form.control}
                                name="targetHoursWorked"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-body">
                                            Target Hours Worked
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="enter target hours"
                                                className="font-thin font-body"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Client & Lead Targets */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-thin uppercase font-body">
                                Client & Lead Targets
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="targetNewClients"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-body">
                                                New Clients
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    placeholder="enter target"
                                                    className="font-thin font-body"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="targetNewLeads"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-body">
                                                New Leads
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    placeholder="enter target"
                                                    className="font-thin font-body"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Activity Targets */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-thin uppercase font-body">
                                Activity Targets
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="targetCheckIns"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-body">
                                                Check-ins
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    placeholder="enter target"
                                                    className="font-thin font-body"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="targetCalls"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-body">
                                                Calls
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    placeholder="enter target"
                                                    className="font-thin font-body"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Target Period Settings */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-thin uppercase font-body">
                            Target Period
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <FormField
                                control={form.control}
                                name="targetPeriod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-body">
                                            Period Type
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="font-thin font-body">
                                                    <SelectValue placeholder="Select period" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {periodOptions.map((option) => (
                                                    <SelectItem
                                                        key={option.value}
                                                        value={option.value}
                                                        className="font-thin font-body"
                                                    >
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="periodStartDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-xs font-body">
                                            Start Date
                                        </FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={'outline'}
                                                        className={cn(
                                                            'font-thin font-body',
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
                                                                Pick a date
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
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date: Date) =>
                                                        date <
                                                        new Date('1900-01-01')
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="periodEndDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-xs font-body">
                                            End Date
                                        </FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={'outline'}
                                                        className={cn(
                                                            'font-thin font-body',
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
                                                                Pick a date
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
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date: Date) => {
                                                        const startDate =
                                                            form.getValues()
                                                                .periodStartDate;
                                                        return (
                                                            date <
                                                                new Date(
                                                                    '1900-01-01',
                                                                ) ||
                                                            (!!startDate &&
                                                                date <
                                                                    startDate)
                                                        );
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex justify-between space-x-2">
                        {currentTarget && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleDeleteClick}
                                disabled={
                                    isSubmitting || isLoading || isDeleting
                                }
                                className="font-thin text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-900/20 font-body"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Targets
                            </Button>
                        )}
                        <div className="flex-grow"></div>
                        <Button
                            type="submit"
                            disabled={isSubmitting || isLoading || isDeleting}
                            className="font-thin bg-primary text-primary-foreground hover:bg-primary/90 font-body"
                        >
                            {isSubmitting || isLoading
                                ? 'Saving...'
                                : currentTarget
                                  ? 'Update Targets'
                                  : 'Set Targets'}
                        </Button>
                    </div>
                </form>
            </Form>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={showDeleteConfirmation}
                onOpenChange={setShowDeleteConfirmation}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User Targets</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete all targets for this
                            user? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteTargets}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
