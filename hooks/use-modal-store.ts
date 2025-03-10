import { create } from 'zustand';
import { Claim } from '@/lib/types/claim';
import { Task } from '@/lib/types/task';
import { Quotation } from '@/lib/types/quotation';

// Define interfaces for each specific modal store
interface ClaimDetailsModalStore {
    isOpen: boolean;
    data: Claim | null;
    onOpen: (data: Claim) => void;
    onClose: () => void;
}

interface TaskDetailsModalStore {
    isOpen: boolean;
    data: Task | null;
    onOpen: (data: Task) => void;
    onClose: () => void;
}

interface QuotationDetailsModalStore {
    isOpen: boolean;
    data: Quotation | null;
    onOpen: (data: Quotation) => void;
    onClose: () => void;
}

// Create the Zustand stores
export const useClaimDetailsModal = create<ClaimDetailsModalStore>((set) => ({
    isOpen: false,
    data: null,
    onOpen: (data: Claim) => set({ isOpen: true, data }),
    onClose: () => set({ isOpen: false }),
}));

export const useTaskDetailsModal = create<TaskDetailsModalStore>((set) => ({
    isOpen: false,
    data: null,
    onOpen: (data: Task) => set({ isOpen: true, data }),
    onClose: () => set({ isOpen: false }),
}));

export const useQuotationDetailsModal = create<QuotationDetailsModalStore>((set) => ({
    isOpen: false,
    data: null,
    onOpen: (data: Quotation) => set({ isOpen: true, data }),
    onClose: () => set({ isOpen: false }),
}));
