import { memo } from "react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/lib/types/leads";
import { Separator } from "@/components/ui/separator";

interface LeadDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedLead: Lead | null;
    onUpdate: (lead: Lead) => void;
    onDelete: (lead: Lead) => void;
    onRestore: (lead: Lead) => void;
    isUpdating: boolean;
    isDeleting: boolean;
    isRestoring: boolean;
}

const LeadDetailModal = ({
    isOpen,
    onClose,
    selectedLead,
    onUpdate,
    onDelete,
    onRestore,
    isUpdating,
    isDeleting,
    isRestoring,
}: LeadDetailModalProps) => {
    if (!selectedLead) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Lead Details</span>
                        <Badge
                            variant={
                                selectedLead.status === "APPROVED"
                                    ? "default"
                                    : selectedLead.status === "REVIEW"
                                    ? "secondary"
                                    : "destructive"
                            }
                            className="text-xs"
                        >
                            {selectedLead.status}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Created on {format(new Date(selectedLead.createdAt), "MMMM d, yyyy")}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold">{selectedLead.name}</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p>{selectedLead.email}</p>
                            <p>{selectedLead.phone}</p>
                        </div>
                    </div>

                    <Separator />

                    {selectedLead.notes && (
                        <>
                            <div>
                                <h4 className="font-medium mb-2">Notes</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {selectedLead.notes}
                                </p>
                            </div>
                            <Separator />
                        </>
                    )}

                    <div className="space-y-2">
                        <h4 className="font-medium">Owner Information</h4>
                        <div className="text-sm text-muted-foreground">
                            <p>
                                {selectedLead.owner.name} {selectedLead.owner.surname}
                            </p>
                            {selectedLead.branch && (
                                <p className="text-sm text-muted-foreground">
                                    Branch: {selectedLead.branch.name}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isUpdating || isDeleting || isRestoring}
                        >
                            Close
                        </Button>
                        {selectedLead.isDeleted ? (
                            <Button
                                variant="secondary"
                                onClick={() => onRestore(selectedLead)}
                                disabled={isUpdating || isDeleting || isRestoring}
                            >
                                {isRestoring ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Restoring...
                                    </>
                                ) : (
                                    "Restore Lead"
                                )}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="secondary"
                                    onClick={() => onUpdate(selectedLead)}
                                    disabled={isUpdating || isDeleting || isRestoring}
                                >
                                    {isUpdating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        "Update Status"
                                    )}
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => onDelete(selectedLead)}
                                    disabled={isUpdating || isDeleting || isRestoring}
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        "Delete"
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default memo(LeadDetailModal); 