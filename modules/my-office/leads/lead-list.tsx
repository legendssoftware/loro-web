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
import { FolderOpen, List } from "lucide-react";
import { PageLoader } from "@/components/page-loader";
import { leadStatuses } from "@/data/app-data";
import { PeriodFilter, PeriodFilterValue, getDateRangeFromPeriod } from "@/modules/common/period-filter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
    },
  },
};

const LeadList = ({ leads, onLeadClick, isLoading }: LeadListProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterValue>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

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
          onChange={(e) => setSearchQuery(e.target.value)}
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
    <div className="flex flex-col gap-4">
      <Header />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-4"
      >
        {filteredLeads.map((lead) => (
          <LeadCard
            key={lead.uid}
            lead={lead}
            onClick={() => onLeadClick(lead)}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default memo(LeadList);
