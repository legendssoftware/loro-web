import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/auth-store';
import { axiosInstance } from '@/lib/services/api-client';
import { AccessLevel, User, UserStatus } from '@/lib/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Camera,
    User as UserIcon,
    Mail,
    Phone,
    ShieldCheck,
    ToggleLeft,
    ChevronDown,
    Building,
    Eye,
    EyeOff,
    Key,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useBranchQuery, Branch } from '@/hooks/use-branch-query';

// Form schema definition - less strict for editing (no password required)
const userEditFormSchema = z.object({
    username: z
        .string()
        .min(3, { message: 'Username must be at least 3 characters' })
        .optional(),
    name: z.string().min(1, { message: 'First name is required' }),
    surname: z.string().min(1, { message: 'Last name is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    phone: z.string().optional(),
    photoURL: z.string().optional(),
    accessLevel: z.nativeEnum(AccessLevel).optional(),
    status: z.nativeEnum(UserStatus).optional(),
    userref: z.string().optional(),
    branchId: z.number().optional(),
    password: z.string().optional(),
});

// Infer TypeScript type from the schema
export type UserEditFormValues = z.infer<typeof userEditFormSchema>;

// Extended type for server updates that includes nested objects
export type UserEditServerData = Partial<UserEditFormValues> & {
    branch?: { uid: number };
    organisation?: { uid: number };
};

// Props interface
interface UserEditFormProps {
    onSubmit: (data: UserEditServerData) => Promise<void>;
    initialData: User;
    isLoading?: boolean;
}

// User Edit Form Component
export const UserEditForm: React.FunctionComponent<UserEditFormProps> = ({
    onSubmit,
    initialData,
    isLoading = false,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [userImage, setUserImage] = useState<string | null>(
        initialData.photoURL || null,
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Use the global branch query hook
    const { branches, isLoading: isLoadingBranches } = useBranchQuery();

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Default form values from initialData
    const defaultValues: Partial<UserEditFormValues> = {
        username: initialData.username || '',
        name: initialData.name || '',
        surname: initialData.surname || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        photoURL: initialData.photoURL || '',
        accessLevel: initialData.accessLevel,
        status: initialData.status as UserStatus,
        userref: initialData.userref || '',
        branchId: (initialData.branch as unknown as Branch)?.uid,
        password: '',
    };

    // Initialize form
    const {
        control,
        register,
        handleSubmit,
        formState: { errors, dirtyFields },
        watch,
    } = useForm<UserEditFormValues>({
        resolver: zodResolver(userEditFormSchema),
        defaultValues,
    });

    // Handle image selection
    const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Store the file for later upload
        setSelectedFile(file);

        // Create a preview URL for immediate display
        const previewUrl = URL.createObjectURL(file);
        setUserImage(previewUrl);
    };

    // Upload image function that will be called on form submission
    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            // Create form data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'image');

            // Get access token from auth store for authentication
            const accessToken = useAuthStore.getState().accessToken;

            // Upload directly to the backend using axiosInstance
            const response = await axiosInstance.post(
                '/docs/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            );

            const data = response.data;

            if (data.publicUrl) {
                return data.publicUrl;
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    };

    // Form submission handler
    const onFormSubmit = async (data: UserEditFormValues) => {
        try {
            setIsSubmitting(true);

            // Initialize with only changed fields
            const changedData: UserEditServerData = {};

            // Add only dirty (changed) fields to the update data
            Object.keys(dirtyFields).forEach((key) => {
                const fieldKey = key as keyof UserEditFormValues;
                // Use type assertion to handle the typing issue
                changedData[fieldKey] = data[fieldKey] as any;
            });

            // Special handling for photo upload
            if (selectedFile) {
                const uploadedUrl = await uploadImage(selectedFile);
                if (uploadedUrl) {
                    changedData.photoURL = uploadedUrl;
                }
            }

            // Only include password if it was changed and not empty
            if (data.password && dirtyFields.password) {
                changedData.password = data.password;
            } else {
                delete changedData.password;
            }

            // Special handling for branch - only include if changed
            if (dirtyFields.branchId && changedData.branchId) {
                changedData.branch = { uid: changedData.branchId };
                delete changedData.branchId; // Remove branchId as we're using branch object
            }

            // Get auth store data for organisational context
            const profileData = useAuthStore.getState().profileData;

            // Add organization if needed and it doesn't exist
            if (profileData?.organisationRef && !initialData.organisation && Object.keys(changedData).length > 0) {
                changedData.organisation = {
                    uid: parseInt(profileData.organisationRef, 10),
                };
            }

            // Only submit if there are changes
            if (Object.keys(changedData).length > 0) {
                // Submit the data to the parent component
                await onSubmit(changedData);
            } else {
                // Show message if no changes were made
            }
        } catch (error) {
        } finally {
            setIsSubmitting(false);
        }
    };

    // Clean up object URLs when component unmounts or when image changes
    useEffect(() => {
        return () => {
            if (userImage && !userImage.startsWith('http')) {
                URL.revokeObjectURL(userImage);
            }
        };
    }, [userImage]);

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <fieldset
                disabled={isLoading || isSubmitting}
                className="space-y-6"
            >
                {/* Profile Photo Section */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <UserIcon className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Profile Photo
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center">
                            <div className="relative mb-4">
                                <Avatar className="w-24 h-24 border-2 border-primary">
                                    <AvatarImage
                                        src={userImage || ''}
                                        alt="User avatar"
                                    />
                                    <AvatarFallback className="text-lg font-normal uppercase font-body">
                                        {watch('name').charAt(0) || ''}
                                        {watch('surname').charAt(0) || ''}
                                    </AvatarFallback>
                                </Avatar>
                                <label
                                    htmlFor="user-image-upload"
                                    className="absolute bottom-0 right-0 p-1 rounded-full cursor-pointer bg-primary hover:bg-primary/80"
                                >
                                    <Camera
                                        className="w-4 h-4 text-white"
                                        strokeWidth={1.5}
                                    />
                                </label>
                                <input
                                    id="user-image-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageSelection}
                                    disabled={isLoading || isSubmitting}
                                />
                            </div>
                            {selectedFile && (
                                <p className="text-[10px] font-thin font-body text-primary">
                                    {selectedFile.name} selected
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Basic Information Section */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <UserIcon className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light uppercase font-body">
                                Basic Information
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="name"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    First Name{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    {...register('name')}
                                    placeholder="Brandon"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="surname"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Last Name{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="surname"
                                    {...register('surname')}
                                    placeholder="Nelson"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.surname && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.surname.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="email"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Email{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Mail
                                        className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground"
                                        strokeWidth={1.5}
                                    />
                                    <Input
                                        id="email"
                                        type="email"
                                        {...register('email')}
                                        placeholder="brandon@gmail.com"
                                        className="pl-10 font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="phone"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Phone
                                </Label>
                                <div className="relative">
                                    <Phone
                                        className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground"
                                        strokeWidth={1.5}
                                    />
                                    <Input
                                        id="phone"
                                        {...register('phone')}
                                        placeholder="011 123 4567"
                                        className="pl-10 font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Information Section */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <ShieldCheck
                                className="w-4 h-4"
                                strokeWidth={1.5}
                            />
                            <span className="font-light uppercase font-body">
                                Account Information
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="username"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    {...register('username')}
                                    placeholder="brandon.n"
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                                {errors.username && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.username.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="userref"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    User Reference
                                </Label>
                                <Input
                                    id="userref"
                                    {...register('userref')}
                                    disabled={true}
                                    className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-1">
                                <Label
                                    htmlFor="password"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Change Password
                                </Label>
                                <div className="relative">
                                    <div className="relative">
                                        <Key
                                            className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground"
                                            strokeWidth={1.5}
                                        />
                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            {...register('password')}
                                            placeholder="leave blank to keep current password"
                                            className="pl-10 pr-10 font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                                            onClick={togglePasswordVisibility}
                                        >
                                            {showPassword ? (
                                                <EyeOff
                                                    className="w-4 h-4 text-muted-foreground"
                                                    strokeWidth={1.5}
                                                />
                                            ) : (
                                                <Eye
                                                    className="w-4 h-4 text-muted-foreground"
                                                    strokeWidth={1.5}
                                                />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.password.message}
                                    </p>
                                )}
                                <p className="text-[9px] font-thin text-muted-foreground uppercase">
                                    Only fill this if you want to change the
                                    password
                                </p>
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="accessLevel"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Access Level
                                </Label>
                                <Controller
                                    control={control}
                                    name="accessLevel"
                                    render={({ field }) => (
                                        <div className="relative">
                                            <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck
                                                        className="w-4 h-4 text-muted-foreground"
                                                        strokeWidth={1.5}
                                                    />
                                                    <span className="uppercase text-[10px] font-thin font-body">
                                                        {field.value
                                                            ? field.value.replace(
                                                                  /_/g,
                                                                  ' ',
                                                              )
                                                            : 'SELECT ACCESS LEVEL'}
                                                    </span>
                                                </div>
                                                <ChevronDown
                                                    className="w-4 h-4 ml-2 opacity-50"
                                                    strokeWidth={1.5}
                                                />
                                            </div>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                                <SelectContent>
                                                    {Object.values(
                                                        AccessLevel,
                                                    ).map((level) => (
                                                        <SelectItem
                                                            key={level}
                                                            value={level}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <ShieldCheck
                                                                    className="w-4 h-4"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                />
                                                                <span className="uppercase text-[10px] font-thin font-body">
                                                                    {level.replace(
                                                                        /_/g,
                                                                        ' ',
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="status"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Status
                                </Label>
                                <Controller
                                    control={control}
                                    name="status"
                                    render={({ field }) => (
                                        <div className="relative">
                                            <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                <div className="flex items-center gap-2">
                                                    <ToggleLeft
                                                        className="w-4 h-4 text-muted-foreground"
                                                        strokeWidth={1.5}
                                                    />
                                                    <span className="uppercase text-[10px] font-thin font-body">
                                                        {field.value
                                                            ? field.value.replace(
                                                                  /_/g,
                                                                  ' ',
                                                              )
                                                            : 'SELECT STATUS'}
                                                    </span>
                                                </div>
                                                <ChevronDown
                                                    className="w-4 h-4 ml-2 opacity-50"
                                                    strokeWidth={1.5}
                                                />
                                            </div>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                                <SelectContent>
                                                    {Object.values(
                                                        UserStatus,
                                                    ).map((status) => (
                                                        <SelectItem
                                                            key={status}
                                                            value={status}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <ToggleLeft
                                                                    className="w-4 h-4"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                />
                                                                <span className="uppercase text-[10px] font-thin font-body">
                                                                    {status.replace(
                                                                        /_/g,
                                                                        ' ',
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Branch Selector */}
                            <div className="space-y-1">
                                <Label
                                    htmlFor="branchId"
                                    className="block text-xs font-light uppercase font-body"
                                >
                                    Branch
                                </Label>
                                <Controller
                                    control={control}
                                    name="branchId"
                                    render={({ field }) => (
                                        <div className="relative">
                                            <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                                <div className="flex items-center gap-2">
                                                    <Building
                                                        className="w-4 h-4 text-muted-foreground"
                                                        strokeWidth={1.5}
                                                    />
                                                    <span className="uppercase text-[10px] font-thin font-body">
                                                        {isLoadingBranches
                                                            ? 'LOADING BRANCHES...'
                                                            : branches.find(
                                                                  (b) =>
                                                                      b.uid ===
                                                                      parseInt(
                                                                          field.value?.toString() ||
                                                                              '0',
                                                                      ),
                                                              )?.name ||
                                                              'SELECT BRANCH'}
                                                    </span>
                                                </div>
                                                <ChevronDown
                                                    className="w-4 h-4 ml-2 opacity-50"
                                                    strokeWidth={1.5}
                                                />
                                            </div>
                                            <Select
                                                onValueChange={(value) =>
                                                    field.onChange(
                                                        parseInt(value, 10),
                                                    )
                                                }
                                                value={
                                                    field.value
                                                        ? field.value.toString()
                                                        : undefined
                                                }
                                                disabled={
                                                    isLoadingBranches ||
                                                    branches.length === 0
                                                }
                                            >
                                                <SelectTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                                <SelectContent>
                                                    {branches.length === 0 &&
                                                    !isLoadingBranches ? (
                                                        <SelectItem
                                                            value=""
                                                            disabled
                                                        >
                                                            <span className="text-[10px] font-thin font-body text-muted-foreground">
                                                                No branches
                                                                available
                                                            </span>
                                                        </SelectItem>
                                                    ) : (
                                                        branches.map(
                                                            (branch) => (
                                                                <SelectItem
                                                                    key={
                                                                        branch.uid
                                                                    }
                                                                    value={branch.uid.toString()}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <Building
                                                                            className="w-4 h-4"
                                                                            strokeWidth={
                                                                                1.5
                                                                            }
                                                                        />
                                                                        <span className="uppercase text-[10px] font-thin font-body">
                                                                            {
                                                                                branch.name
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </SelectItem>
                                                            ),
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                />
                                {isLoadingBranches && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Loading branches...
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </fieldset>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4 mt-6 border-t border-border">
                <Button
                    type="submit"
                    variant="outline"
                    disabled={isLoading || isSubmitting}
                    className="h-9 text-[10px] font-light uppercase font-body bg-primary hover:bg-primary/90 text-white"
                >
                    {isSubmitting
                        ? 'Saving...'
                        : isLoading
                          ? 'Loading...'
                          : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
};

export default UserEditForm;
