import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuthStore, selectProfileData } from '@/store/auth-store';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '@/lib/services/api-client';
import { format } from 'date-fns';
import {
    showTokenSuccessToast,
    showTokenErrorToast,
} from '@/lib/utils/toast-config';
import { useProductsQuery } from '@/hooks/use-products-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Image, Calendar as CalendarIcon } from 'lucide-react';

// Product Categories - These should match backend categories
export enum ProductCategory {
    MEAT_POULTRY = 'MEAT_POULTRY',
    SEAFOOD = 'SEAFOOD',
    DAIRY = 'DAIRY',
    BAKERY = 'BAKERY',
    PRODUCE = 'PRODUCE',
    BEVERAGES = 'BEVERAGES',
    SNACKS = 'SNACKS',
    CANNED_GOODS = 'CANNED_GOODS',
    FROZEN_FOODS = 'FROZEN_FOODS',
    CLEANING = 'CLEANING',
    PERSONAL_CARE = 'PERSONAL_CARE',
    HARDWARE = 'HARDWARE',
    ELECTRONICS = 'ELECTRONICS',
    TOYS = 'TOYS',
    PET_CARE = 'PET_CARE',
    OTHER = 'OTHER',
}

// Package unit options
export enum PackageUnit {
    PIECE = 'piece',
    UNIT = 'unit',
    BOX = 'box',
    CASE = 'case',
    PACK = 'pack',
    BUNDLE = 'bundle',
    CARTON = 'carton',
    PALLET = 'pallet',
    CONTAINER = 'container',
    BAG = 'bag',
    BOTTLE = 'bottle',
    CAN = 'can',
    JAR = 'jar',
    ROLL = 'roll',
    TUBE = 'tube',
    KIT = 'kit',
    SET = 'set',
    OTHER = 'other',
}

// Product form interface
export interface ProductFormValues {
    name: string;
    description?: string;
    category: ProductCategory;
    price: number;
    salePrice?: number;
    discount?: number;
    barcode: string;
    packageQuantity: number;
    brand: string;
    weight: number;
    stockQuantity: number;
    sku: string;
    imageUrl?: string;
    warehouseLocation?: string;
    productReferenceCode: string;
    reorderPoint?: number;
    isOnPromotion: boolean;
    packageDetails?: string;
    productRef?: string;
    isDeleted: boolean;
    promotionStartDate?: Date;
    promotionEndDate?: Date;
    packageUnit: PackageUnit;
    id?: string; // Optional ID field for editing existing products
}

// Props interface
interface EditProductFormProps {
    onSubmit?: (data: ProductFormValues) => void;
    productData: Partial<ProductFormValues>;
    isLoading?: boolean;
}

