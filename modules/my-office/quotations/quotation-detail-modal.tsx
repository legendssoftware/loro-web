import { memo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Quotation, OrderStatus } from "@/lib/types/quotations";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuotationDetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedQuotation: Quotation | null;
  onUpdate: (uid: number, status: OrderStatus) => void;
  isUpdating: boolean;
}

const QuotationDetailModalComponent = ({
  isOpen,
  onOpenChange,
  selectedQuotation,
  onUpdate,
  isUpdating,
}: QuotationDetailModalProps) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(
    null
  );

  if (!selectedQuotation) return null;

  const totalAmount = Number(selectedQuotation?.totalAmount || 0);
  const totalItems = Number(selectedQuotation?.totalItems || 0);

  const handleStatusChange = (value: OrderStatus) => {
    setSelectedStatus(value);
  };

  const handleUpdate = () => {
    if (selectedQuotation && selectedStatus) {
      onUpdate(selectedQuotation.uid, selectedStatus);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col bg-card [&_.close-button]:hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-normal uppercase font-body">
              QUOTATION #{selectedQuotation?.quotationNumber}
            </DialogTitle>
            <Badge
              variant="outline"
              className="text-[10px] font-body uppercase"
            >
              {selectedQuotation?.status || "N/A"}
            </Badge>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-6 p-1">
            {/* Header Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-xs font-normal tracking-wider uppercase font-body">
                  {selectedQuotation?.client?.name || "N/A"}
                </h3>
                <div className="text-xs font-normal font-body">
                  <div className="flex flex-row items-center gap-1">
                    <p className="text-[10px] font-normal uppercase text-muted-foreground">
                      Contact:
                    </p>
                    <p>{selectedQuotation?.client?.contactPerson || "N/A"}</p>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <p className="text-[10px] font-normal uppercase text-muted-foreground">
                      Email:
                    </p>
                    <p>{selectedQuotation?.client?.email || "N/A"}</p>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <p className="text-[10px] font-normal uppercase text-muted-foreground">
                      Phone:
                    </p>
                    <p>{selectedQuotation?.client?.phone || "N/A"}</p>
                  </div>

                  <div className="flex flex-row items-center gap-1">
                    <p className="text-[10px] font-normal uppercase text-muted-foreground">
                      Alt Phone:
                    </p>
                    <p>
                      {selectedQuotation?.client?.alternativePhone || "N/A"}
                    </p>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <p className="text-[10px] font-normal uppercase text-muted-foreground">
                      Address:
                    </p>
                    <p>{selectedQuotation?.client?.address || "N/A"}</p>
                  </div>
                  <p>
                    {[
                      selectedQuotation?.client?.city,
                      selectedQuotation?.client?.country,
                      selectedQuotation?.client?.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "N/A"}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-normal tracking-wider uppercase font-body">
                  Quotation Details:
                </h3>
                <div className="text-xs font-normal font-body">
                  <div className="flex flex-row items-center gap-1">
                    <p className="text-[10px] font-normal uppercase text-muted-foreground">
                      Reference:
                    </p>
                    <p>{selectedQuotation?.client?.ref || "N/A"}</p>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <p className="text-[10px] font-normal uppercase text-muted-foreground">
                      Date:
                    </p>
                    <p>
                      {selectedQuotation?.quotationDate
                        ? format(
                            new Date(selectedQuotation.quotationDate),
                            "MMM dd, yyyy"
                          )
                        : "N/A"}
                    </p>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <p className="text-[10px] font-normal uppercase text-muted-foreground">
                      Valid Until
                    </p>
                    <p>
                      {selectedQuotation?.validUntil
                        ? format(
                            new Date(selectedQuotation.validUntil),
                            "MMM dd, yyyy"
                          )
                        : "Not specified"}
                    </p>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <p className="text-[10px] font-normal uppercase text-muted-foreground">
                      Total Items
                    </p>
                    <p>{totalItems}</p>
                  </div>
                  <div className="pt-2 mt-2 border-t">
                    <h3 className="text-xs font-normal tracking-wider uppercase font-body">
                      Created By:
                    </h3>
                    {selectedQuotation?.placedBy ? (
                      <div className="mt-1">
                        <div>{`${selectedQuotation.placedBy.name || ""} ${
                          selectedQuotation.placedBy.surname || ""
                        }`}</div>
                        <div className="text-xs">
                          {selectedQuotation.placedBy.email}
                        </div>
                        <div className="text-xs">
                          {selectedQuotation.placedBy.phone}
                        </div>
                        <Badge variant="secondary" className="mt-1 text-[10px]">
                          {selectedQuotation.placedBy.accessLevel?.toUpperCase()}
                        </Badge>
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Items Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-normal tracking-wider uppercase font-body">
                Items ({totalItems})
              </h3>
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2 text-[10px] font-normal uppercase tracking-wider text-left font-body">Product</th>
                      <th className="px-4 py-2 text-[10px] font-normal uppercase tracking-wider text-left font-body">SKU/Reference</th>
                      <th className="px-4 py-2 text-[10px] font-normal uppercase tracking-wider text-center font-body">Quantity</th>
                      <th className="px-4 py-2 text-[10px] font-normal uppercase tracking-wider text-right font-body">Unit Price</th>
                      <th className="px-4 py-2 text-[10px] font-normal uppercase tracking-wider text-right font-body">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedQuotation?.quotationItems?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-[10px] uppercase font-normal font-body">
                          {item?.product?.name || "N/A"}
                        </td>
                        <td className="px-4 py-2 text-[10px] uppercase font-normal font-body">
                          <div className="flex flex-col">
                            <span>SKU: {item?.product?.sku || "N/A"}</span>
                            <span className="text-[10px] text-muted-foreground">
                              Ref: {item?.product?.productRef || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-[10px] font-normal text-center font-body">
                          {item?.quantity || 0}
                        </td>
                        <td className="px-4 py-2 text-[10px] font-normal text-right font-body">
                          R{Number(item?.unitPrice || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-[10px] font-normal text-right font-body">
                          R{Number(item?.totalPrice || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t bg-muted/50">
                      <td colSpan={4} className="py-2 px-4 text-[10px] font-normal uppercase tracking-wider text-right font-body">
                        Total Amount
                      </td>
                      <td className="px-4 py-2 text-[16px] font-normal text-right font-body">
                        R{totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-xs font-normal tracking-wider uppercase font-body">
                  Shipping Information
                </h3>
                <div className="text-xs font-normal font-body">
                  <div className="flex flex-row items-center gap-1">
                    <p className="text-[10px] font-normal uppercase text-muted-foreground">
                      Method:
                    </p>
                    <p>
                      {selectedQuotation?.shippingMethod || "Not specified"}
                    </p>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <p className="text-[10px] font-normal uppercase text-muted-foreground">
                      Packaging:
                    </p>
                    <p>
                      {selectedQuotation?.packagingRequirements ||
                        "Standard packaging"}
                    </p>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <p className="text-[10px] font-normal uppercase text-muted-foreground">
                      Instructions:
                    </p>
                    <p>{selectedQuotation?.shippingInstructions || "None"}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-normal tracking-wider uppercase font-body">
                  Additional Details
                </h3>
                <div className="text-xs font-normal font-body">
                  <div className="flex flex-row items-center gap-1">
                    <p className="text-[10px] font-normal uppercase text-muted-foreground">
                      Created:
                    </p>
                    <p>
                      {selectedQuotation?.createdAt
                        ? format(
                            new Date(selectedQuotation.createdAt),
                            "MMM dd, yyyy HH:mm"
                          )
                        : "N/A"}
                    </p>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <p className="text-[10px] font-normal uppercase text-muted-foreground">
                      Last Updated:
                    </p>
                    <p>
                      {selectedQuotation?.updatedAt
                        ? format(
                            new Date(selectedQuotation.updatedAt),
                            "MMM dd, yyyy HH:mm"
                          )
                        : "N/A"}
                    </p>
                  </div>
                  {selectedQuotation?.resellerCommission && (
                    <div className="flex flex-row items-center gap-1">
                      <p className="text-[10px] font-normal uppercase text-muted-foreground">
                        Commission: R
                        {Number(selectedQuotation.resellerCommission).toFixed(
                          2
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedQuotation?.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-xs font-normal tracking-wider uppercase font-body">
                    Notes
                  </h3>
                  <p className="text-xs font-normal font-body">
                    {selectedQuotation.notes}
                  </p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <div className="flex flex-col gap-4 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-normal uppercase font-body">
              Status:
            </span>
            <Select
              disabled
              value={selectedStatus || selectedQuotation?.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(OrderStatus).map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    className="text-[10px] font-normal uppercase font-body"
                  >
                    <div className="flex items-center gap-2">{status}</div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="w-full h-10 text-[10px] font-normal tracking-wider bg-transparent font-body hover:bg-transparent"
            >
              CLOSE
            </Button>
            <Button
              disabled
              size="sm"
              onClick={handleUpdate}
              className="w-full h-10 text-[10px] font-normal tracking-wider text-white uppercase cursor-not-allowed font-body bg-primary hover:bg-primary/90"
            >
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin" />
                  <p className="font-normal text-white">Updating...</p>
                </div>
              ) : (
                <p className="font-normal text-white">Update Status</p>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const QuotationDetailModal = memo(QuotationDetailModalComponent);
