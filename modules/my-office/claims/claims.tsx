import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClaims, updateClaim, deleteClaim } from '@/helpers/claims';
import { useSessionStore } from '@/store/use-session-store';
import { RequestConfig } from '@/lib/types/tasks';
import { Claim, UpdateClaimDTO } from '@/lib/types/claims';
import toast from 'react-hot-toast';
import { ClaimDetailModal } from './claim-detail-modal';
import { PageLoader } from '@/components/page-loader';
import { ClaimCard } from './claim-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/lib/hooks/use-debounce';

const toastStyle = {
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
} as const;

export const ClaimsModule = () => {
    const { accessToken } = useSessionStore();
    const queryClient = useQueryClient();
    const [isClaimDetailModalOpen, setIsClaimDetailModalOpen] = useState(false);
    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const debouncedSearch = useDebounce(searchQuery, 300);

    const config: RequestConfig = {
        headers: {
            token: accessToken || '',
        },
    };

    const { data: claimsData, isLoading } = useQuery({
        queryKey: ['claims', currentPage, statusFilter, debouncedSearch],
        queryFn: () =>
            fetchClaims({
                ...config,
                page: currentPage,
                limit: 25,
                filters: {
                    ...(statusFilter !== 'ALL' && { status: statusFilter }),
                    ...(debouncedSearch && { search: debouncedSearch }),
                },
            }),
        enabled: !!accessToken,
    });

    const updateClaimMutation = useMutation({
        mutationFn: async ({ ref, data }: { ref: number; data: UpdateClaimDTO }) => {
            const response = await updateClaim({ ref, updatedClaim: data, config });
            if ('message' in response && typeof response.message === 'string' && response.message !== 'success') {
                throw new Error(response.message);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['claims'] });
            toast.success('Claim updated successfully', toastStyle);
            setIsClaimDetailModalOpen(false);
        },
        onError: error => {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update claim';
            toast.error(errorMessage, { ...toastStyle, duration: 5000 });
        },
    });

    const handleDeleteClaim = async (ref: number) => {
        try {
            await deleteClaimMutation.mutateAsync(ref);
        } catch (error) {
            console.error('Failed to delete claim:', error);
        }
    };

    const deleteClaimMutation = useMutation({
        mutationFn: async (ref: number) => {
            const response = await deleteClaim(ref, config);
            if ('message' in response && typeof response.message === 'string' && response.message !== 'success') {
                throw new Error(response.message);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['claims'] });
            toast.success('Claim deleted successfully', toastStyle);
            setIsClaimDetailModalOpen(false);
            setSelectedClaim(null);
        },
        onError: (error) => {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete claim';
            toast.error(errorMessage, { ...toastStyle, duration: 5000 });
        }
    });

    const handleClaimClick = (claim: Claim) => {
        setSelectedClaim(claim);
        setIsClaimDetailModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className='flex items-center justify-center w-full h-screen'>
                <PageLoader />
            </div>
        );
    }

    return (
        <div className='flex flex-col w-full h-full gap-4'>
            <div className='flex items-center justify-end gap-4'>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className='w-[200px] text-[10px] font-normal uppercase font-body'>
                        <SelectValue placeholder='Filter by status' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='ALL' className='text-[10px] font-normal uppercase font-body'>
                            All Statuses
                        </SelectItem>
                        <SelectItem value='PENDING' className='text-[10px] font-normal uppercase font-body'>
                            Pending
                        </SelectItem>
                        <SelectItem value='IN_REVIEW' className='text-[10px] font-normal uppercase font-body'>
                            In Review
                        </SelectItem>
                        <SelectItem value='APPROVED' className='text-[10px] font-normal uppercase font-body'>
                            Approved
                        </SelectItem>
                        <SelectItem value='REJECTED' className='text-[10px] font-normal uppercase font-body'>
                            Rejected
                        </SelectItem>
                        <SelectItem value='VERIFIED' className='text-[10px] font-normal uppercase font-body'>
                            Verified
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className='h-[200px] rounded-lg' />
                    ))}
                </div>
            ) : claimsData && claimsData.data.length > 0 ? (
                <div className='grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-4'>
                    {claimsData.data.map(claim => (
                        <ClaimCard key={claim.uid} claim={claim} onClick={() => handleClaimClick(claim)} />
                    ))}
                </div>
            ) : (
                <div className='flex flex-col items-center justify-center gap-4 p-8'>
                    <p className='text-sm font-normal text-center text-muted-foreground font-body'>No claims found</p>
                </div>
            )}
            <ClaimDetailModal
                isOpen={isClaimDetailModalOpen}
                onOpenChange={setIsClaimDetailModalOpen}
                selectedClaim={selectedClaim}
                onDelete={handleDeleteClaim}
                onUpdate={(ref, data) => updateClaimMutation.mutateAsync({ ref, data })}
                isUpdating={updateClaimMutation.isPending}
                isDeleting={deleteClaimMutation.isPending}
            />
        </div>
    );
};
