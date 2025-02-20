import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { claimStatuses, claimCategories } from '@/data/app-data';
import { Claim, UpdateClaimDTO } from '@/lib/types/claims';

const formSchema = z.object({
    amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
        message: 'Amount must be a non-negative number.',
    }),
    status: z.string(),
    category: z.string(),
});

type FormSchema = z.infer<typeof formSchema>;

interface EditClaimFormProps {
    claim: Claim;
    onSubmit: (data: UpdateClaimDTO) => void;
}

export const EditClaimForm = ({ claim, onSubmit }: EditClaimFormProps) => {
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: claim.amount?.toString() || '0',
            status: claim.status,
            category: claim.category,
        },
    });

    const handleSubmit = (values: FormSchema) => {
        onSubmit({
            amount: Number(values.amount),
            status: values.status,
            category: values.category,
        });
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
                                <Input type='number' step='0.01' min='0' placeholder='0.00' {...field} />
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select status' />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {claimStatuses.map(status => (
                                        <SelectItem
                                            key={status.value}
                                            value={status.value}
                                            className='text-[10px] font-normal uppercase font-body'
                                        >
                                            {status.label}
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select category' />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {claimCategories.map(category => (
                                        <SelectItem
                                            key={category.value}
                                            value={category.value}
                                            className='text-[10px] font-normal uppercase font-body'
                                        >
                                            {category.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
};
