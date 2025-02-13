import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { claimStatuses } from "@/data/app-data";

export const ClaimsModule = () => {
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
              {claimStatuses?.map((status) => (
                <SelectItem key={status?.value} value={status?.value} className="font-body text-[10px] font-normal uppercase">
                  {status?.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
