import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EllipsisVertical, Plus, Upload, X } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { status } from "@/data/app-data"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createUser, fetchUsers, updateUser, User, CreateUserDTO, UpdateUserDTO, AccessLevel, AccountStatus } from "@/helpers/users"
import { useSessionStore } from "@/store/use-session-store"
import { RequestConfig } from "@/lib/types/tasks"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { PageLoader } from "@/components/page-loader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const StaffModule = () => {
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [roleFilter, setRoleFilter] = useState<string>("all")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const { accessToken } = useSessionStore()
    const queryClient = useQueryClient()

    const config: RequestConfig = {
        headers: {
            token: accessToken || ''
        }
    }

    const { data: staffData, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: () => fetchUsers(config),
        enabled: !!accessToken
    })

    const createUserMutation = useMutation({
        mutationFn: (userData: CreateUserDTO) => createUser(userData, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            toast.success('Staff member added successfully', {
                style: {
                    borderRadius: '5px',
                    background: '#333',
                    color: '#fff',
                    fontFamily: 'var(--font-unbounded)',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    fontWeight: '300',
                    padding: '16px',
                },
                duration: 2000,
                position: 'bottom-center',
                icon: '✅',
            })
            setIsCreateModalOpen(false)
        },
        onError: (error: Error) => {
            const errorMessage = error.message === "item(s) not found"
                ? "Unable to add staff member. Please try again."
                : `Failed to add staff member: ${error.message}`

            toast.error(errorMessage, {
                style: {
                    borderRadius: '5px',
                    background: '#333',
                    color: '#fff',
                    fontFamily: 'var(--font-unbounded)',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    fontWeight: '300',
                    padding: '16px',
                },
                duration: 5000,
                position: 'bottom-center',
                icon: '❌',
            })
        }
    })

    const updateUserMutation = useMutation({
        mutationFn: ({ uid, userData }: { uid: number; userData: UpdateUserDTO }) =>
            updateUser(uid, userData, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            toast.success('Staff member updated successfully', {
                style: {
                    borderRadius: '5px',
                    background: '#333',
                    color: '#fff',
                    fontFamily: 'var(--font-unbounded)',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    fontWeight: '300',
                    padding: '16px',
                },
                duration: 2000,
                position: 'bottom-center',
                icon: '✅',
            })
            setIsEditModalOpen(false)
            setSelectedUser(null)
        },
        onError: (error: Error) => {
            const errorMessage = error.message === "item(s) not found"
                ? "Unable to update staff member. Please try again."
                : `Failed to update staff member: ${error.message}`

            toast.error(errorMessage, {
                style: {
                    borderRadius: '5px',
                    background: '#333',
                    color: '#fff',
                    fontFamily: 'var(--font-unbounded)',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    fontWeight: '300',
                    padding: '16px',
                },
                duration: 5000,
                position: 'bottom-center',
                icon: '❌',
            })
        }
    })

    const deactivateUserMutation = useMutation({
        mutationFn: ({ uid, userData }: { uid: number; userData: UpdateUserDTO }) =>
            updateUser(uid, { ...userData, status: AccountStatus.INACTIVE }, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            toast.success('Staff member deactivated successfully', {
                style: {
                    borderRadius: '5px',
                    background: '#333',
                    color: '#fff',
                    fontFamily: 'var(--font-unbounded)',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    fontWeight: '300',
                    padding: '16px',
                },
                duration: 2000,
                position: 'bottom-center',
                icon: '✅',
            })
            setIsDeactivateModalOpen(false)
            setSelectedUser(null)
        },
        onError: (error: Error) => {
            const errorMessage = error.message === "item(s) not found"
                ? "Unable to deactivate staff member. Please try again."
                : `Failed to deactivate staff member: ${error.message}`

            toast.error(errorMessage, {
                style: {
                    borderRadius: '5px',
                    background: '#333',
                    color: '#fff',
                    fontFamily: 'var(--font-unbounded)',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    fontWeight: '300',
                    padding: '16px',
                },
                duration: 5000,
                position: 'bottom-center',
                icon: '❌',
            })
        }
    })

    const handleStatusChange = (value: string) => {
        setStatusFilter(value)
    }

    const handleRoleChange = (value: string) => {
        setRoleFilter(value)
    }

    const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const userData: CreateUserDTO = {
            email: formData.get('email') as string,
            username: formData.get('username') as string,
            name: formData.get('name') as string,
            surname: formData.get('surname') as string,
            phone: formData.get('phone') as string,
            accessLevel: formData.get('accessLevel') as AccessLevel,
            password: formData.get('password') as string,
            status: AccountStatus.ACTIVE,
            photoURL: 'https://cdn-icons-png.flaticon.com/512/3607/3607444.png' // Default placeholder image
        }
        createUserMutation.mutate(userData)
    }

    const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!selectedUser) return

        const formData = new FormData(e.currentTarget)
        const userData: UpdateUserDTO = {
            email: formData.get('email') as string,
            username: formData.get('username') as string,
            name: formData.get('name') as string,
            surname: formData.get('surname') as string,
            phone: formData.get('phone') as string,
            accessLevel: formData.get('accessLevel') as AccessLevel,
            status: formData.get('status') as AccountStatus,
            photoURL: 'https://cdn-icons-png.flaticon.com/512/3607/3607444.png'
        }
        updateUserMutation.mutate({ uid: selectedUser.uid, userData })
    }

    const handleDeactivate = () => {
        if (!selectedUser) return
        deactivateUserMutation.mutate({
            uid: selectedUser.uid,
            userData: { status: AccountStatus.INACTIVE }
        })
    }

    const handleUserAction = (user: User, action: 'edit' | 'deactivate') => {
        setSelectedUser(user)
        if (action === 'edit') {
            setIsEditModalOpen(true)
        } else {
            setIsDeactivateModalOpen(true)
        }
    }

    const filteredStaff = staffData?.users?.filter((user: User) => {
        const matchesStatus = statusFilter.toLowerCase() === "all" || user.status.toLowerCase() === statusFilter.toLowerCase()
        const matchesRole = roleFilter.toLowerCase() === "all" || user.accessLevel.toLowerCase() === roleFilter.toLowerCase()
        const searchTerms = searchQuery.toLowerCase().split(' ')
        const matchesSearch = searchQuery === "" || searchTerms.every(term =>
            user.name.toLowerCase().includes(term) ||
            user.surname.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user.username.toLowerCase().includes(term) ||
            user.phone.toLowerCase().includes(term)
        )
        return matchesStatus && matchesRole && matchesSearch
    })

    const UserForm = ({ user, onSubmit, submitText }: { user?: User, onSubmit: (e: React.FormEvent<HTMLFormElement>) => void, submitText: string }) => {
        const [imagePreview, setImagePreview] = useState<string | null>(user?.photoURL || null)

        const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (file) {
                const reader = new FileReader()
                reader.onloadend = () => {
                    setImagePreview(reader.result as string)
                }
                reader.readAsDataURL(file)
            }
        }

        return (
            <form onSubmit={onSubmit} className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="font-body font-normal uppercase text-[10px]">First Name</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="John"
                            defaultValue={user?.name}
                            required
                            className="text-[12px]"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="surname" className="font-body font-normal uppercase text-[10px]">Last Name</Label>
                        <Input
                            id="surname"
                            name="surname"
                            placeholder="Doe"
                            defaultValue={user?.surname}
                            required
                            className="text-[12px]"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="font-body font-normal uppercase text-[10px]">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="jdoe@loro.co.za"
                            defaultValue={user?.email}
                            required
                            className="text-[12px]"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="username" className="font-body font-normal uppercase text-[10px]">Username</Label>
                        <Input
                            id="username"
                            name="username"
                            placeholder="jdoe"
                            defaultValue={user?.username}
                            required
                            className="text-[12px]"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="phone" className="font-body font-normal uppercase text-[10px]">Phone</Label>
                        <Input
                            id="phone"
                            name="phone"
                            placeholder="+27 11 765 2357"
                            defaultValue={user?.phone}
                            required
                            className="text-[12px]"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="accessLevel" className="font-body font-normal uppercase text-[10px]">Access Level</Label>
                        <Select name="accessLevel" defaultValue={user?.accessLevel}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select access level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={AccessLevel.USER} className="font-body text-[10px] uppercase">User</SelectItem>
                                <SelectItem value={AccessLevel.ADMIN} className="font-body text-[10px] uppercase">Admin</SelectItem>
                                <SelectItem value={AccessLevel.MANAGER} className="font-body text-[10px] uppercase">Manager</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {user && (
                    <div className="grid gap-2">
                        <Label htmlFor="status" className="font-body font-normal uppercase text-[10px]">Account Status</Label>
                        <Select name="status" defaultValue={user?.status}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={AccountStatus.ACTIVE} className="font-body text-[10px] uppercase">Active</SelectItem>
                                <SelectItem value={AccountStatus.INACTIVE} className="font-body text-[10px] uppercase">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
                {!user && (
                    <div className="grid gap-2">
                        <Label htmlFor="password" className="font-body font-normal uppercase text-[10px]">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="****************************"
                            required
                            className="text-[12px]"
                        />
                    </div>
                )}
                <div className="grid gap-2">
                    <Label htmlFor="photo" className="font-body font-normal uppercase text-[10px]">Profile Photo</Label>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <Input
                                id="photo"
                                name="photo"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => document.getElementById('photo')?.click()}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                <p className="font-body font-normal uppercase text-[9px]">Upload Photo</p>
                            </Button>
                        </div>
                        {imagePreview && (
                            <div className="relative group">
                                <Avatar className="h-16 w-16 ring-2 ring-primary">
                                    <AvatarImage src={imagePreview} alt="Preview" />
                                    <AvatarFallback className="bg-black text-white text-sm font-body uppercase">
                                        {user ? `${user.name[0]}${user.surname[0]}` : 'Preview'}
                                    </AvatarFallback>
                                </Avatar>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => setImagePreview(null)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="submit"
                        className="text-xs text-white font-body font-normal uppercase"
                        disabled={createUserMutation.isPending || updateUserMutation.isPending}>
                        {submitText}
                    </Button>
                </DialogFooter>
            </form>
        )
    }

    if (isLoading) {
        return (
            <div className="w-full h-full flex flex-col gap-4">
                <div className="flex flex-row items-center justify-between gap-2">
                    <h2 className="text-[14px] font-body font-normal uppercase">Staff Overview</h2>
                    <div className="flex flex-row items-center justify-center gap-2">
                        <Input
                            placeholder="Search staff..."
                            className="w-[300px] shadow-none bg-card"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Select value={statusFilter} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-[180px] shadow-none bg-card outline-none">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="font-body text-[10px] uppercase">
                                    All Status
                                </SelectItem>
                                {status?.map((status) => (
                                    <SelectItem key={status?.value} value={status?.value} className="font-body text-[10px] uppercase">
                                        {status?.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={roleFilter} onValueChange={handleRoleChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="font-body text-[10px] uppercase">
                                    All Roles
                                </SelectItem>
                                <SelectItem value="USER" className="font-body text-[10px] uppercase">User</SelectItem>
                                <SelectItem value="ADMIN" className="font-body text-[10px] uppercase">Admin</SelectItem>
                                <SelectItem value="MANAGER" className="font-body text-[10px] uppercase">Manager</SelectItem>
                            </SelectContent>
                        </Select>
                        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="default" size="sm">
                                    <Plus size={16} strokeWidth={1.5} className="text-white" />
                                    <p className="text-xs font-normal font-body uppercase text-white">Add</p>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle className="text-[14px] font-body uppercase font-normal">Add New Staff Member</DialogTitle>
                                    <DialogDescription className="text-[10px] uppercase text-card-foreground font-body font-normal">
                                        Add a new staff member by filling out the form below.
                                    </DialogDescription>
                                </DialogHeader>
                                <UserForm onSubmit={handleCreateSubmit} submitText={createUserMutation.isPending ? 'Adding...' : 'Add Staff Member'} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                <div className="h-screen w-full flex items-center justify-center">
                    <PageLoader />
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-full flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between gap-2">
                <h2 className="text-[14px] font-body font-normal uppercase">Staff Overview</h2>
                <div className="flex flex-row items-center justify-center gap-2">
                    <Input
                        placeholder="search..."
                        className="w-[300px] shadow-none bg-card"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Select value={statusFilter} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[180px] shadow-none bg-card outline-none">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            {status?.map((status) => (
                                <SelectItem key={status?.value} value={status?.value} className="font-body text-[10px] uppercase">
                                    {status?.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={roleFilter} onValueChange={handleRoleChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="font-body text-[10px] uppercase">
                                All Roles
                            </SelectItem>
                            <SelectItem value="USER" className="font-body text-[10px] uppercase">User</SelectItem>
                            <SelectItem value="ADMIN" className="font-body text-[10px] uppercase">Admin</SelectItem>
                            <SelectItem value="MANAGER" className="font-body text-[10px] uppercase">Manager</SelectItem>
                        </SelectContent>
                    </Select>
                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="default" size="sm">
                                <Plus size={16} strokeWidth={1.5} className="text-white" />
                                <p className="text-xs font-normal font-body uppercase text-white">Add</p>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle className="text-[14px] font-body uppercase font-normal">Add New Staff Member</DialogTitle>
                                <DialogDescription className="text-[10px] uppercase text-card-foreground font-body font-normal">
                                    Add a new staff member by filling out the form below.
                                </DialogDescription>
                            </DialogHeader>
                            <UserForm onSubmit={handleCreateSubmit} submitText={createUserMutation.isPending ? 'Saving...' : 'Save User'} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {filteredStaff?.map((user: User) => (
                    <motion.div
                        key={user.uid}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}>
                        <Card className="p-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-8 w-8 ring-2 ring-primary">
                                            {user?.photoURL && (
                                                <AvatarImage
                                                    src={user.photoURL}
                                                    alt={`${user.name} ${user.surname}`}
                                                />
                                            )}
                                            <AvatarFallback className="bg-black text-white text-[10px] font-body uppercase">
                                                {`${user.name?.[0]}${user.surname?.[0]}`}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col justify-start gap-2">
                                            <h3 className="font-body text-[12px] font-normal uppercase">
                                                {user.name?.[0]} {user.surname}
                                            </h3>
                                            <div>
                                                <p className="text-[10px] text-card-foreground font-body font-normal">{user?.email}</p>
                                                <p className="text-[10px] text-card-foreground font-body font-normal">{user?.phone}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="text-[10px] px-4 py-1 bg-secondary rounded font-body uppercase">
                                                    {user.accessLevel}
                                                </span>
                                                <span className="text-[10px] px-4 py-1 bg-secondary rounded font-body uppercase">
                                                    {user.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <EllipsisVertical className="cursor-pointer" strokeWidth={1.5} size={20} />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => handleUserAction(user, 'edit')}>
                                                <p className="text-[9px] font-normal font-body uppercase">Edit</p>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleUserAction(user, 'deactivate')}>
                                                <p className="text-[9px] text-red-500 font-normal font-body uppercase">Deactivate</p>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-body font-medium">Edit Staff Member</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Update the staff members information below.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <UserForm
                            user={selectedUser}
                            onSubmit={handleEditSubmit}
                            submitText={updateUserMutation.isPending ? 'saving...' : 'Save Changes'}
                        />
                    )}
                </DialogContent>
            </Dialog>
            <Dialog open={isDeactivateModalOpen} onOpenChange={setIsDeactivateModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-body font-medium uppercase">Deactivate Staff Member</DialogTitle>
                        <DialogDescription className="text-sm text-card-foreground uppercase">
                            Are you sure you want to deactivate this staff member? This action can be reversed later.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2">
                        <Button
                            className="font-body text-xs uppercase font-normal"
                            variant="outline"
                            onClick={() => setIsDeactivateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="font-body text-xs uppercase font-normal"
                            variant="destructive"
                            onClick={handleDeactivate}
                            disabled={deactivateUserMutation.isPending}>
                            {deactivateUserMutation.isPending ? 'Deactivating...' : 'Deactivate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}