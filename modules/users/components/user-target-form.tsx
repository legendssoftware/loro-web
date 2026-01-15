'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { CalendarIcon, Trash2, RefreshCw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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
	// Major International Currencies
	{ value: 'USD', label: 'USD - US Dollar' },
	{ value: 'EUR', label: 'EUR - Euro' },
	{ value: 'GBP', label: 'GBP - British Pound' },
	{ value: 'CAD', label: 'CAD - Canadian Dollar' },
	{ value: 'AUD', label: 'AUD - Australian Dollar' },
	{ value: 'JPY', label: 'JPY - Japanese Yen' },
	{ value: 'CNY', label: 'CNY - Chinese Yuan' },
	{ value: 'INR', label: 'INR - Indian Rupee' },
	// SADC Region Currencies
	{ value: 'ZAR', label: 'ZAR - South African Rand' },
	{ value: 'BWP', label: 'BWP - Botswana Pula' },
	{ value: 'MZN', label: 'MZN - Mozambican Metical' },
	{ value: 'MWK', label: 'MWK - Malawian Kwacha' },
	{ value: 'ZMW', label: 'ZMW - Zambian Kwacha' },
	{ value: 'ZWL', label: 'ZWL - Zimbabwean Dollar' },
	{ value: 'SZL', label: 'SZL - Swazi Lilangeni' },
	{ value: 'LSL', label: 'LSL - Lesotho Loti' },
	{ value: 'NAD', label: 'NAD - Namibian Dollar' },
	{ value: 'AOA', label: 'AOA - Angolan Kwanza' },
	{ value: 'MGA', label: 'MGA - Malagasy Ariary' },
	{ value: 'MUR', label: 'MUR - Mauritian Rupee' },
	{ value: 'SCR', label: 'SCR - Seychellois Rupee' },
	{ value: 'TZS', label: 'TZS - Tanzanian Shilling' },
	{ value: 'UGX', label: 'UGX - Ugandan Shilling' },
	{ value: 'KES', label: 'KES - Kenyan Shilling' },
	// Other African Currencies
	{ value: 'NGN', label: 'NGN - Nigerian Naira' },
	{ value: 'GHS', label: 'GHS - Ghanaian Cedi' },
	{ value: 'ETB', label: 'ETB - Ethiopian Birr' },
];

// Helper function for number preprocessing
const numberPreprocess = z.preprocess(
        (val) => (val === '' || val === null ? undefined : String(val)),
        z
            .string()
            .optional()
            .transform((val) => {
                if (val === undefined) return undefined;
                // Remove commas and other formatting characters before parsing
                const cleanedVal = val.replace(/,/g, '');
                const num = parseFloat(cleanedVal);
                return isNaN(num) ? undefined : num;
            }),
);

const integerPreprocess = z.preprocess(
        (val) => (val === '' || val === null ? undefined : String(val)),
        z
            .string()
            .optional()
            .transform((val) => {
                if (val === undefined) return undefined;
                // Remove commas and other formatting characters before parsing
                const cleanedVal = val.replace(/,/g, '');
                const num = parseInt(cleanedVal);
                return isNaN(num) ? undefined : num;
            }),
);

// Schema for the form validation
const userTargetSchema = z.object({
    // Target Fields
    targetSalesAmount: numberPreprocess,
    targetQuotationsAmount: numberPreprocess,
    targetCurrency: z.string().optional(),
    targetHoursWorked: integerPreprocess,
    targetNewClients: integerPreprocess,
    targetNewLeads: integerPreprocess,
    targetCheckIns: integerPreprocess,
    targetCalls: integerPreprocess,
    targetPeriod: z.string().optional(),
    periodStartDate: z.date().optional().nullable(),
    periodEndDate: z.date().optional().nullable(),

    // Recurring Target Configuration
    isRecurring: z.boolean().optional(),
    recurringInterval: z.enum(['daily', 'weekly', 'monthly']).optional(),
    carryForwardUnfulfilled: z.boolean().optional(),

    // Current Tracking Fields
    currentSalesAmount: numberPreprocess,
    currentQuotationsAmount: numberPreprocess,
    currentOrdersAmount: numberPreprocess,
    currentHoursWorked: integerPreprocess,
    currentNewClients: integerPreprocess,
    currentNewLeads: integerPreprocess,
    currentCheckIns: integerPreprocess,
    currentCalls: integerPreprocess,

    // Cost Breakdown Fields (Monthly) - All in ZAR
    baseSalary: numberPreprocess,
    carInstalment: numberPreprocess,
    carInsurance: numberPreprocess,
    fuel: numberPreprocess,
    cellPhoneAllowance: numberPreprocess,
    carMaintenance: numberPreprocess,
    cgicCosts: numberPreprocess,
    totalCost: numberPreprocess,

    // ERP Integration
    erpSalesRepCode: z.string().optional(),
});

