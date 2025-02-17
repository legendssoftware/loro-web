import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { CreateProductDTO, ProductStatus } from "@/lib/types/products";
import { productStatuses } from "@/data/app-data";
import { Loader2 } from "lucide-react";
import { useSessionStore } from "@/store/use-session-store";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Price must be a non-negative number.",
    })
    .optional(),
  stockQuantity: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Stock quantity must be a non-negative number.",
    })
    .optional(),
  sku: z.string().optional(),
  status: z.enum(["AVAILABLE", "LOW_STOCK", "OUT_OF_STOCK"]).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  warehouseLocation: z.string().optional(),
  productReferenceCode: z.string().min(2, {
    message: "Product reference code must be at least 2 characters.",
  }),
  reorderPoint: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Reorder point must be a non-negative number.",
    })
    .optional(),
});

interface NewInventoryFormProps {
  onSubmit: (data: CreateProductDTO) => void;
  isSubmitting: boolean;
}

export const NewInventoryForm = ({
  onSubmit,
  isSubmitting,
}: NewInventoryFormProps) => {
  const { user } = useSessionStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: "",
      stockQuantity: "",
      sku: "",
      status: "AVAILABLE" as ProductStatus,
      imageUrl: "",
      warehouseLocation: "",
      productReferenceCode: "",
      reorderPoint: "10",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      ...values,
      price: values.price ? Number(values.price) : undefined,
      stockQuantity: values.stockQuantity
        ? Number(values.stockQuantity)
        : undefined,
      reorderPoint: values.reorderPoint
        ? Number(values.reorderPoint)
        : undefined,
      reseller: { uid: user?.uid || 0 },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-xs font-light text-white uppercase font-body">
                  Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="productReferenceCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-xs font-light text-white uppercase font-body">
                  Reference Code
                </FormLabel>
                <FormControl>
                  <Input placeholder="ref-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-xs font-light text-white uppercase font-body">
                Description
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="description"
                  className="text-xs font-normal resize-none font-body"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-xs font-light text-white uppercase font-body">
                  Category
                </FormLabel>
                <FormControl>
                  <Input placeholder="category" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-xs font-light text-white uppercase font-body">
                  SKU
                </FormLabel>
                <FormControl>
                  <Input placeholder="sku" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-xs font-light text-white uppercase font-body">
                  Price
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stockQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-xs font-light text-white uppercase font-body">
                  Stock Quantity
                </FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="warehouseLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-xs font-light text-white uppercase font-body">
                  Warehouse Location
                </FormLabel>
                <FormControl>
                  <Input placeholder="A1-B2-C3" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reorderPoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-xs font-light text-white uppercase font-body">
                  Reorder Point
                </FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-xs font-light text-white uppercase font-body">
                  Image URL
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    {...field}
                  />
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
                <FormLabel className="block text-xs font-light text-white uppercase font-body">
                  Status
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {productStatuses.map((status) => (
                      <SelectItem
                        key={status.value}
                        value={status.value}
                        className="text-[10px] font-normal uppercase font-body"
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
        </div>
        <Button type="submit" className="w-full mt-4 text-white font-body text-[10px] uppercase font-normal" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Product"
          )}
        </Button>
      </form>
    </Form>
  );
};
