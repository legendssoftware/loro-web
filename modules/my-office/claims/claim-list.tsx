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
import { FolderOpen, List, LucideIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { claimCategories, claimStatuses } from "@/data/app-data";
import { PeriodFilter, PeriodFilterValue, getDateRangeFromPeriod } from "@/modules/common/period-filter";
import { Button } from "@/components/ui/button";

interface ClaimListProps {
  claims: Claim[];
  onClaimClick: (claim: Claim) => void;
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

const ClaimListComponent = ({
  claims,
  onClaimClick,
  isLoading,
}: ClaimListProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const claimsPerPage = 20;

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
    const startIndex = (currentPage - 1) * claimsPerPage;
    const endIndex = startIndex + claimsPerPage;
    return filteredClaims.slice(startIndex, endIndex);
  }, [filteredClaims, currentPage]);

  const totalPages = Math.ceil(filteredClaims.length / claimsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const Header = () => {
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
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-[180px] shadow-none bg-card outline-none">
              <SelectValue placeholder="Filter by user" />
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
              {claims
                .filter(
                  (claim, index, self) =>
                    index ===
                    self.findIndex((c) => c.owner.uid === claim.owner.uid)
                )
                .map((claim) => (
                  <SelectItem
                    key={claim.owner.uid}
                    value={claim.owner.uid.toString()}
                    className="text-[10px] font-normal uppercase font-body"
                  >
                    {`${claim.owner.name} ${claim.owner.surname}`}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] shadow-none bg-card outline-none">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="text-[10px] font-normal uppercase font-body"
              >
                <div className="flex flex-row items-center gap-2">
                  <List size={17} strokeWidth={1.5} />
                  <span>All Categories</span>
                </div>
              </SelectItem>
              {claimCategories?.map( 
                (category: {
                  value: string;
                  label: string;
                  icon: LucideIcon;
                }) => (
                  <SelectItem
                    key={category?.value}
                    value={category?.value}
                    className="text-[10px] font-normal font-body uppercase"
                  >
                    <div className="flex items-center gap-2">
                      {category?.icon && (
                        <category.icon size={17} strokeWidth={1.5} />
                      )}
                      <span>{category?.label?.replace("_", " ")}</span>
                    </div>
                  </SelectItem>
                )
              )}
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
              {claimStatuses?.map(
                (status: {
                  value: string;
                  label: string;
                  icon: LucideIcon;
                }) => (
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
                )
              )}
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
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-4"
      >
        {paginatedClaims?.map((claim) => (
          <ClaimCard key={claim.uid} claim={claim} onClick={onClaimClick} />
        ))}
      </motion.div>
      {filteredClaims.length > claimsPerPage && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-lg border">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs font-normal font-body">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export const ClaimList = memo(ClaimListComponent);
