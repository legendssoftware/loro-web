import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { merchandiseStatuses } from "@/data/app-data";
import { useState } from "react";

export const MerchandiseModule = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  return (
    <div className="flex flex-col w-full h-full gap-2">
      <div className="flex flex-row items-center justify-end gap-2">
        <div className="flex flex-row items-center justify-center gap-2">
          <Input placeholder="search..." className="w-[300px]" />
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="font-body text-[10px] font-normal uppercase"
              >
                All Statuses
              </SelectItem>
              {merchandiseStatuses?.map(
                (status: { value: string; label: string }) => (
                  <SelectItem
                    key={status?.value}
                    value={status?.value}
                    className="font-body text-[10px] font-normal uppercase"
                  >
                    {status?.label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
