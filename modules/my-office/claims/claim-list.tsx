import { memo, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/page-loader";
import { Claim } from "@/lib/types/claims";
import { ClaimCard } from "./claim-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FolderOpen, List, ChevronLeft, ChevronRight } from "lucide-react";
import { claimStatuses } from "@/data/app-data";
import { getDateRangeFromPeriod, PeriodFilterValue } from "@/modules/common/period-filter";
import { Button } from "@/components/ui/button";

interface ClaimListProps {
  claims: Claim[];
  onClaimClick: (claim: Claim) => void;
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

const ClaimListComponent = ({
  claims,
  onClaimClick,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onSearch,
  onStatusFilter,
  searchQuery,
  statusFilter,
}: ClaimListProps) => {
  const [categoryFilter] = useState<string>("all");
  const [userFilter] = useState<string>("all");
  const [periodFilter] = useState<PeriodFilterValue>("all");

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchesStatus =
        statusFilter === "all" || claim.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || claim.category === categoryFilter;
      const matchesUser =
        userFilter === "all" || claim.owner.uid.toString() === userFilter;
      const matchesSearch =
        claim.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.owner.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.amount.toLowerCase().includes(searchQuery.toLowerCase());

      // Add period filtering
      const matchesPeriod = (() => {
        if (periodFilter === "all") return true;
        const { from, to } = getDateRangeFromPeriod(periodFilter);
        const claimDate = new Date(claim.createdAt);
        return claimDate >= from && claimDate <= to;
      })();

      return matchesStatus && matchesCategory && matchesUser && matchesSearch && matchesPeriod;
    });
  }, [claims, statusFilter, categoryFilter, userFilter, searchQuery, periodFilter]);

  const paginatedClaims = useMemo(() => {
    const startIndex = (currentPage - 1) * 25;
    const endIndex = startIndex + 25;
    return filteredClaims.slice(startIndex, endIndex);
  }, [filteredClaims, currentPage]);

  const Header = () => {
    return (
      <div className="flex flex-row items-center justify-end gap-2">
        <div className="flex flex-row items-center justify-center gap-2">
          <Input
            placeholder="search..."
            className="w-[300px] shadow-none bg-card"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={onStatusFilter}>
            <SelectTrigger className="w-[180px] shadow-none bg-card outline-none">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="font-body text-[10px] uppercase"
              >
                <div className="flex flex-row items-center gap-2">
                  <List size={17} strokeWidth={1.5} />
                  <span>All Statuses</span>
                </div>
              </SelectItem>
              {claimStatuses?.map((status) => (
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

  if (filteredClaims.length === 0) {
    return (
      <div className="space-y-4">
        <Header />
        <div className="flex flex-col items-center justify-center w-full gap-2 h-96">
          <FolderOpen
            className="w-8 h-8 text-muted-foreground"
            strokeWidth={1.5}
          />
          <p className="text-xs font-normal uppercase text-muted-foreground font-body">
            No claims found
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
        {paginatedClaims?.map((claim) => (
          <motion.div key={claim.uid} variants={itemVariants} layout>
            <ClaimCard claim={claim} onClick={onClaimClick} />
          </motion.div>
        ))}
      </motion.div>
      {totalPages > 1 && (
        <div className="fixed flex items-center gap-2 px-4 py-2 transform -translate-x-1/2 border rounded-full shadow-lg bottom-4 left-1/2 bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
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
            onClick={() => onPageChange(currentPage + 1)}
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

export const ClaimList = memo(ClaimListComponent);
