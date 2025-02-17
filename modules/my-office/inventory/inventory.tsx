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

    const config: RequestConfig = {
        headers: {
            token: `${accessToken}`,
        },
    }

    const { data: productsData, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: () => fetchProducts(config),
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
            })
        }
    })

    const deleteProductMutation = useMutation({
        mutationFn: (ref: number) => deleteProduct(ref, config),
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
            toast.error('Failed to delete product', {
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
    }, [deleteProductMutation])

    return (
        <div className="flex flex-col w-full h-full gap-4">
            <InventoryList
                products={productsData?.data || []}
                onProductClick={handleProductClick}
                isLoading={isLoading}
            />

            <InventoryDetailModal
                isOpen={isProductDetailModalOpen}
                onOpenChange={setIsProductDetailModalOpen}
                selectedProduct={selectedProduct}
                onDelete={handleDeleteProduct}
                isUpdating={updateProductMutation.isPending}
                isDeleting={deleteProductMutation.isPending}
            />
        </div>
    )
}
