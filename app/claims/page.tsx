import { ClaimsList } from "@/components/claims/claims-list";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ClaimForm } from "@/components/claims/claim-form";
import { useClaims } from "@/lib/hooks/useClaims";
import { useState } from "react";
import { Claim, CreateClaimDTO, UpdateClaimDTO } from "@/lib/types/claims";

export default function ClaimsPage() {
    const [selectedClaim, setSelectedClaim] = useState<Claim | undefined>();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const {
        claims,
        isLoading,
        createClaim,
        updateClaim,
        deleteClaim,
        isCreating,
        isUpdating
    } = useClaims();

    const handleCreate = async (data: CreateClaimDTO) => {
        await createClaim(data);
        setIsDialogOpen(false);
    };

    const handleUpdate = async (data: UpdateClaimDTO) => {
        if (selectedClaim) {
            await updateClaim({ uid: selectedClaim.uid, ...data });
            setSelectedClaim(undefined);
            setIsDialogOpen(false);
        }
    };

    const handleEdit = (claim: Claim) => {
        setSelectedClaim(claim);
        setIsDialogOpen(true);
    };

    const handleDelete = async (claim: Claim) => {
        if (window.confirm("Are you sure you want to delete this claim?")) {
            await deleteClaim(claim.uid);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-lg text-gray-600">Loading claims...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Claims</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            New Claim
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {selectedClaim ? "Edit Claim" : "Create New Claim"}
                            </DialogTitle>
                        </DialogHeader>
                        <ClaimForm
                            claim={selectedClaim}
                            onSubmit={selectedClaim ? handleUpdate : handleCreate}
                            isLoading={isCreating || isUpdating}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <ClaimsList
                claims={claims || []}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
} 