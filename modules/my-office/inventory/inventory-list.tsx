import { memo, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { InventoryCard } from "./inventory-card";
import { Product } from "@/lib/types/products";
import { PageLoader } from "@/components/page-loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewInventoryModal } from "./new-inventory-modal";
import { CreateProductDTO } from "@/lib/types/products";
import { useSessionStore } from "@/store/use-session-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "@/helpers/products";
import { RequestConfig } from "@/lib/types/products";
import { showToast } from "@/lib/utils/toast";
import { productStatuses } from "@/data/app-data";
import { List, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { PeriodFilter, PeriodFilterValue, getDateRangeFromPeriod } from "@/modules/common/period-filter";
import { Button } from "@/components/ui/button";

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

interface InventoryListProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  isLoading: boolean;
}

const InventoryListComponent = ({
  products,
  onProductClick,
  isLoading,
}: InventoryListProps) => {
  const { accessToken } = useSessionStore();
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  const queryClient = useQueryClient();

  const config: RequestConfig = {
    headers: {
      token: `${accessToken}`,
    },
  };

  const createProductMutation = useMutation({
    mutationFn: (data: CreateProductDTO) => createProduct(data, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showToast.success("Product created successfully");
      setIsNewProductModalOpen(false);
    },
    onError: (error) => {
      showToast.error("Failed to create product", error);
    },
  });

  const handleCreateProduct = useCallback(
    async (data: CreateProductDTO) => {
      try {
        await createProductMutation.mutateAsync(data);
      } catch (error) {
        console.error("Failed to create product:", error);
      }
    },
    [createProductMutation]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesStatus =
        statusFilter === "all" || product.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPeriod = (() => {
        if (periodFilter === "all") return true;
        const { from, to } = getDateRangeFromPeriod(periodFilter);
        const productDate = new Date(product.createdAt);
        return productDate >= from && productDate <= to;
      })();

      return matchesStatus && matchesCategory && matchesSearch && matchesPeriod;
    });
  }, [products, statusFilter, categoryFilter, searchQuery, periodFilter]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-[600px]">
        <PageLoader />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col w-full gap-4"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-end gap-2">
          <Input
            placeholder="search..."
            className="w-[300px] bg-card font-body text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <PeriodFilter 
              value={periodFilter}
              onValueChange={setPeriodFilter}
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px] shadow-none bg-card outline-none font-body text-xs">
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
                {Array.from(new Set(products.map(p => p.category))).sort().map((category) => (
                  <SelectItem
                    key={category}
                    value={category}
                    className="text-[10px] font-normal uppercase font-body"
                  >
                    <div className="flex flex-row items-center gap-2">
                      <Package size={17} strokeWidth={1.5} />
                      <span>{category}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] shadow-none bg-card outline-none font-body text-xs">
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
                {productStatuses.map((status) => (
                  <SelectItem
                    key={status.value}
                    value={status.value}
                    className="text-[10px] font-normal uppercase font-body"
                  >
                    <div className="flex flex-row items-center gap-2">
                      <Package size={17} strokeWidth={1.5} />
                      <span>{status.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => setIsNewProductModalOpen(true)}
              className="bg-primary text-white hover:bg-primary/90 text-[10px] font-normal uppercase font-body"
            >
              Add Product
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedProducts.map((product) => (
          <InventoryCard
            key={product.uid}
            product={product}
            onClick={() => onProductClick(product)}
          />
        ))}
      </div>
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
      <NewInventoryModal
        isOpen={isNewProductModalOpen}
        onOpenChange={setIsNewProductModalOpen}
        onSubmit={handleCreateProduct}
        isCreating={createProductMutation.isPending}
      />
    </motion.div>
  );
};

export const InventoryList = memo(InventoryListComponent); 