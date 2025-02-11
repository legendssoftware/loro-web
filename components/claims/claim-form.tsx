import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Claim, CreateClaimDTO, UpdateClaimDTO } from "@/lib/types/claims";
import { ClaimStatus } from "@/lib/enums/finance.enums";
import { useAuth } from "@/providers/auth.provider";

const claimFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    amount: z.number().min(0, "Amount must be greater than 0"),
    category: z.string().min(1, "Category is required"),
    status: z.nativeEnum(ClaimStatus)
});

type ClaimFormData = z.infer<typeof claimFormSchema>;

interface ClaimFormProps {
    claim?: Claim;
    onSubmit: (data: CreateClaimDTO | (UpdateClaimDTO & { id: number })) => void;
    isLoading?: boolean;
}

export function ClaimForm({ claim, onSubmit, isLoading }: ClaimFormProps) {
    const { user } = useAuth();

    const form = useForm<ClaimFormData>({
        resolver: zodResolver(claimFormSchema),
        defaultValues: claim ? {
            title: claim.title,
            description: claim.description,
            amount: claim.amount,
            category: claim.category,
            status: claim.status
        } : {
            title: "",
            description: "",
            amount: 0,
            category: "",
            status: ClaimStatus.PENDING
        }
    });

    const handleSubmit = (values: ClaimFormData) => {
        if (claim) {
            const updateData: UpdateClaimDTO & { id: number } = {
                ...values,
                id: claim.id
            };
            onSubmit(updateData);
        } else {
            const createData: CreateClaimDTO = {
                ...values,
                owner: { uid: Number(user?.uid) || 0 },
                branch: { uid: 1 } // Default to main branch for now
            };
            onSubmit(createData);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter claim title" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea 
                                    placeholder="Enter claim description" 
                                    className="resize-none" 
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                                <Input 
                                    type="number" 
                                    placeholder="Enter claim amount" 
                                    {...field} 
                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter claim category" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select claim status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Object.values(ClaimStatus).map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Saving..." : claim ? "Update Claim" : "Create Claim"}
                </Button>
            </form>
        </Form>
    );
} 