// Form input type (string values)
type UserTargetFormInput = {
    // Target Fields
    targetSalesAmount: string;
    targetQuotationsAmount: string;
    targetCurrency?: string;
    targetHoursWorked: string;
    targetNewClients: string;
    targetNewLeads: string;
    targetCheckIns: string;
    targetCalls: string;
    targetPeriod?: string;
    periodStartDate?: Date;
    periodEndDate?: Date;

    // Recurring Target Configuration
    isRecurring?: boolean;
    recurringInterval?: 'daily' | 'weekly' | 'monthly';
    carryForwardUnfulfilled?: boolean;

    // Current Tracking Fields
    currentSalesAmount: string;
    currentQuotationsAmount: string;
    currentOrdersAmount: string;
    currentHoursWorked: string;
    currentNewClients: string;
    currentNewLeads: string;
    currentCheckIns: string;
    currentCalls: string;

    // Cost Breakdown Fields
    baseSalary: string;
    carInstalment: string;
    carInsurance: string;
    fuel: string;
    cellPhoneAllowance: string;
    carMaintenance: string;
    cgicCosts: string;
    totalCost: string;

    // ERP Integration
    erpSalesRepCode?: string;
};

// Exported type for transformed values (number values)
export type UserTargetFormValues = z.output<typeof userTargetSchema>;

interface UserTarget {
    id?: number;
    // Target Fields
    targetSalesAmount?: number;
    targetQuotationsAmount?: number;
    targetCurrency?: string;
    targetHoursWorked?: number;
    targetNewClients?: number;
    targetNewLeads?: number;
    targetCheckIns?: number;
    targetCalls?: number;
    targetPeriod?: string;
    periodStartDate?: Date;
    periodEndDate?: Date;

    // Recurring Target Configuration
    isRecurring?: boolean;
    recurringInterval?: 'daily' | 'weekly' | 'monthly';
    carryForwardUnfulfilled?: boolean;
    nextRecurrenceDate?: Date;
    lastRecurrenceDate?: Date;
    recurrenceCount?: number;

    // Current Tracking Fields
    currentSalesAmount?: number;
    currentQuotationsAmount?: number;
    currentOrdersAmount?: number;
    currentHoursWorked?: number;
    currentNewClients?: number;
    currentNewLeads?: number;
    currentCheckIns?: number;
    currentCalls?: number;

    // Cost Breakdown Fields
    baseSalary?: number;
    carInstalment?: number;
    carInsurance?: number;
    fuel?: number;
    cellPhoneAllowance?: number;
    carMaintenance?: number;
    cgicCosts?: number;
    totalCost?: number;

    // ERP Integration
    erpSalesRepCode?: string;

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
            // Target Fields
            targetSalesAmount: initialData?.targetSalesAmount?.toString() || '',
            targetQuotationsAmount: initialData?.targetQuotationsAmount?.toString() || '',
            targetCurrency: initialData?.targetCurrency || 'ZAR',
            targetHoursWorked: initialData?.targetHoursWorked?.toString() || '',
            targetNewClients: initialData?.targetNewClients?.toString() || '',
            targetNewLeads: initialData?.targetNewLeads?.toString() || '',
            targetCheckIns: initialData?.targetCheckIns?.toString() || '',
            targetCalls: initialData?.targetCalls?.toString() || '',
            targetPeriod: initialData?.targetPeriod || 'monthly',
            periodStartDate: initialData?.periodStartDate ? new Date(initialData.periodStartDate) : undefined,
            periodEndDate: initialData?.periodEndDate ? new Date(initialData.periodEndDate) : undefined,

            // Recurring Target Configuration
            isRecurring: initialData?.isRecurring || false,
            recurringInterval: initialData?.recurringInterval || 'monthly',
            carryForwardUnfulfilled: initialData?.carryForwardUnfulfilled || false,

