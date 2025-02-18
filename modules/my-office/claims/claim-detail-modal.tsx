import { memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Claim } from "@/lib/types/claims";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ClaimDetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedClaim: Claim | null;
  onDelete: (uid: number) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

const ClaimDetailModalComponent = ({
  isOpen,
  onOpenChange,
  selectedClaim,
  onDelete,
}: ClaimDetailModalProps) => {
  if (!selectedClaim) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col bg-card [&_.close-button]:hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-normal font-body">
              CLAIM #{selectedClaim?.uid}
            </DialogTitle>
            <Badge
              variant="outline"
              className="text-[10px] font-body uppercase"
            >
              {selectedClaim?.status || "N/A"}
            </Badge>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-6 p-1">
            {/* Header Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-xs font-normal uppercase text-muted-foreground font-body">
                  Owner Information
                </h4>
                <div className="text-xs font-normal font-body">
                  <div className="flex flex-row items-center gap-1">
                    <p className="text-[10px] text-muted-foreground font-body uppercase">
                      Name:
                    </p>
                    <p className="font-body text-[10px] font-normal uppercase">
                      {`${selectedClaim?.owner?.name || "N/A"} ${
                        selectedClaim?.owner?.surname || ""
                      }`}
                    </p>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <p className="text-[10px] text-muted-foreground font-body uppercase">
                      Phone:
                    </p>
                    <p className="font-body text-[10px] font-normal uppercase">
                      {selectedClaim?.owner?.phone}
                    </p>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <p className="text-[10px] text-muted-foreground font-body uppercase">
                      Email:
                    </p>
                    <p className="font-body text-[10px] font-normal uppercase">
                      {selectedClaim?.owner?.email}
                    </p>
                  </div>
                  <Badge variant="secondary" className="mt-1 text-[10px]">
                    {selectedClaim?.owner?.accessLevel?.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-normal uppercase text-muted-foreground font-body">
                  Claim Details
                </h4>
                <div className="text-xs font-normal font-body">
                  <div className="flex flex-row items-center gap-1">
                    <p className="text-[10px] text-muted-foreground font-body uppercase">
                      Status:
                    </p>
                    <p className="font-body text-[10px] font-normal uppercase">
                      {selectedClaim?.status}
                    </p>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <p className="text-[10px] text-muted-foreground font-body uppercase">
                      Amount:
                    </p>
                    <p className="font-body text-[10px] font-normal uppercase">
                      {selectedClaim?.amount}
                    </p>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <p className="text-[10px] text-muted-foreground font-body uppercase">
                      Category:
                    </p>
                    <p className="font-body text-[10px] font-normal uppercase">
                      {selectedClaim?.category}
                    </p>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <p className="text-[10px] text-muted-foreground font-body uppercase">
                      Created:
                    </p>
                    <p className="font-body text-[10px] font-normal uppercase">
                      {selectedClaim?.createdAt
                        ? format(
                            new Date(selectedClaim.createdAt),
                            "MMM dd, yyyy HH:mm"
                          )
                        : "N/A"}
                    </p>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <p className="text-[10px] text-muted-foreground font-body uppercase">
                      Last Updated:
                    </p>
                    <p className="font-body text-[10px] font-normal uppercase">
                      {selectedClaim?.updatedAt
                        ? format(
                            new Date(selectedClaim.updatedAt),
                            "MMM dd, yyyy HH:mm"
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            {selectedClaim?.description && (
              <div className="space-y-2">
                <h3 className="text-xs font-normal tracking-wider uppercase font-body">
                  Description
                </h3>
                <p className="text-xs font-normal font-body">
                  {selectedClaim.description}
                </p>
              </div>
            )}

            {/* Notes */}
            {selectedClaim?.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-xs font-normal tracking-wider uppercase font-body">
                    Notes
                  </h3>
                  <p className="text-xs font-normal font-body">
                    {selectedClaim.notes}
                  </p>
                </div>
              </>
            )}

            {/* Attachments */}
            {selectedClaim?.attachments &&
              selectedClaim.attachments.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-xs font-normal tracking-wider uppercase font-body">
                      Attachments
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedClaim.attachments.map((attachment, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-[10px] font-body"
                        >
                          {attachment}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

            {/* Branch Information */}
            {selectedClaim?.branch && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-xs font-normal tracking-wider uppercase font-body">
                    Branch Information
                  </h3>
                  <div className="text-xs font-normal font-body">
                    <p>Name: {selectedClaim.branch.name}</p>
                    <p>Location: {selectedClaim.branch?.address}</p>
                    <p>Contact: {selectedClaim.branch?.phone}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <div className="flex flex-row gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full h-10 text-[10px] tracking-wider bg-transparent font-body hover:bg-transparent"
          >
            CLOSE
          </Button>
          <Button
            onClick={() => {
              /* handle update */
            }}
            disabled
            className="w-full h-10 text-[10px] tracking-wider text-white font-body bg-primary hover:bg-primary/90"
          >
            UPDATE CLAIM
          </Button>
          <Button
            variant="destructive"
            onClick={() => onDelete(selectedClaim.uid)}
            disabled
            className="w-full h-10 text-[10px] font-normal tracking-wider font-body"
          >
            DELETE CLAIM
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const ClaimDetailModal = memo(ClaimDetailModalComponent);
