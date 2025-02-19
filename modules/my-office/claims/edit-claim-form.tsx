import { memo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Claim, ClaimStatus } from "@/lib/types/claims";

const formSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  notes: z.string().optional(),
  status: z.nativeEnum(ClaimStatus),
  attachments: z.array(z.string()).optional(),
});

export type FormData = z.infer<typeof formSchema>;

interface EditClaimFormProps {
  claim: Claim;
  onSubmit: (data: FormData) => void;
}

const EditClaimFormComponent = ({ claim, onSubmit }: EditClaimFormProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: claim.amount?.toString() || "",
      category: claim.category || "",
      description: claim.description || "",
      notes: claim.notes || "",
      status: claim.status || ClaimStatus.PENDING,
      attachments: claim.attachments || [],
    },
  });

  const handleSubmit = (data: FormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-normal uppercase font-body">
                  Amount
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    className="h-8 text-[10px] font-normal uppercase font-body"
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-normal uppercase font-body">
                  Category
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-8 text-[10px] font-normal uppercase font-body"
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-normal uppercase font-body">
                Status
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="h-8 text-[10px] font-normal uppercase font-body">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(ClaimStatus).map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                      className="text-[10px] font-normal uppercase font-body"
                    >
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-normal uppercase font-body">
                Description
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className="min-h-[100px] text-[10px] font-normal font-body"
                />
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-normal uppercase font-body">
                Notes
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className="min-h-[100px] text-[10px] font-normal font-body"
                />
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export const EditClaimForm = memo(EditClaimFormComponent); 