            // Current Tracking Fields
            currentSalesAmount: initialData?.currentSalesAmount?.toString() || '',
            currentQuotationsAmount: initialData?.currentQuotationsAmount?.toString() || '',
            currentOrdersAmount: initialData?.currentOrdersAmount?.toString() || '',
            currentHoursWorked: initialData?.currentHoursWorked?.toString() || '',
            currentNewClients: initialData?.currentNewClients?.toString() || '',
            currentNewLeads: initialData?.currentNewLeads?.toString() || '',
            currentCheckIns: initialData?.currentCheckIns?.toString() || '',
            currentCalls: initialData?.currentCalls?.toString() || '',

            // Cost Breakdown Fields
            baseSalary: initialData?.baseSalary?.toString() || '',
            carInstalment: initialData?.carInstalment?.toString() || '',
            carInsurance: initialData?.carInsurance?.toString() || '',
            fuel: initialData?.fuel?.toString() || '',
            cellPhoneAllowance: initialData?.cellPhoneAllowance?.toString() || '',
            carMaintenance: initialData?.carMaintenance?.toString() || '',
            cgicCosts: initialData?.cgicCosts?.toString() || '',
            totalCost: initialData?.totalCost?.toString() || '',

            // ERP Integration
            erpSalesRepCode: initialData?.erpSalesRepCode || '',
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
                            // Target Fields
                            targetSalesAmount: userTarget.targetSalesAmount?.toString() || '',
                            targetQuotationsAmount: userTarget.targetQuotationsAmount?.toString() || '',
                            targetCurrency: userTarget.targetCurrency || 'ZAR',
                            targetHoursWorked: userTarget.targetHoursWorked?.toString() || '',
                            targetNewClients: userTarget.targetNewClients?.toString() || '',
                            targetNewLeads: userTarget.targetNewLeads?.toString() || '',
                            targetCheckIns: userTarget.targetCheckIns?.toString() || '',
                            targetCalls: userTarget.targetCalls?.toString() || '',
                            targetPeriod: userTarget.targetPeriod || 'monthly',
                            periodStartDate: userTarget.periodStartDate ? new Date(userTarget.periodStartDate) : undefined,
                            periodEndDate: userTarget.periodEndDate ? new Date(userTarget.periodEndDate) : undefined,

                            // Recurring Target Configuration
                            isRecurring: userTarget.isRecurring || false,
                            recurringInterval: userTarget.recurringInterval || 'monthly',
                            carryForwardUnfulfilled: userTarget.carryForwardUnfulfilled || false,

                            // Current Tracking Fields
                            currentSalesAmount: userTarget.currentSalesAmount?.toString() || '',
                            currentQuotationsAmount: userTarget.currentQuotationsAmount?.toString() || '',
                            currentOrdersAmount: userTarget.currentOrdersAmount?.toString() || '',
                            currentHoursWorked: userTarget.currentHoursWorked?.toString() || '',
                            currentNewClients: userTarget.currentNewClients?.toString() || '',
                            currentNewLeads: userTarget.currentNewLeads?.toString() || '',
                            currentCheckIns: userTarget.currentCheckIns?.toString() || '',
                            currentCalls: userTarget.currentCalls?.toString() || '',

                            // Cost Breakdown Fields
                            baseSalary: userTarget.baseSalary?.toString() || '',
                            carInstalment: userTarget.carInstalment?.toString() || '',
                            carInsurance: userTarget.carInsurance?.toString() || '',
                            fuel: userTarget.fuel?.toString() || '',
                            cellPhoneAllowance: userTarget.cellPhoneAllowance?.toString() || '',
                            carMaintenance: userTarget.carMaintenance?.toString() || '',
                            cgicCosts: userTarget.cgicCosts?.toString() || '',
                            totalCost: userTarget.totalCost?.toString() || '',

                            // ERP Integration
                            erpSalesRepCode: userTarget.erpSalesRepCode || '',
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
                // Target Fields
                targetSalesAmount: '',
                targetQuotationsAmount: '',
                targetCurrency: 'ZAR',
                targetHoursWorked: '',
                targetNewClients: '',
                targetNewLeads: '',
                targetCheckIns: '',
                targetCalls: '',
                targetPeriod: 'monthly',
                periodStartDate: undefined,
                periodEndDate: undefined,

                // Recurring Target Configuration
                isRecurring: false,
                recurringInterval: 'monthly',
                carryForwardUnfulfilled: false,

