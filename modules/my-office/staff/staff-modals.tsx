import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { User, CreateUserDTO, UpdateUserDTO } from "@/helpers/users"
import { StaffForm } from "./staff-form"

interface StaffModalsProps {
    isCreateModalOpen: boolean
    isEditModalOpen: boolean
    isDeactivateModalOpen: boolean
    selectedUser: User | null
    onCreateModalChange: (open: boolean) => void
    onEditModalChange: (open: boolean) => void
    onDeactivateModalChange: (open: boolean) => void
    onCreateSubmit: (data: CreateUserDTO) => void
    onEditSubmit: (data: UpdateUserDTO) => void
    onDeactivate: () => void
    isCreating: boolean
    isUpdating: boolean
    isDeactivating: boolean
}

export const StaffModals = ({
    isCreateModalOpen,
    isEditModalOpen,
    isDeactivateModalOpen,
    selectedUser,
    onCreateModalChange,
    onEditModalChange,
    onDeactivateModalChange,
    onCreateSubmit,
    onEditSubmit,
    onDeactivate,
    isCreating,
    isUpdating,
    isDeactivating,
}: StaffModalsProps) => {
    return (
        <>
            <Dialog open={isCreateModalOpen} onOpenChange={onCreateModalChange}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-[14px] font-body uppercase font-normal">Add New Staff Member</DialogTitle>
                        <DialogDescription className="text-[10px] uppercase text-card-foreground font-body font-normal">
                            Add a new staff member by filling out the form below.
                        </DialogDescription>
                    </DialogHeader>
                    <StaffForm
                        onSubmit={onCreateSubmit}
                        submitText={isCreating ? 'Adding...' : 'Add User'}
                        isSubmitting={isCreating}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={isEditModalOpen} onOpenChange={onEditModalChange}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-medium uppercase font-body">Edit Staff Member</DialogTitle>
                        <DialogDescription className="text-[10px] uppercase text-muted-foreground font-body">
                            Update the staff members information below.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <StaffForm
                            user={selectedUser}
                            onSubmit={onEditSubmit}
                            submitText={isUpdating ? 'Saving...' : 'Save Changes'}
                            isSubmitting={isUpdating}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={isDeactivateModalOpen} onOpenChange={onDeactivateModalChange}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-medium uppercase font-body">Deactivate Staff Member</DialogTitle>
                        <DialogDescription className="text-sm uppercase text-card-foreground">
                            Are you sure you want to deactivate this staff member? This action can be reversed later.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2">
                        <Button
                            className="text-[10px] font-normal uppercase font-body"
                            variant="outline"
                            onClick={() => onDeactivateModalChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="text-[10px] font-normal uppercase font-body"
                            variant="destructive"
                            onClick={onDeactivate}
                            disabled={isDeactivating}>
                            {isDeactivating ? 'Deactivating...' : 'Deactivate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
} 