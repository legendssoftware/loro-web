import { memo, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/page-loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSessionStore } from "@/store/use-session-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showToast } from "@/lib/utils/toast";
import { productCategories, productStatuses } from "@/data/app-data";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  PeriodFilterValue,
  getDateRangeFromPeriod,
} from "@/modules/common/period-filter";
import { Button } from "@/components/ui/button";
import {
  CreateProductDTO,
  Product,
  RequestConfig,
  UpdateProductDTO,
  ProductStatus,
} from "@/lib/types/products";
import { createProduct } from "@/helpers/products";
import { InventoryCard } from "./inventory-card";
import { InventoryDetailModal } from "./inventory-detail-modal";
import { NewInventoryModal } from "./new-inventory-modal";

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
  products: {
    data: Product[];
    meta: {
      total: number;
      page: number;
      lastPage: number;
    };
  };
  onProductClick: (product: Product) => void;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  currentPage: number;
  onDelete: (uid: number) => void;
  onUpdate: (ref: number, data: UpdateProductDTO) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

const InventoryListComponent = ({
  products,
  isLoading,
  onPageChange,
  currentPage,
  onDelete,
  onUpdate,
  isUpdating,
  isDeleting,
}: InventoryListProps) => {
  const { accessToken } = useSessionStore();
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [periodFilter] = useState<PeriodFilterValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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
    return products.data.filter((product) => {
      const matchesStatus =
        statusFilter === "all" || product.status?.toUpperCase() === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;
      const matchesSearch =
        product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product?.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPeriod = (() => {
        if (periodFilter === "all") return true;
        const { from, to } = getDateRangeFromPeriod(periodFilter);
        const productDate = new Date(product.createdAt);
        return productDate >= from && productDate <= to;
      })();

      return matchesStatus && matchesCategory && matchesSearch && matchesPeriod;
    });
  }, [products.data, statusFilter, categoryFilter, searchQuery, periodFilter]);

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="text-[10px] font-normal uppercase font-body"
              >
                All Statuses
              </SelectItem>
              {productStatuses.map((status) => (
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
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="text-[10px] font-normal uppercase font-body"
              >
                All Categories
              </SelectItem>
              {productCategories.map((category) => (
                <SelectItem
                  key={category.value}
                  value={category.value}
                  className="text-[10px] font-normal uppercase font-body"
                >
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => setIsNewProductModalOpen(true)}
            className="text-xs font-normal text-white uppercase font-body bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <InventoryCard
            key={product.uid}
            product={product}
            onClick={() => {
              setSelectedProduct(product);
              setIsDetailModalOpen(true);
            }}
          />
        ))}
      </div>
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
          {currentPage} / {products.meta.lastPage}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === products.meta.lastPage}
          className="w-8 h-8"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <InventoryDetailModal
        isOpen={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        selectedProduct={selectedProduct}
        onDelete={onDelete}
        onUpdate={onUpdate}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
      />
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