                // Current Tracking Fields
                currentSalesAmount: '',
                currentQuotationsAmount: '',
                currentOrdersAmount: '',
                currentHoursWorked: '',
                currentNewClients: '',
                currentNewLeads: '',
                currentCheckIns: '',
                currentCalls: '',

                // Cost Breakdown Fields
                baseSalary: '',
                carInstalment: '',
                carInsurance: '',
                fuel: '',
                cellPhoneAllowance: '',
                carMaintenance: '',
                cgicCosts: '',
                totalCost: '',

                // ERP Integration
                erpSalesRepCode: '',
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
            <div className="flex justify-center items-center h-40">
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
                        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md dark:bg-red-900/20 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Sales Target */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-thin uppercase font-body">
                                SALES TARGETS
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="targetSalesAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <label
                                                htmlFor="target-amount"
                                                className="block text-xs font-light text-white uppercase font-body"
                                            >
                                                Total Sales Target
                                            </label>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    placeholder="enter total sales target"
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
                                            <label
                                                htmlFor="target-currency"
                                                className="block text-xs font-light text-white uppercase font-body"
                                            >
                                                Currency
                                            </label>
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
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="targetQuotationsAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <label
                                                htmlFor="target-quotations-amount"
                                                className="block text-xs font-light text-white uppercase font-body"
                                            >
                                                Quotations Target
                                            </label>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    placeholder="enter quotations target"
                                                    className="font-thin font-body"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                            </div>
                        </div>

