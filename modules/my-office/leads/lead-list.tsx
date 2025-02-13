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
import { Loader2 } from "lucide-react";
import { Lead, LeadStatus } from "@/lib/types/leads";
import LeadCard from "./lead-card";

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
      delayChildren: 0.3,
    },
  },
};

const LEAD_STATUSES = [
  { value: LeadStatus.APPROVED, label: "Approved" },
  { value: LeadStatus.REVIEW, label: "Under Review" },
  { value: LeadStatus.DECLINED, label: "Declined" },
  { value: LeadStatus.PENDING, label: "Pending" },
];

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
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-4">
        <Input
          type="text"
          placeholder="search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm bg-card"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] shadow-none bg-card outline-none">
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

      {!filteredLeads?.length ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-xs font-normal uppercase text-muted-foreground font-body">
            No leads found
          </p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-4"
        >
          {filteredLeads.map((lead) => (
            <LeadCard key={lead?.uid} lead={lead} onClick={onLeadClick} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default memo(LeadList);
