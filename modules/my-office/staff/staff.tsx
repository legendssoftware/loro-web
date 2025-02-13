import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createUser, fetchUsers, updateUser, User, CreateUserDTO, UpdateUserDTO, AccessLevel, AccountStatus } from "@/helpers/users"
import { useSessionStore } from "@/store/use-session-store"
import { RequestConfig } from "@/lib/types/tasks"
import { PageLoader } from "@/components/page-loader"
import toast from "react-hot-toast"
import { StaffList } from "./staff-list"
import { StaffModals } from "./staff-modals"

export const StaffModule = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
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

    if (isLoading) {
        return (
            <div className="flex flex-col w-full h-full gap-4">
                <div className="flex items-center justify-center w-full h-screen">
                    <PageLoader />
                </div>
            </div>
        )
    }

    return (
        <>
            <StaffList
                staffData={staffData?.users || []}
                onCreateClick={() => setIsCreateModalOpen(true)}
                onUserAction={handleUserAction}
            />
            <StaffModals
                isCreateModalOpen={isCreateModalOpen}
                isEditModalOpen={isEditModalOpen}
                isDeactivateModalOpen={isDeactivateModalOpen}
                selectedUser={selectedUser}
                onCreateModalChange={setIsCreateModalOpen}
                onEditModalChange={setIsEditModalOpen}
                onDeactivateModalChange={setIsDeactivateModalOpen}
                onCreateSubmit={handleCreateSubmit}
                onEditSubmit={handleEditSubmit}
                onDeactivate={handleDeactivate}
                isCreating={createUserMutation.isPending}
                isUpdating={updateUserMutation.isPending}
                isDeactivating={deactivateUserMutation.isPending}
            />
        </>
    )
}