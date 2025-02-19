import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createUser, fetchUsers, updateUser, User, CreateUserDTO, UpdateUserDTO, AccountStatus } from "@/helpers/users"
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
    const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined)
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [roleFilter, setRoleFilter] = useState<string>("all")
    const { accessToken } = useSessionStore()
    const queryClient = useQueryClient()

    const config: RequestConfig = {
        headers: {
            token: accessToken || ''
        }
    }

    const { data: staffData, isLoading } = useQuery({
        queryKey: ['users', currentPage, statusFilter, roleFilter, searchQuery],
        queryFn: () => fetchUsers({
            ...config,
            page: currentPage,
            limit: 20,
            filters: {
                ...(statusFilter !== 'all' && { status: statusFilter }),
                ...(roleFilter !== 'all' && { accessLevel: roleFilter }),
                ...(searchQuery && { search: searchQuery })
            }
        }),
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
            setSelectedUser(undefined)
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
            setSelectedUser(undefined)
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

    const handleCreateSubmit = (formData: CreateUserDTO) => {
        createUserMutation.mutate(formData)
    }

    const handleEditSubmit = (formData: UpdateUserDTO) => {
        if (!selectedUser) return
        updateUserMutation.mutate({ uid: selectedUser.uid, userData: formData })
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

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleSearch = (query: string) => {
        setSearchQuery(query)
        setCurrentPage(1) // Reset to first page when searching
    }

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status)
        setCurrentPage(1) // Reset to first page when filtering
    }

    const handleRoleFilter = (role: string) => {
        setRoleFilter(role)
        setCurrentPage(1) // Reset to first page when filtering
    }

    const handleModalClose = () => {
        setSelectedUser(undefined)
        setIsEditModalOpen(false)
        setIsDeactivateModalOpen(false)
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
                staffData={staffData?.data || []}
                onCreateClick={() => setIsCreateModalOpen(true)}
                onUserAction={handleUserAction}
                currentPage={currentPage}
                totalPages={staffData?.meta?.totalPages || 1}
                onPageChange={handlePageChange}
                onSearch={handleSearch}
                onStatusFilter={handleStatusFilter}
                onRoleFilter={handleRoleFilter}
                searchQuery={searchQuery}
                statusFilter={statusFilter}
                roleFilter={roleFilter}
            />
            <StaffModals
                isCreateModalOpen={isCreateModalOpen}
                isEditModalOpen={isEditModalOpen}
                isDeactivateModalOpen={isDeactivateModalOpen}
                selectedUser={selectedUser}
                onCreateModalChange={setIsCreateModalOpen}
                onEditModalChange={handleModalClose}
                onDeactivateModalChange={handleModalClose}
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