// Edit Product Form Component
const EditProductForm: React.FunctionComponent<EditProductFormProps> = ({
    onSubmit,
    productData,
    isLoading = false,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [productImage, setProductImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const profileData = useAuthStore(selectProfileData);
    const { updateProduct } = useProductsQuery();

    // Form hook setup - no resolver for simpler validation
    const { register, handleSubmit, control, setValue, watch } =
        useForm<ProductFormValues>({
            defaultValues: {
                name: '',
                description: '',
                category: ProductCategory.OTHER,
                price: 0,
                salePrice: undefined,
                discount: undefined,
                barcode: '',
                packageQuantity: 1,
                brand: '',
                weight: 0,
                stockQuantity: 0,
                sku: '',
                imageUrl: '',
                warehouseLocation: '',
                productReferenceCode: '',
                reorderPoint: 10,
                isOnPromotion: false,
                packageDetails: '',
                productRef: '',
                isDeleted: false,
                packageUnit: PackageUnit.UNIT,
                ...productData,
            },
        });

    // Watch for promotion status to conditionally show date fields
    const isOnPromotion = watch('isOnPromotion');

    // Handle image selection
    const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);

            // Preview the image
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setProductImage(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Upload image to server
    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            setUploadProgress(10);
            const formData = new FormData();
            formData.append('file', file);

            const response = await axiosInstance.post('/uploads', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total,
                        );
                        setUploadProgress(progress);
                    }
                },
            });

            setUploadProgress(100);

            // Check the response structure and extract the url
            if (response.data && response.data.url) {
                return response.data.url;
            } else {
                showTokenErrorToast('Invalid image upload response', toast);
                return null;
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            showTokenErrorToast('Failed to upload image', toast);
            return null;
        } finally {
            setTimeout(() => setUploadProgress(0), 1000);
        }
    };

    // Submit handler
    const onFormSubmit = async (data: ProductFormValues) => {
        setIsSubmitting(true);

        try {
            // Initialize update data object - using Record to allow any key/value pairs
            const changedData: Record<string, any> = {};

            // Add only changed fields to the update data
            Object.keys(data).forEach((key) => {
                const typedKey = key as keyof ProductFormValues;
                const currentValue = data[typedKey];
                const originalValue = productData[typedKey];

                // Check if value has changed (special handling for dates)
                if (
                    typedKey === 'promotionStartDate' ||
                    typedKey === 'promotionEndDate'
                ) {
                    const currentDate = currentValue as Date | undefined;
                    const originalDate = originalValue as Date | undefined;

                    // Compare dates - either both null/undefined or same date
                    const datesEqual =
                        (!currentDate && !originalDate) ||
                        (currentDate &&
                            originalDate &&
                            currentDate.toISOString().split('T')[0] ===
                                new Date(originalDate)
                                    .toISOString()
                                    .split('T')[0]);

                    if (!datesEqual) {
                        changedData[typedKey] = currentValue;
                    }
                }
                // Handle boolean special case
                else if (typeof currentValue === 'boolean') {
                    if (currentValue !== Boolean(originalValue)) {
                        changedData[typedKey] = currentValue;
                    }
                }
                // Handle normal case
                else if (
                    currentValue !== originalValue &&
                    // Skip imageUrl as we'll handle it separately
                    typedKey !== 'imageUrl'
                ) {
                    changedData[typedKey] = currentValue;
                }
            });

            // Handle image upload separately - only if a new file was selected
            if (selectedFile) {
                const imageUrl = await uploadImage(selectedFile);
                if (imageUrl) {
                    changedData.imageUrl = imageUrl;
                }
            } else if (productData.imageUrl && !productImage) {
                // Image was removed (user clicked "remove image" button)
                changedData.imageUrl = '';
            }

            // Always include the ID for the update
            if (productData.id) {
                changedData.id = productData.id;
            }

            // Only add organization context if there are actual changes
            if (Object.keys(changedData).length > 0) {
                // Add organization context if available
                const apiData = {
                    ...changedData,
                    // Always include productRef, even if it's empty
                    productRef: changedData.productRef || '',
                    ...(profileData?.organisationRef
                        ? {
                              organisation: {
                                  uid: parseInt(
                                      profileData.organisationRef,
                                      10,
                                  ),
                              },
                          }
                        : {}),
                };

                console.log(apiData, 'edited product data');

                // If we have a product ID, update the product
                if (productData?.id) {
                    try {
                        // Convert the ID to a number since the API expects a number
                        const productId = parseInt(productData?.id, 10);

                        // Create a copy of apiData without the 'id' field
                        // since the backend uses 'uid' and expects 'id' in the URL, not request body
                        const { id, ...apiDataWithoutId } = apiData as any;

                        // Call the updateProduct function from the useProductsQuery hook
                        // Cast to Partial<Product> to satisfy the type requirements
                        await updateProduct(productId, apiDataWithoutId as any);

                        // Call the onSubmit callback if provided (for parent component integration)
                        if (onSubmit) {
                            await onSubmit(apiData as ProductFormValues);
                        }

                        // Show success toast
                        showTokenSuccessToast('Product updated successfully', toast);
                    } catch (error) {
                        console.error('Error updating product:', error);
                        showTokenErrorToast('Failed to update product', toast);
                        throw error;
                    }
                } else {
                    showTokenErrorToast('Product ID not found', toast);
                }
            } else {
                // No changes were made
                showTokenSuccessToast('No changes to update', toast);
            }
        } catch (error) {
            console.error('Error processing form data:', error);
            showTokenErrorToast('Failed to process product data', toast);
            // Re-throw the error so the parent component can handle it if needed
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    // Load image preview from productData if available
    useEffect(() => {
        if (productData?.imageUrl) {
            setProductImage(productData.imageUrl);
        }
    }, [productData]);

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <fieldset
                disabled={isLoading || isSubmitting}
                className="space-y-6"
            >
                {/* Basic Information Card */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-thin uppercase font-body">
                            Basic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Product Identity Section */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="name"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Product Name
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="enter product name"
                                    {...register('name')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="brand"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Brand
                                </Label>
                                <Input
                                    id="brand"
                                    placeholder="enter brand name"
                                    {...register('brand')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="category"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Category
                                </Label>
                                <Controller
                                    name="category"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="font-light bg-card border-border">
                                                <SelectValue placeholder="select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(
                                                    ProductCategory,
                                                ).map((category) => (
                                                    <SelectItem
                                                        key={category}
                                                        value={category}
                                                    >
                                                        {category.replace(
                                                            /_/g,
                                                            ' ',
                                                        )}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="description"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="enter product description"
                                    {...register('description')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>
                        </div>

                        {/* Image Upload Section */}
                        <div className="space-y-2">
                            <Label className="block text-xs font-light uppercase font-body">
                                Product Image
                            </Label>
                            <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed rounded-md border-border">
                                {productImage ? (
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <img
                                                src={productImage}
                                                alt="Product preview"
                                                className="max-w-full mx-auto rounded-md max-h-40"
                                            />
                                            {uploadProgress > 0 &&
                                                uploadProgress < 100 && (
                                                    <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/30">
                                                        <span className="text-sm font-medium text-white">
                                                            uploading...{' '}
                                                            {uploadProgress}%
                                                        </span>
                                                    </div>
                                                )}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setProductImage(null);
                                                setSelectedFile(null);
                                                setValue('imageUrl', '');
                                            }}
                                            className="text-xs font-light uppercase font-body"
                                        >
                                            remove image
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Image
                                            className="w-12 h-12 mx-auto text-gray-400"
                                            aria-hidden="true"
                                        />
                                        <div className="flex text-sm text-gray-600">
                                            <label
                                                htmlFor="imageUpload"
                                                className="relative font-light rounded-md cursor-pointer text-primary hover:text-primary/90 focus-within:outline-none"
                                            >
                                                <span className="text-xs uppercase font-body">
                                                    upload a file
                                                </span>
                                                <input
                                                    id="imageUpload"
                                                    name="imageUpload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="sr-only"
                                                    onChange={
                                                        handleImageSelection
                                                    }
                                                />
                                            </label>
                                            <p className="pl-1 text-xs font-light">
                                                or drag and drop
                                            </p>
                                        </div>
                                        <p className="text-xs font-light text-gray-500">
                                            png, jpg, gif up to 10mb
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Product Identifiers Card */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-thin uppercase font-body">
                            Product Identifiers
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="sku"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    SKU
                                </Label>
                                <Input
                                    id="sku"
                                    placeholder="enter sku"
                                    {...register('sku')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="barcode"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Barcode
                                </Label>
                                <Input
                                    id="barcode"
                                    placeholder="enter barcode"
                                    {...register('barcode')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="productReferenceCode"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Reference Code
                                </Label>
                                <Input
                                    id="productReferenceCode"
                                    placeholder="product reference code"
                                    {...register('productReferenceCode')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing Card */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-thin uppercase font-body">
                            Pricing Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="price"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Price
                                </Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...register('price')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="salePrice"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Sale Price
                                </Label>
                                <Input
                                    id="salePrice"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...register('salePrice')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="discount"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Discount (%)
                                </Label>
                                <Input
                                    id="discount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...register('discount')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>
                        </div>

                        {/* Promotion Section */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Controller
                                    name="isOnPromotion"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            id="isOnPromotion"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="border-border"
                                        />
                                    )}
                                />
                                <Label
                                    htmlFor="isOnPromotion"
                                    className="text-xs font-light uppercase font-body"
                                >
                                    Product is on promotion
                                </Label>
                            </div>

                            {isOnPromotion && (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-1">
                                        <Label
                                            htmlFor="promotionStartDate"
                                            className="block text-xs font-light uppercase font-body"
                                        >
                                            Promotion Start Date
                                        </Label>
                                        <Controller
                                            name="promotionStartDate"
                                            control={control}
                                            render={({ field }) => (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className="justify-start w-full font-light text-left bg-card border-border placeholder:text-xs placeholder:font-body"
                                                        >
                                                            <CalendarIcon className="w-4 h-4 mr-2" />
                                                            {field.value ? (
                                                                format(
                                                                    field.value,
                                                                    'PPP',
                                                                )
                                                            ) : (
                                                                <span className="text-xs font-light font-body">
                                                                    select
                                                                    promotion
                                                                    start date
                                                                </span>
                                                            )}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar
                                                            mode="single"
                                                            selected={
                                                                field.value
                                                            }
                                                            onSelect={
                                                                field.onChange
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label
                                            htmlFor="promotionEndDate"
                                            className="block text-xs font-light uppercase font-body"
                                        >
                                            Promotion End Date
                                        </Label>
                                        <Controller
                                            name="promotionEndDate"
                                            control={control}
                                            render={({ field }) => (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className="justify-start w-full font-light text-left bg-card border-border placeholder:text-xs placeholder:font-body"
                                                        >
                                                            <CalendarIcon className="w-4 h-4 mr-2" />
                                                            {field.value ? (
                                                                format(
                                                                    field.value,
                                                                    'PPP',
                                                                )
                                                            ) : (
                                                                <span className="text-xs font-light font-body">
                                                                    select
                                                                    promotion
                                                                    end date
                                                                </span>
                                                            )}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar
                                                            mode="single"
                                                            selected={
                                                                field.value
                                                            }
                                                            onSelect={
                                                                field.onChange
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Inventory Card */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-thin uppercase font-body">
                            Inventory Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="stockQuantity"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Stock Quantity
                                </Label>
                                <Input
                                    id="stockQuantity"
                                    type="number"
                                    step="1"
                                    placeholder="0"
                                    {...register('stockQuantity')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="reorderPoint"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Reorder Point
                                </Label>
                                <Input
                                    id="reorderPoint"
                                    type="number"
                                    step="1"
                                    placeholder="10"
                                    {...register('reorderPoint')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="warehouseLocation"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Warehouse Location
                                </Label>
                                <Input
                                    id="warehouseLocation"
                                    placeholder="enter warehouse location"
                                    {...register('warehouseLocation')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="weight"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Weight (kg)
                                </Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...register('weight')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Package Details Card */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-thin uppercase font-body">
                            Package Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="packageQuantity"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Package Quantity
                                </Label>
                                <Input
                                    id="packageQuantity"
                                    type="number"
                                    step="1"
                                    placeholder="1"
                                    {...register('packageQuantity')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="packageUnit"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Package Unit
                                </Label>
                                <Controller
                                    name="packageUnit"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="font-light bg-card border-border">
                                                <SelectValue placeholder="select a unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(PackageUnit).map(
                                                    (unit) => (
                                                        <SelectItem
                                                            key={unit}
                                                            value={unit}
                                                            className="text-[10px] font-light uppercase font-body"
                                                        >
                                                            {unit}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="packageDetails"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Package Details
                                </Label>
                                <Input
                                    id="packageDetails"
                                    placeholder="additional package info"
                                    {...register('packageDetails')}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </fieldset>

            {/* Submit Button */}
            <Button
                type="submit"
                className="w-full text-xs font-light text-white uppercase font-body"
                disabled={isLoading || isSubmitting}
            >
                {isLoading || isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                        <span className="animate-spin">
                            <svg
                                className="w-4 h-4"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        </span>
                        <span>updating product...</span>
                    </div>
                ) : (
                    'update product'
                )}
            </Button>
        </form>
    );
};

export default EditProductForm;
