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
                        <Badge
                            variant={
                                selectedLead.status === "APPROVED"
                                    ? "default"
                                    : selectedLead.status === "REVIEW"
                                    ? "secondary"
                                    : "destructive"
                            }
                            className="text-[10px] font-body uppercase"
                        >
                            {selectedLead.status}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription className="text-[10px] font-body uppercase">
                        Created on {format(new Date(selectedLead.createdAt), "MMMM d, yyyy")}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold uppercase font-body">{selectedLead.name}</h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                            <p className="text-[10px] font-normal uppercase font-body">{selectedLead.email}</p>
                            <p className="text-[10px] font-normal uppercase font-body">{selectedLead.phone}</p>
                        </div>
                    </div>

                    <Separator />

                    {selectedLead.notes && (
                        <>
                            <div>
                                <h4 className="mb-2 font-medium uppercase font-body">Notes</h4>
                                <p className="text-[10px] font-normal font-body whitespace-pre-wrap text-muted-foreground">
                                    {selectedLead.notes}
                                </p>
                            </div>
                            <Separator />
                        </>
                    )}

                    <div className="space-y-2">
                        <h4 className="font-medium uppercase font-body">Owner Information</h4>
                        <div className="text-sm text-muted-foreground">
                            <p className="text-[10px] font-normal font-body uppercase">
                                {selectedLead?.owner?.name} {selectedLead?.owner?.surname}
                            </p>
                            {selectedLead?.branch && (
                                <p className="text-[10px] font-normal font-body uppercase">
                                    Branch: {selectedLead?.branch?.name}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isUpdating || isDeleting || isRestoring}
                            className="text-[10px] font-body uppercase font-normal w-1/3"
                        >
                            Close
                        </Button>
                        {selectedLead.isDeleted ? (
                            <Button
                                variant="secondary"
                                onClick={() => onRestore(selectedLead)}
                                disabled={isUpdating || isDeleting || isRestoring}
                                className="text-[10px] font-body uppercase font-normal w-1/3"
                            >
                                {isRestoring ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
                                    className="text-[10px] font-body uppercase font-normal w-1/3"
                                >
                                    {isUpdating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
                                    className="text-[10px] font-body uppercase font-normal w-1/3"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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