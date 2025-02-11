import { memo, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/page-loader";
import { OrderStatus, Quotation } from "@/lib/types/quotations";
import { QuotationCard } from "./quotation-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuotationListProps {
  quotations: Quotation[];
  onQuotationClick: (quotation: Quotation) => void;
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

const QuotationListComponent = ({
  quotations,
  onQuotationClick,
  isLoading,
}: QuotationListProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredQuotations = useMemo(() => {
    return quotations.filter((quotation) => {
      const matchesStatus =
        statusFilter === "all" || quotation.status === statusFilter;
      const matchesClient =
        clientFilter === "all" ||
        quotation.client.uid.toString() === clientFilter;
      const matchesUser =
        userFilter === "all" ||
        quotation.placedBy.uid.toString() === userFilter;
      const matchesSearch = quotation.quotationNumber
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesStatus && matchesClient && matchesUser && matchesSearch;
    });
  }, [quotations, statusFilter, clientFilter, userFilter, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        <Input
          placeholder="search..."
          className="w-[300px] bg-card"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-[180px] shadow-none bg-card outline-none">
              <SelectValue placeholder="Filter by client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {quotations
                .filter(
                  (quotation, index, self) =>
                    index ===
                    self.findIndex((q) => q.client.uid === quotation.client.uid)
                )
                .map((quotation) => (
                  <SelectItem
                    key={quotation.client.uid}
                    value={quotation.client.uid.toString()}
                    className="text-[10px] font-normal uppercase font-body"
                  >
                    {quotation.client.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-[180px] shadow-none bg-card outline-none">
              <SelectValue placeholder="Filter by user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[10px] font-normal uppercase font-body">All Users</SelectItem>
              {quotations
                .filter(
                  (quotation, index, self) =>
                    index ===
                    self.findIndex(
                      (q) => q.placedBy.uid === quotation.placedBy.uid
                    )
                )
                .map((quotation) => (
                  <SelectItem
                    key={quotation.placedBy.uid}
                    value={quotation.placedBy.uid.toString()}
                    className="text-[10px] font-normal uppercase font-body"
                  >
                    {`${quotation.placedBy.name} ${quotation.placedBy.surname}`}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] shadow-none bg-card outline-none">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[10px] font-normal uppercase font-body">All Status</SelectItem>
              {Object.values(OrderStatus).map((status) => (
                <SelectItem
                  key={status}
                  value={status}
                  className="text-[10px] font-normal uppercase font-body"
                >
                  {status}
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
        className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-4"
      >
        {filteredQuotations.map((quotation) => (
          <QuotationCard
            key={quotation.uid}
            quotation={quotation}
            onClick={() => onQuotationClick(quotation)}
          />
        ))}
      </motion.div>
    </div>
  );
};

export const QuotationList = memo(QuotationListComponent);
