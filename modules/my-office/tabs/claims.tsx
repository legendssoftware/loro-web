import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { claimStatuses } from "@/data/app-data";

export const ClaimsModule = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  return (
    <div className="flex flex-col w-full h-full gap-4">
      <div className="flex flex-row items-center justify-end gap-2">
        <div className="flex flex-row items-center justify-center gap-2">
          <Input
            placeholder="search..."
            className="w-[300px]"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue
                placeholder="Filter by status"
                className="text-[10px] font-normal uppercase font-body"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="text-[10px] font-normal uppercase font-body"
              >
                All Statuses
              </SelectItem>
              {claimStatuses?.map((status) => (
                <SelectItem
                  key={status?.value}
                  value={status?.value}
                  className="text-[10px] font-normal uppercase font-body"
                >
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
