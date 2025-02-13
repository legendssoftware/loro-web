import { memo, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/page-loader";
import { Claim, ClaimCategory } from "@/lib/types/claims";
import { ClaimCard } from "./claim-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FolderOpen, List, LucideIcon } from "lucide-react";
import { claimStatuses } from "@/data/app-data";

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
  const [searchQuery, setSearchQuery] = useState("");

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
        claim.owner.surname.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesCategory && matchesUser && matchesSearch;
    });
  }, [claims, statusFilter, categoryFilter, userFilter, searchQuery]);

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
                  <span>All Users</span>
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
              {Object.values(ClaimCategory).map((category) => (
                <SelectItem
                  key={category}
                  value={category}
                  className="text-[10px] font-normal uppercase font-body"
                >
                  {category}
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
    <div className="flex flex-col gap-4">
      <Header />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-4"
      >
        {filteredClaims.map((claim) => (
          <ClaimCard
            key={claim.uid}
            claim={claim}
            onClick={() => onClaimClick(claim)}
          />
        ))}
      </motion.div>
    </div>
  );
};

export const ClaimList = memo(ClaimListComponent);
