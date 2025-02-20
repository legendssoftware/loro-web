import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Claim, UpdateClaimDTO, ClaimStatus, ClaimCategory } from '@/lib/types/claims';
import { Button } from '@/components/ui/button';

// Define the form schema
const formSchema = z.object({
    amount: z.number().min(0, 'Amount must be greater than 0'),
    status: z.nativeEnum(ClaimStatus),
    category: z.nativeEnum(ClaimCategory),
});

type FormValues = z.infer<typeof formSchema>;

interface EditClaimFormProps {
    claim: Claim;
    onSubmit: (data: UpdateClaimDTO) => void;
    onCancel: () => void;
    isUpdating: boolean;
}

export const EditClaimForm = ({ claim, onSubmit, onCancel, isUpdating }: EditClaimFormProps) => {
    // Parse amount to number, defaulting to 0 if invalid
    const initialAmount = parseFloat(claim.amount) || 0;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: initialAmount,
            status: claim.status,
            category: claim.category,
        },
    });

    const handleSubmit = (values: FormValues) => {
        // Only send fields that have changed
        const updates: UpdateClaimDTO = {};
        if (values.amount !== initialAmount) updates.amount = values.amount;
        if (values.status !== claim.status) updates.status = values.status;
        if (values.category !== claim.category) updates.category = values.category;

        // Only submit if there are actual changes
        if (Object.keys(updates).length > 0) {
            onSubmit(updates);
        } else {
            onCancel();
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-4'>
                <FormField
                    control={form.control}
                    name='amount'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className='text-[10px] font-normal uppercase font-body'>Amount</FormLabel>
                            <FormControl>
                                <Input
                                    type='number'
                                    step='0.01'
                                    min='0'
                                    value={field.value}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    className='text-[10px] font-normal uppercase font-body'
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='status'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className='text-[10px] font-normal uppercase font-body'>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className='text-[10px] font-normal uppercase font-body'>
                                        <SelectValue placeholder='Select status' />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Object.values(ClaimStatus).map(status => (
                                        <SelectItem
                                            key={status}
                                            value={status}
                                            className='text-[10px] font-normal uppercase font-body'
                                        >
                                            {status.replace('_', ' ')}
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
                    name='category'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className='text-[10px] font-normal uppercase font-body'>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className='text-[10px] font-normal uppercase font-body'>
                                        <SelectValue placeholder='Select category' />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Object.values(ClaimCategory).map(category => (
                                        <SelectItem
                                            key={category}
                                            value={category}
                                            className='text-[10px] font-normal uppercase font-body'
                                        >
                                            {category.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className='flex items-center justify-between w-full gap-4 pt-4 mt-4 border-t'>
                    <div className='grid w-full grid-cols-2 gap-4'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={onCancel}
                            disabled={isUpdating}
                            className='w-full text-[10px] font-normal uppercase font-body'
                        >
                            Cancel
                        </Button>
                        <Button
                            type='submit'
                            variant='default'
                            disabled={isUpdating}
                            className='w-full text-[10px] font-normal text-white uppercase font-body bg-[#8B5CF6] hover:bg-[#7C3AED]'
                        >
                            {isUpdating ? (
                                <div className='flex items-center justify-center w-full gap-2'>
                                    <span className='w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin' />
                                    <span>Updating...</span>
                                </div>
                            ) : (
                                'Update Claim'
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
};
