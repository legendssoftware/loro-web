import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSessionStore } from "@/store/use-session-store"
import toast from 'react-hot-toast'
import { Product, RequestConfig, UpdateProductDTO } from "@/lib/types/products"
import { deleteProduct, fetchProducts, updateProduct } from "@/helpers/products"
import { InventoryDetailModal } from "./inventory-detail-modal"
import { InventoryList } from "./inventory-list"

export const InventoryModule = () => {
    const { accessToken } = useSessionStore()
    const queryClient = useQueryClient()
    const [isProductDetailModalOpen, setIsProductDetailModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const limit = 20

    const config: RequestConfig = {
        headers: {
            token: `${accessToken}`,
        },
    }

    const { data: productsData, isLoading } = useQuery({
        queryKey: ['products', currentPage],
        queryFn: () => fetchProducts(config, currentPage, limit),
        enabled: !!accessToken,
    })

    const updateProductMutation = useMutation({
        mutationFn: ({ ref, updatedProduct }: { ref: number; updatedProduct: UpdateProductDTO }) =>
            updateProduct({ ref, updatedProduct, config }), 
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            toast.success('Product updated successfully', {
                style: {
                    borderRadius: '5px',
                    background: '#333',
                    color: '#fff',
                    fontFamily: 'var(--font-unbounded)',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    fontWeight: '300',
                    padding: '16px',
                },
                duration: 2000,
                position: 'bottom-center',
                icon: '✅',
            })
            setIsProductDetailModalOpen(false)
        },
        onError: (error: Error) => {
            console.error('Update error:', error)
            toast.error('Failed to update product: ' + error.message, {
                style: {
                    borderRadius: '5px',
                    background: '#333',
                    color: '#fff',
                    fontFamily: 'var(--font-unbounded)',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    fontWeight: '300',
                    padding: '16px',
                },
                duration: 5000,
            })
        }
    })

    const deleteProductMutation = useMutation({
        mutationFn: (uid: number) => deleteProduct(uid, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            toast.success('Product deleted successfully', {
                style: {
                    borderRadius: '5px',
                    background: '#333',
                    color: '#fff',
                    fontFamily: 'var(--font-unbounded)',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    fontWeight: '300',
                    padding: '16px',
                },
                duration: 2000,
                position: 'bottom-center',
                icon: '✅',
            })
            setIsProductDetailModalOpen(false)
        },
        onError: (error: Error) => {
            console.error('Delete error:', error)
            toast.error('Failed to delete product: ' + error.message, {
                style: {
                    borderRadius: '5px',
                    background: '#333',
                    color: '#fff',
                    fontFamily: 'var(--font-unbounded)',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    fontWeight: '300',
                    padding: '16px',
                },
                duration: 5000,
                position: 'bottom-center',
                icon: '❌',
            })
        }
    })

    const handleProductClick = useCallback((product: Product) => {
        setSelectedProduct(product)
        setIsProductDetailModalOpen(true)
    }, [])

    const handleDeleteProduct = useCallback(async (uid: number) => {
        try {
            await deleteProductMutation.mutateAsync(uid)
        } catch (error) {
            console.error('Failed to delete product:', error)
        }
    }, [deleteProductMutation])

    const handleUpdateProduct = useCallback(async (ref: number, updatedProduct: UpdateProductDTO) => {
        try {
            await updateProductMutation.mutateAsync({ ref, updatedProduct })
        } catch (error) {
            console.error('Failed to update product:', error)
        }
    }, [updateProductMutation])

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    console.log(productsData, 'productsData')
    
    return (
        <div className="flex flex-col w-full h-full gap-4">
            <InventoryList
                products={{
                    data: productsData?.data || [],
                    meta: {
                        total: productsData?.meta?.total || 0,
                        page: currentPage,
                        lastPage: productsData?.meta?.totalPages || 1
                    }
                }}
                onProductClick={handleProductClick}
                isLoading={isLoading}
                onPageChange={handlePageChange}
                currentPage={currentPage}
                onDelete={handleDeleteProduct}
                onUpdate={handleUpdateProduct}
                isUpdating={updateProductMutation.isPending}
                isDeleting={deleteProductMutation.isPending}
            />

            <InventoryDetailModal
                isOpen={isProductDetailModalOpen}
                onOpenChange={setIsProductDetailModalOpen}
                selectedProduct={selectedProduct}
                onDelete={handleDeleteProduct}
                onUpdate={handleUpdateProduct}
                isUpdating={updateProductMutation.isPending}
                isDeleting={deleteProductMutation.isPending}
            />
        </div>
    )
}
