import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Claim, UpdateClaimDTO, ClaimStatus } from '@/lib/types/claims';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
    status: z.nativeEnum(ClaimStatus),
});

type FormValues = z.infer<typeof formSchema>;

interface EditClaimFormProps {
    claim: Claim;
    onSubmit: (data: UpdateClaimDTO) => void;
    onCancel: () => void;
    isUpdating: boolean;
}

export const EditClaimForm = ({ claim, onSubmit, onCancel, isUpdating }: EditClaimFormProps) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: claim.status as ClaimStatus,
        },
    });

    const handleSubmit = (values: FormValues) => {
        // Only submit if the status has changed
        if (values.status !== claim.status) {
            onSubmit({ status: values.status });
        } else {
            onCancel();
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-4'>
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
                            disabled={isUpdating || form.watch('status') === claim.status}
                            className='w-full text-[10px] font-normal text-white uppercase font-body bg-[#8B5CF6] hover:bg-[#7C3AED]'
                        >
                            {isUpdating ? (
                                <div className='flex items-center justify-center w-full gap-2'>
                                    <span className='w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin' />
                                    <span>Updating...</span>
                                </div>
                            ) : (
                                'Update Status'
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
};
