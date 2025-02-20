import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, CreateUserDTO, UpdateUserDTO, AccountStatus, AccessLevel } from '@/helpers/users';
import { StaffForm, FormSubmitData } from './staff-form';

interface StaffModalsProps {
    isCreateModalOpen: boolean;
    isEditModalOpen: boolean;
    isDeactivateModalOpen: boolean;
    selectedUser?: User;
    onCreateModalChange: (open: boolean) => void;
    onEditModalChange: (open: boolean) => void;
    onDeactivateModalChange: (open: boolean) => void;
    onCreateSubmit: (data: CreateUserDTO) => void;
    onEditSubmit: (data: UpdateUserDTO) => void;
    onDeactivate: (user: User) => void;
    isCreating?: boolean;
    isUpdating?: boolean;
    isDeactivating?: boolean;
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
    const handleCreateSubmit = (data: FormSubmitData) => {
        if (!data.name || !data.surname || !data.email || !data.username || !data.phone || !data.password) {
            return; // Form validation should prevent this case
        }

        const createDTO: CreateUserDTO = {
            name: data.name,
            surname: data.surname,
            email: data.email,
            username: data.username,
            phone: data.phone,
            password: data.password,
            photoURL: data.photoURL || '',
            accessLevel: data.accessLevel || AccessLevel.USER,
            status: data.status || AccountStatus.ACTIVE,
            userref: data.username,
            isDeleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            branch: data.branch ? { uid: data.branch.uid, name: 'Default Branch' } : undefined,
            organisation: data.organisation ? { uid: data.organisation.uid, name: 'Default Organisation' } : undefined,
            organisationRef: data.organisation?.uid.toString(),
        };
        onCreateSubmit(createDTO);
    };

    const handleEditSubmit = (data: FormSubmitData) => {
        const updateDTO: UpdateUserDTO = {
            ...(data.name && { name: data.name }),
            ...(data.surname && { surname: data.surname }),
            ...(data.email && { email: data.email }),
            ...(data.username && { username: data.username }),
            ...(data.phone && { phone: data.phone }),
            ...(data.accessLevel && { accessLevel: data.accessLevel }),
            ...(data.password && { password: data.password }),
            ...(data.photoURL && { photoURL: data.photoURL }),
            ...(data.branch && { branch: { uid: data.branch.uid, name: 'Default Branch' } }),
            ...(data.organisation && {
                organisation: { uid: data.organisation.uid, name: 'Default Organisation' },
                organisationRef: data.organisation.uid.toString(),
            }),
        };
        onEditSubmit(updateDTO);
    };

    return (
        <>
            <Dialog open={isCreateModalOpen} onOpenChange={onCreateModalChange}>
                <DialogContent className='sm:max-w-[425px]'>
                    <DialogHeader>
                        <DialogTitle className='text-[14px] font-body uppercase font-normal'>
                            Add New Staff Member
                        </DialogTitle>
                        <DialogDescription className='text-[10px] uppercase text-card-foreground font-body font-normal'>
                            Add a new staff member by filling out the form below.
                        </DialogDescription>
                    </DialogHeader>
                    <StaffForm
                        onSubmit={handleCreateSubmit}
                        submitText={isCreating ? 'Adding...' : 'Add User'}
                        isSubmitting={isCreating}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={isEditModalOpen} onOpenChange={onEditModalChange}>
                <DialogContent className='sm:max-w-[425px]'>
                    <DialogHeader>
                        <DialogTitle className='text-lg font-medium uppercase font-body'>Edit Staff Member</DialogTitle>
                        <DialogDescription className='text-[10px] uppercase text-muted-foreground font-body'>
                            Update the staff members information below.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <StaffForm
                            user={selectedUser}
                            onSubmit={handleEditSubmit}
                            submitText={isUpdating ? 'Saving...' : 'Update Profile'}
                            isSubmitting={isUpdating}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={isDeactivateModalOpen} onOpenChange={onDeactivateModalChange}>
                <DialogContent className='sm:max-w-[425px]'>
                    <DialogHeader>
                        <DialogTitle className='text-lg font-medium uppercase font-body'>
                            Deactivate Staff Member
                        </DialogTitle>
                        <DialogDescription className='text-[10px] uppercase text-muted-foreground font-body'>
                            Are you sure you want to deactivate this staff member?
                        </DialogDescription>
                    </DialogHeader>
                    <div className='py-4'>
                        <p className='text-[12px] font-normal font-body'>
                            This action will deactivate the staff member&apos;s account. They will no longer be able to
                            access the system.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            type='button'
                            variant='destructive'
                            size='sm'
                            className='text-[10px] font-normal uppercase font-body'
                            onClick={() => selectedUser && onDeactivate(selectedUser)}
                            disabled={isDeactivating}
                        >
                            {isDeactivating ? 'Deactivating...' : 'Deactivate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
