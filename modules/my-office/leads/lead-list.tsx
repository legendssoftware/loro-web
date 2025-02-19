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
import { FolderOpen, List, ChevronLeft, ChevronRight } from "lucide-react";
import { PageLoader } from "@/components/page-loader";
import { leadStatuses } from "@/data/app-data";
import { PeriodFilter, PeriodFilterValue, getDateRangeFromPeriod } from "@/modules/common/period-filter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface LeadListProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSearch: (query: string) => void;
  onStatusFilter: (status: string) => void;
  searchQuery: string;
  statusFilter: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

const LeadList = ({
  leads,
  onLeadClick,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onSearch,
  onStatusFilter,
  searchQuery,
  statusFilter,
}: LeadListProps) => {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterValue>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStatus =
        statusFilter === "all" || lead.status === statusFilter;
      const matchesOwner =
        ownerFilter === "all" || lead.owner?.uid.toString() === ownerFilter;
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.owner?.surname?.toLowerCase().includes(searchQuery.toLowerCase());

      // Add period filtering
      const matchesPeriod = (() => {
        if (periodFilter === "all") return true;
        const { from, to } = getDateRangeFromPeriod(periodFilter);
        const leadDate = new Date(lead.createdAt);
        return leadDate >= from && leadDate <= to;
      })();

      return matchesStatus && matchesOwner && matchesSearch && matchesPeriod;
    });
  }, [leads, statusFilter, ownerFilter, searchQuery, periodFilter]);

  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * 20;
    const endIndex = startIndex + 20;
    return filteredLeads.slice(startIndex, endIndex);
  }, [filteredLeads, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  console.log(filteredLeads);

  const Header = () => {
    const uniqueOwners = useMemo(() => {
      const ownersSet = new Set<number>();
      const ownersList: { uid: number; name: string; surname: string; photoURL: string }[] = [];
      
      leads.forEach(lead => {
        if (lead.owner && !ownersSet.has(lead.owner.uid)) {
          ownersSet.add(lead.owner.uid);
          ownersList.push({
            uid: lead.owner.uid,
            name: lead.owner.name,
            surname: lead.owner.surname,
            photoURL: lead.owner.photoURL
          });
        }
      });
      
      return ownersList.sort((a, b) => a.name.localeCompare(b.name));
    }, []);

    return (
      <div className="flex items-center justify-end gap-2">
        <Input
          placeholder="search..."
          className="w-[300px] bg-card"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <PeriodFilter 
            value={periodFilter}
            onValueChange={setPeriodFilter}
          />
          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="w-[180px] shadow-none bg-card outline-none">
              <SelectValue placeholder="Filter by owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="text-[10px] font-normal uppercase font-body"
              >
                <div className="flex flex-row items-center gap-2">
                  <List size={17} strokeWidth={1.5} />
                  <span>All Sales Reps</span>
                </div>
              </SelectItem>
              {uniqueOwners.map((owner) => (
                <SelectItem
                  key={owner.uid}
                  value={owner.uid.toString()}
                  className="text-[10px] font-normal uppercase font-body"
                >
                  <div className="flex flex-row items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={owner.photoURL} />
                      <AvatarFallback>
                        {owner.name?.charAt(0)}
                        {owner.surname?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {`${owner.name} ${owner.surname}`}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={onStatusFilter}>
            <SelectTrigger className="w-[180px] shadow-none bg-card outline-none">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="text-[10px] font-normal uppercase font-body"
              >
                <div className="flex flex-row items-center gap-2">
                  <List size={17} strokeWidth={1.5} />
                  <span>All Statuses</span>
                </div>
              </SelectItem>
              {leadStatuses.map((status) => (
                <SelectItem
                  key={status?.value}
                  value={status?.value}
                  className="text-[10px] font-normal font-body uppercase"
                >
                  <div className="flex items-center gap-2">
                    {status?.icon && (
                      <status.icon size={17} strokeWidth={1.5} />
                    )}
                    <span>{status?.label?.replace("_", " ")}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <PageLoader />
      </div>
    );
  }

  if (!filteredLeads?.length) {
    return (
      <div className="space-y-4">
        <Header />
        <div className="flex flex-col items-center justify-center w-full gap-2 h-96">
          <FolderOpen
            className="w-8 h-8 text-muted-foreground"
            strokeWidth={1.5}
          />
          <p className="text-xs font-normal uppercase text-muted-foreground font-body">
            No leads found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full gap-4">
      <Header />
      <motion.div
        className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {paginatedLeads?.map((lead) => (
          <motion.div key={lead.uid} variants={itemVariants} layout>
            <LeadCard lead={lead} onClick={onLeadClick} />
          </motion.div>
        ))}
      </motion.div>
      {totalPages > 1 && (
        <div className="fixed flex items-center gap-2 px-4 py-2 transform -translate-x-1/2 border rounded-full shadow-lg bottom-4 left-1/2 bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="w-8 h-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs font-normal font-body">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="w-8 h-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default memo(LeadList);
