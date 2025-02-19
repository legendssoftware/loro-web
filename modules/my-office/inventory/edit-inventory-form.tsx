import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { productStatuses, productCategories } from "@/data/app-data";
import { ProductStatus, UpdateProductDTO } from "@/lib/types/products";
import { Product } from "@/lib/types/products";
import { useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string(),
  category: z.string(),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Price must be a non-negative number.",
  }),
  salePrice: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Sale price must be a non-negative number.",
  }),
  saleStart: z.string().optional(),
  saleEnd: z.string().optional(),
  discount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Discount must be a non-negative number.",
  }),
  barcode: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Barcode must be a non-negative number.",
  }),
  packageQuantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Package quantity must be a non-negative number.",
  }),
  brand: z.string(),
  weight: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Weight must be a non-negative number.",
  }),
  status: z.enum([
    "active",
    "inactive",
    "hidden",
    "special",
    "new",
    "discontinued",
    "bestseller",
    "hotdeals",
    "outofstock"
  ]),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isOnPromotion: z.boolean().default(false),
});

interface EditInventoryFormProps {
  product: Product;
  onSubmit: (data: UpdateProductDTO) => void;
}

export const EditInventoryForm = ({
  product,
  onSubmit,
}: EditInventoryFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      category: product?.category ?? "",
      price: product?.price?.toString() ?? "0",
      salePrice: product?.salePrice?.toString() ?? "0",
      discount: product?.discount?.toString() ?? "0",
      barcode: product?.barcode?.toString() ?? "",
      packageQuantity: product?.packageQuantity?.toString() ?? "0",
      brand: product?.brand ?? "",
      weight: product?.weight?.toString() ?? "0",
      status: product?.status as ProductStatus ?? "AVAILABLE" as ProductStatus,
      imageUrl: product?.imageUrl ?? "",
      isOnPromotion: product?.isOnPromotion ?? false,
    },
  });

  // Expose form submission method to parent
  useEffect(() => {
    const subscription = form.watch((value) => {
      const isValid = form.formState.isValid;
      if (isValid) {
        const formData = {
          ...value,
          price: Number(value.price),
          salePrice: Number(value.salePrice),
          discount: Number(value.discount),
          barcode: value.barcode,
          packageQuantity: Number(value.packageQuantity),
          weight: Number(value.weight),
        };
        onSubmit(formData);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onSubmit]);

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-normal uppercase font-body">Name</FormLabel>
                <FormControl>
                  <Input placeholder="Product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-normal uppercase font-body">Brand</FormLabel>
                <FormControl>
                  <Input placeholder="Brand name" {...field} />
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
              <FormLabel className="text-[10px] font-normal uppercase font-body">Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Product description"
                  className="font-normal resize-none text-md md:text-xs font-body"
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
                <FormLabel className="text-[10px] font-normal uppercase font-body">Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {productCategories.map((category) => (
                      <SelectItem
                        key={category.value}
                        value={category.value}
                        className="text-[10px] font-normal uppercase font-body"
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
          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-normal uppercase font-body">Barcode</FormLabel>
                <FormControl>
                  <Input placeholder="1234567890" {...field} />
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
                <FormLabel className="text-[10px] font-normal uppercase font-body">Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="packageQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-normal uppercase font-body">Package Quantity</FormLabel>
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
            name="salePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-normal uppercase font-body">Sale Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-normal uppercase font-body">Discount (%)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="100" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-normal uppercase font-body">Weight (g)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="0" {...field} />
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
                <FormLabel className="text-[10px] font-normal uppercase font-body">Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-normal uppercase font-body">Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isOnPromotion"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="w-4 h-4 border-gray-300 rounded text-primary focus:ring-primary"
                />
              </FormControl>
              <FormLabel className="text-[10px] font-normal uppercase font-body">On Promotion</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