                        {/* Time Target */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-thin uppercase font-body">
                                TIME TARGETS
                            </h3>
                            <FormField
                                control={form.control}
                                name="targetHoursWorked"
                                render={({ field }) => (
                                    <FormItem>
                                        <label
                                            htmlFor="target-hours-worked"
                                            className="block text-xs font-light text-white uppercase font-body"
                                        >
                                            Target Hours Worked
                                        </label>
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
                                CLIENT & LEAD TARGETS
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="targetNewClients"
                                    render={({ field }) => (
                                        <FormItem>
                                            <label
                                                htmlFor="target-new-clients"
                                                className="block text-xs font-light text-white uppercase font-body"
                                            >
                                                New Clients
                                            </label>
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
                                            <label
                                                htmlFor="target-new-leads"
                                                className="block text-xs font-light text-white uppercase font-body"
                                            >
                                                New Leads
                                            </label>
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
                                ACTIVITY TARGETS
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="targetCheckIns"
                                    render={({ field }) => (
                                        <FormItem>
                                            <label
                                                htmlFor="target-check-ins"
                                                className="block text-xs font-light text-white uppercase font-body"
                                            >
                                                Check-ins
                                            </label>
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
                                            <label
                                                htmlFor="target-calls"
                                                className="block text-xs font-light text-white uppercase font-body"
                                            >
                                                Calls
                                            </label>
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

                    {/* Current Sales Performance */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-thin uppercase font-body">
                            CURRENT SALES PERFORMANCE
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="currentSalesAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <label
                                            htmlFor="current-sales-amount"
                                            className="block text-xs font-light text-white uppercase font-body"
                                        >
                                            Current Total Sales
                                        </label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="enter current total sales"
                                                className="font-thin font-body"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currentQuotationsAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <label
                                            htmlFor="current-quotations-amount"
                                            className="block text-xs font-light text-white uppercase font-body"
                                        >
                                            Current Quotations Amount
                                        </label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="enter current quotations amount"
                                                className="font-thin font-body"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currentOrdersAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <label
                                            htmlFor="current-orders-amount"
                                            className="block text-xs font-light text-white uppercase font-body"
                                        >
                                            Current Orders Amount
                                        </label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="enter current orders amount"
                                                className="font-thin font-body"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Current Time & Activity Performance */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-thin uppercase font-body">
                            CURRENT TIME & ACTIVITY PERFORMANCE
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="currentHoursWorked"
                                render={({ field }) => (
                                    <FormItem>
                                        <label
                                            htmlFor="current-hours-worked"
                                            className="block text-xs font-light text-white uppercase font-body"
                                        >
                                            Current Hours Worked
                                        </label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="enter current hours worked"
                                                className="font-thin font-body"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Current Client & Lead Performance */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-thin uppercase font-body">
                            CURRENT CLIENT & LEAD PERFORMANCE
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="currentNewClients"
                                render={({ field }) => (
                                    <FormItem>
                                        <label
                                            htmlFor="current-new-clients"
                                            className="block text-xs font-light text-white uppercase font-body"
                                        >
                                            Current New Clients
                                        </label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="enter current new clients"
                                                className="font-thin font-body"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currentNewLeads"
                                render={({ field }) => (
                                    <FormItem>
                                        <label
                                            htmlFor="current-new-leads"
                                            className="block text-xs font-light text-white uppercase font-body"
                                        >
                                            Current New Leads
                                        </label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="enter current new leads"
                                                className="font-thin font-body"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Current Activity Performance */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-thin uppercase font-body">
                            CURRENT ACTIVITY PERFORMANCE
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="currentCheckIns"
                                render={({ field }) => (
                                    <FormItem>
                                        <label
                                            htmlFor="current-check-ins"
                                            className="block text-xs font-light text-white uppercase font-body"
                                        >
                                            Current Check-ins
                                        </label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="enter current check-ins"
                                                className="font-thin font-body"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currentCalls"
                                render={({ field }) => (
                                    <FormItem>
                                        <label
                                            htmlFor="current-calls"
                                            className="block text-xs font-light text-white uppercase font-body"
                                        >
                                            Current Calls
                                        </label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="enter current calls"
                                                className="font-thin font-body"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Cost Breakdown Section - Hidden for now per request */}
                    {false && <div className="space-y-2">
                        <h3 className="text-sm font-thin uppercase font-body">
                            MONTHLY COST BREAKDOWN (ZAR)
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <FormField
                                control={form.control}
                                name="baseSalary"
                                render={({ field }) => (
                                    <FormItem>
                                        <label
                                            htmlFor="base-salary"
                                            className="block text-xs font-light text-white uppercase font-body"
                                        >
                                            Base Salary
                                        </label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="enter base salary"
                                                className="font-thin font-body"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="carInstalment"
                                render={({ field }) => (
                                    <FormItem>
                                        <label
                                            htmlFor="car-instalment"
                                            className="block text-xs font-light text-white uppercase font-body"
                                        >
                                            Car Instalment
                                        </label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="enter car instalment"
                                                className="font-thin font-body"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="carInsurance"
                                render={({ field }) => (
                                    <FormItem>
                                        <label
                                            htmlFor="car-insurance"
                                            className="block text-xs font-light text-white uppercase font-body"
                                        >
                                            Car Insurance
                                        </label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="enter car insurance"
                                                className="font-thin font-body"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="fuel"
                                render={({ field }) => (
                                    <FormItem>
                                        <label
                                            htmlFor="fuel"
                                            className="block text-xs font-light text-white uppercase font-body"
                                        >
                                            Fuel Allowance
                                        </label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="enter fuel allowance"
                                                className="font-thin font-body"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cellPhoneAllowance"
                                render={({ field }) => (
                                    <FormItem>
                                        <label
                                            htmlFor="cell-phone-allowance"
                                            className="block text-xs font-light text-white uppercase font-body"
                                        >
                                            Cell Phone Allowance
                                        </label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="enter cell phone allowance"
                                                className="font-thin font-body"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="carMaintenance"
                                render={({ field }) => (
                                    <FormItem>
                                        <label
                                            htmlFor="car-maintenance"
                                            className="block text-xs font-light text-white uppercase font-body"
                                        >
                                            Car Maintenance
                                        </label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="enter car maintenance"
                                                className="font-thin font-body"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cgicCosts"
                                render={({ field }) => (
                                    <FormItem>
                                        <label
                                            htmlFor="cgic-costs"
                                            className="block text-xs font-light text-white uppercase font-body"
                                        >
                                            CGIC Costs
                                        </label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="enter CGIC costs"
                                                className="font-thin font-body"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="totalCost"
                                render={({ field }) => (
                                    <FormItem>
                                        <label
                                            htmlFor="total-cost"
                                            className="block text-xs font-light text-white uppercase font-body"
                                        >
                                            Total Cost
                                        </label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="enter total cost"
                                                className="font-thin font-body"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>}

                    {/* ERP Integration Section */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-thin uppercase font-body">
                            ERP INTEGRATION
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="erpSalesRepCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <label
                                            htmlFor="erp-sales-rep-code"
                                            className="block text-xs font-light text-white uppercase font-body"
                                        >
                                            ERP Sales Rep Code
                                        </label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g. SAL001 (ERP sales code for linking)"
                                                className="font-thin font-body"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        <p className="text-xs text-muted-foreground">
                                            Code used to link user to ERP sales data
                                        </p>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Target Period Settings */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-thin uppercase font-body">
                            TARGET PERIOD
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <FormField
                                control={form.control}
                                name="targetPeriod"
                                render={({ field }) => (
                                    <FormItem>
                                        <label
                                            htmlFor="target-period"
                                            className="block text-xs font-light text-white uppercase font-body"
                                        >
                                            Period Type
                                        </label>
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
                                        <label
                                            htmlFor="target-start-date"
                                            className="block text-xs font-light text-white uppercase font-body"
                                        >
                                            Start Date
                                        </label>
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
                                                            <span className="text-[10px] font-thin uppercase font-body">
                                                                Pick a date
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
                                        <label
                                            htmlFor="target-end-date"
                                            className="block text-xs font-light text-white uppercase font-body"
                                        >
                                            End Date
                                        </label>
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
                                                            <span className="text-[10px] font-thin uppercase font-body">
                                                                Pick a date
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

                    {/* Recurring Targets Configuration */}
                    <div className="p-4 space-y-4 rounded-lg border border-primary/20 bg-primary/5">
                        <div className="flex items-center space-x-2">
                            <RefreshCw className="w-5 h-5 text-primary" />
                            <h3 className="text-sm font-thin uppercase font-body">
                                RECURRING TARGETS
                            </h3>
                        </div>

                        <FormField
                            control={form.control}
                            name="isRecurring"
                            render={({ field }) => (
                                <FormItem className="flex flex-row justify-between items-center p-3 rounded-lg border">
                                    <div className="space-y-0.5">
                                        <label className="text-xs font-light text-white uppercase font-body">
                                            Enable Recurring Targets
                                        </label>
                                        <div className="text-[10px] text-muted-foreground font-thin">
                                            Automatically reset targets at specified intervals
                                        </div>
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

                        {form.watch('isRecurring') && (
                            <div className="space-y-4 animate-in fade-in-50">
                                <FormField
                                    control={form.control}
                                    name="recurringInterval"
                                    render={({ field }) => (
                                        <FormItem>
                                            <label className="block text-xs font-light text-white uppercase font-body">
                                                Recurrence Interval
                                            </label>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="font-thin font-body">
                                                        <SelectValue placeholder="Select interval" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="daily" className="font-thin font-body">
                                                        Daily
                                                    </SelectItem>
                                                    <SelectItem value="weekly" className="font-thin font-body">
                                                        Weekly
                                                    </SelectItem>
                                                    <SelectItem value="monthly" className="font-thin font-body">
                                                        Monthly
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="carryForwardUnfulfilled"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start p-4 space-x-3 space-y-0 rounded-md border">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <label className="text-xs font-light text-white uppercase font-body">
                                                    Carry Forward Unfulfilled Targets
                                                </label>
                                                <div className="text-[10px] text-muted-foreground font-thin">
                                                    Add unmet targets to the next period automatically
                                                </div>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                {(currentTarget?.recurrenceCount ?? 0) > 0 && (
                                    <div className="p-3 rounded-md bg-muted/50">
                                        <div className="text-[10px] text-muted-foreground font-thin space-y-1">
                                            <p>📊 <strong>Recurrence Count:</strong> {currentTarget?.recurrenceCount ?? 0} times</p>
                                            {currentTarget?.nextRecurrenceDate && (
                                                <p>📅 <strong>Next Recurrence:</strong> {format(new Date(currentTarget.nextRecurrenceDate), 'PPP')}</p>
                                            )}
                                            {currentTarget?.lastRecurrenceDate && (
                                                <p>🕒 <strong>Last Recurrence:</strong> {format(new Date(currentTarget.lastRecurrenceDate), 'PPP')}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
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
                                className="font-thin text-red-600 border-red-200 upercase hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-900/20 font-body"
                            >
                                <Trash2 className="mr-2 w-4 h-4" />
                                Delete Targets
                            </Button>
                        )}
                        <div className="flex-grow"></div>
                        <Button
                            type="submit"
                            disabled={isSubmitting || isLoading || isDeleting}
                            className="text-xs font-thin text-white uppercase bg-primary hover:bg-primary/90 font-body"
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
