import { memo, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/page-loader";
import { Quotation } from "@/lib/types/quotations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  FolderOpen,
  List,
  TrendingUp,
  TrendingDown,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { quotationStatuses } from "@/data/app-data";
import {
  PeriodFilter,
  PeriodFilterValue,
  getDateRangeFromPeriod,
} from "@/modules/common/period-filter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface QuotationListProps {
  quotations: Quotation[];
  onQuotationClick: (quotation: Quotation) => void;
  isLoading: boolean;
}

const QuotationListComponent = ({
  quotations,
  onQuotationClick,
  isLoading,
}: QuotationListProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterValue>("all");
  const [valueSort, setValueSort] = useState<"none" | "asc" | "desc">("none");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuotations, setSelectedQuotations] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const quotationsPerPage = 15;

  const filteredQuotations = useMemo(() => {
    const filtered = quotations.filter((quotation) => {
      const matchesStatus =
        statusFilter === "all" || quotation.status === statusFilter;
      const matchesClient =
        clientFilter === "all" ||
        quotation.client.uid.toString() === clientFilter;
      const matchesUser =
        userFilter === "all" ||
        quotation.placedBy.uid.toString() === userFilter;
      const matchesCategory =
        categoryFilter === "all" ||
        quotation.quotationItems.some(item => item.product.sku === categoryFilter);
      const matchesSearch = quotation.quotationNumber
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesPeriod = (() => {
        if (periodFilter === "all") return true;
        const { from, to } = getDateRangeFromPeriod(periodFilter);
        const quotationDate = new Date(quotation.createdAt);
        return quotationDate >= from && quotationDate <= to;
      })();

      return (
        matchesStatus &&
        matchesClient &&
        matchesUser &&
        matchesCategory &&
        matchesSearch &&
        matchesPeriod
      );
    });

    // Apply value sorting if selected
    if (valueSort !== "none") {
      filtered.sort((a, b) => {
        const aValue = Number(a.totalAmount || 0);
        const bValue = Number(b.totalAmount || 0);
        return valueSort === "asc" ? aValue - bValue : bValue - aValue;
      });
    }

    return filtered;
  }, [
    quotations,
    statusFilter,
    clientFilter,
    userFilter,
    searchQuery,
    periodFilter,
    valueSort,
    categoryFilter,
  ]);

  const paginatedQuotations = useMemo(() => {
    const startIndex = (currentPage - 1) * quotationsPerPage;
    const endIndex = startIndex + quotationsPerPage;
    return filteredQuotations.slice(startIndex, endIndex);
  }, [filteredQuotations, currentPage]);

  const totalPages = Math.ceil(filteredQuotations.length / quotationsPerPage);

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
    // Get unique SKUs from all quotation items
    const uniqueSkus = useMemo(() => {
      const skus = new Set<string>();
      quotations.forEach(quotation => {
        quotation.quotationItems.forEach(item => {
          if (item.product.sku) {
            skus.add(item.product.sku);
          }
        });
      });
      return Array.from(skus);
    }, [quotations]);

    return (
      <div className="flex items-center justify-end gap-2">
        <Input
          placeholder="search..."
          className="w-[300px] bg-card"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <PeriodFilter value={periodFilter} onValueChange={setPeriodFilter} />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] shadow-none bg-card outline-none">
              <SelectValue placeholder="Filter by SKU" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="text-[10px] font-normal uppercase font-body"
              >
                <div className="flex flex-row items-center gap-2">
                  <List size={17} strokeWidth={1.5} />
                  <span className="text-[10px] font-normal uppercase font-body">
                    All SKUs
                  </span>
                </div>
              </SelectItem>
              {uniqueSkus.map((sku) => (
                <SelectItem
                  key={sku}
                  value={sku}
                  className="text-[10px] font-normal uppercase font-body"
                >
                  <div className="flex flex-row items-center gap-2">
                    <FolderOpen size={17} strokeWidth={1.5} />
                    <span className="text-[10px] font-normal uppercase font-body">
                      {sku}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={valueSort}
            onValueChange={(value: "none" | "asc" | "desc") =>
              setValueSort(value)
            }
          >
            <SelectTrigger className="w-[180px] shadow-none bg-card outline-none">
              <SelectValue placeholder="Sort by value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="none"
                className="text-[10px] font-normal uppercase font-body"
              >
                <div className="flex flex-row items-center gap-2">
                  <List size={17} strokeWidth={1.5} />
                  <span className="text-[10px] font-normal uppercase font-body">
                    Default Order
                  </span>
                </div>
              </SelectItem>
              <SelectItem
                value="asc"
                className="text-[10px] font-normal uppercase font-body"
              >
                <div className="flex flex-row items-center gap-2">
                  <TrendingUp size={17} strokeWidth={1.5} />
                  <span className="text-[10px] font-normal uppercase font-body">
                    Lowest to Highest
                  </span>
                </div>
              </SelectItem>
              <SelectItem
                value="desc"
                className="text-[10px] font-normal uppercase font-body"
              >
                <div className="flex flex-row items-center gap-2">
                  <TrendingDown size={17} strokeWidth={1.5} />
                  <span className="text-[10px] font-normal uppercase font-body">
                    Highest to Lowest
                  </span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-[180px] shadow-none bg-card outline-none">
              <SelectValue placeholder="Filter by client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="text-[10px] font-normal uppercase font-body"
              >
                <div className="flex flex-row items-center gap-2">
                  <List size={17} strokeWidth={1.5} />
                  <span className="text-[10px] font-normal uppercase font-body">
                    All Clients
                  </span>
                </div>
              </SelectItem>
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
                    <div className="flex flex-row items-center gap-2">
                      <Building2 size={17} strokeWidth={1.5} />
                      {quotation.client.name}
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-[180px] shadow-none bg-card outline-none">
              <SelectValue
                placeholder="Filter by user"
                className="text-[10px] font-normal uppercase font-body"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="text-[10px] font-normal uppercase font-body"
              >
                <div className="flex flex-row items-center gap-2">
                  <List size={17} strokeWidth={1.5} />
                  <span className="text-[10px] font-normal uppercase font-body">
                    All Sales Reps
                  </span>
                </div>
              </SelectItem>
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
                    <div className="flex flex-row items-center gap-2">
                      <Avatar
                        className={`${
                          quotation.placedBy.uid === Number(userFilter)
                            ? "h-5 w-5"
                            : "h-8 w-8"
                        }`}
                      >
                        <AvatarImage src={quotation.placedBy?.photoURL} />
                        <AvatarFallback>
                          {quotation.placedBy?.name?.charAt(0)}
                          {quotation.placedBy?.surname?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {`${quotation.placedBy.name} ${quotation.placedBy.surname}`}
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
                  <span className="text-[10px] font-normal uppercase font-body">
                    All Statuses
                  </span>
                </div>
              </SelectItem>
              {quotationStatuses?.map((status) => (
                <SelectItem
                  key={status?.value}
                  value={status?.value}
                  className="text-[10px] font-normal font-body uppercase"
                >
                  <div className="flex items-center gap-2">
                    {status?.icon && (
                      <status.icon size={17} strokeWidth={1.5} />
                    )}
                    <span className="text-[10px] font-normal uppercase font-body">
                      {status?.label?.replace("_", " ")}
                    </span>
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

  if (!filteredQuotations?.length) {
    return (
      <div className="space-y-4">
        <Header />
        <div className="flex flex-col items-center justify-center w-full gap-2 h-96">
          <FolderOpen
            className="w-8 h-8 text-muted-foreground"
            strokeWidth={1.5}
          />
          <p className="text-[10px] font-normal uppercase text-muted-foreground font-body">
            No quotations found
          </p>
        </div>
      </div>
    );
  }

  const toggleQuotation = (quotationId: number) => {
    setSelectedQuotations((prev) =>
      prev.includes(quotationId)
        ? prev.filter((id) => id !== quotationId)
        : [...prev, quotationId]
    );
  };

  const toggleAllQuotations = () => {
    setSelectedQuotations((prev) =>
      prev.length === filteredQuotations.length
        ? []
        : filteredQuotations.map((q) => q.uid)
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Header />
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30px] text-[10px] font-normal uppercase font-body">
                <Checkbox
                  checked={
                    selectedQuotations.length === filteredQuotations.length
                  }
                  onCheckedChange={toggleAllQuotations}
                />
              </TableHead>
              <TableHead className="text-[10px] font-normal uppercase font-body">
                Order
              </TableHead>
              <TableHead className="text-[10px] font-normal uppercase font-body">
                Date
              </TableHead>
              <TableHead className="text-[10px] font-normal uppercase font-body">
                Customer
              </TableHead>
              <TableHead className="text-[10px] font-normal uppercase font-body">
                Payment
              </TableHead>
              <TableHead className="text-[10px] font-normal uppercase font-body">
                Total
              </TableHead>
              <TableHead className="text-[10px] font-normal uppercase font-body">
                Delivery
              </TableHead>
              <TableHead className="text-[10px] font-normal uppercase font-body">
                Items
              </TableHead>
              <TableHead className="text-[10px] font-normal uppercase font-body">
                Fulfillment
              </TableHead>
              <TableHead className="text-[10px] font-normal uppercase font-body text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedQuotations.map((quotation) => (
              <TableRow
                key={quotation.uid}
                className="cursor-pointer hover:bg-muted"
              >
                <TableCell className="text-[10px] font-normal uppercase font-body">
                  <Checkbox
                    checked={selectedQuotations.includes(quotation.uid)}
                    onCheckedChange={() => toggleQuotation(quotation.uid)}
                  />
                </TableCell>
                <TableCell className="text-[10px] font-normal uppercase font-body">
                  #{quotation.quotationNumber}
                </TableCell>
                <TableCell className="text-[10px] font-normal uppercase font-body">
                  {format(new Date(quotation.createdAt), "dd MMM, yyyy")}
                </TableCell>
                <TableCell className="text-[10px] font-normal uppercase font-body">
                  {quotation.client.name}
                </TableCell>
                <TableCell className="text-[10px] font-normal uppercase font-body">
                  <Badge
                    variant={
                      quotation.status === "Pending" ? "secondary" : "default"
                    }
                    className="font-normal text-[8px] font-body uppercase text-white"
                  >
                    {quotation.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-[10px] font-normal uppercase font-body">
                  R{Number(quotation.totalAmount).toFixed(2)}
                </TableCell>
                <TableCell className="text-[10px] font-normal uppercase font-body">
                  N/A
                </TableCell>
                <TableCell className="text-[10px] font-normal uppercase font-body">
                  {quotation.totalItems} items
                </TableCell>
                <TableCell className="text-[10px] font-normal uppercase font-body">
                  <Badge
                    variant={
                      quotation.status === "Pending" ? "destructive" : "default"
                    }
                    className="font-normal text-[8px] font-body uppercase text-white"
                  >
                    {quotation.status === "Pending"
                      ? "Unfulfilled"
                      : "Fulfilled"}
                  </Badge>
                </TableCell>
                <TableCell className="text-[10px] font-normal uppercase font-body">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onQuotationClick(quotation)}
                      className="p-2 rounded-md hover:bg-muted text-[10px] font-normal uppercase font-body"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filteredQuotations.length > quotationsPerPage && (
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

export const QuotationList = memo(QuotationListComponent);
