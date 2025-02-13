import { memo, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lead } from "@/lib/types/leads";
import LeadCard from "./lead-card";
import { FolderOpen, Loader2 } from "lucide-react";
import { LEAD_STATUSES } from "@/lib/enums/leads";

interface LeadListProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  isLoading: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const LeadList = ({ leads, onLeadClick, isLoading }: LeadListProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLeads = useMemo(() => {
    return (
      leads?.filter((lead) => {
        const matchesStatus =
          statusFilter === "all" || lead?.status === statusFilter;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          searchQuery === "" ||
          lead?.name?.toLowerCase().includes(searchLower) ||
          lead?.email?.toLowerCase().includes(searchLower) ||
          lead?.phone?.toLowerCase().includes(searchLower) ||
          lead?.notes?.toLowerCase().includes(searchLower) ||
          lead?.owner?.name?.toLowerCase().includes(searchLower) ||
          lead?.owner?.surname?.toLowerCase().includes(searchLower) ||
          lead?.branch?.name?.toLowerCase().includes(searchLower);

        return matchesStatus && matchesSearch;
      }) || []
    );
  }, [leads, statusFilter, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!filteredLeads?.length) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[400px] gap-2">
        <FolderOpen className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
        <p className="text-xs font-normal uppercase text-muted-foreground font-body">
          No leads found
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-4">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[300px] shadow-none bg-card"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-9 shadow-none bg-card outline-none">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="text-[10px] font-normal uppercase font-body"
              >
                All Statuses
              </SelectItem>
              {LEAD_STATUSES.map((status) => (
                <SelectItem
                  key={status.value}
                  value={status.value}
                  className="text-[10px] font-normal uppercase font-body"
                >
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4"
      >
        {filteredLeads.map((lead) => (
          <LeadCard key={lead?.uid} lead={lead} onClick={onLeadClick} />
        ))}
      </motion.div>
    </div>
  );
};

export default memo(LeadList);
