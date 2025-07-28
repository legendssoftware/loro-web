import { OrderStatus } from '@/lib/enums/status.enums';
import { User } from './user';
import { Product } from './product';
import { Client } from './client';
import { ProjectSummary } from './project';

export interface StatusColorConfig {
    bg: string;
    text: string;
    border: string;
}

export const StatusColors: Record<string, StatusColorConfig> = {
    [OrderStatus.DRAFT]: {
        bg: 'bg-gray-100 dark:bg-gray-950/50',
        text: 'text-gray-800 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-800',
    },
    [OrderStatus.PENDING_INTERNAL]: {
        bg: 'bg-amber-100 dark:bg-amber-950/50',
        text: 'text-amber-800 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800',
    },
    [OrderStatus.PENDING_CLIENT]: {
        bg: 'bg-yellow-100 dark:bg-yellow-950/50',
        text: 'text-yellow-800 dark:text-yellow-300',
        border: 'border-yellow-200 dark:border-yellow-800',
    },
    [OrderStatus.NEGOTIATION]: {
        bg: 'bg-indigo-100 dark:bg-indigo-950/50',
        text: 'text-indigo-800 dark:text-indigo-300',
        border: 'border-indigo-200 dark:border-indigo-800',
    },
    [OrderStatus.SOURCING]: {
        bg: 'bg-cyan-100 dark:bg-cyan-950/50',
        text: 'text-cyan-800 dark:text-cyan-300',
        border: 'border-cyan-200 dark:border-cyan-800',
    },
    [OrderStatus.PACKING]: {
        bg: 'bg-sky-100 dark:bg-sky-950/50',
        text: 'text-sky-800 dark:text-sky-300',
        border: 'border-sky-200 dark:border-sky-800',
    },
    [OrderStatus.IN_FULFILLMENT]: {
        bg: 'bg-violet-100 dark:bg-violet-950/50',
        text: 'text-violet-800 dark:text-violet-300',
        border: 'border-violet-200 dark:border-violet-800',
    },
    [OrderStatus.PAID]: {
        bg: 'bg-emerald-100 dark:bg-emerald-950/50',
        text: 'text-emerald-800 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800',
    },
    [OrderStatus.RETURNED]: {
        bg: 'bg-rose-100 dark:bg-rose-950/50',
        text: 'text-rose-800 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-800',
    },
    // Legacy status colors - keep for backward compatibility
    [OrderStatus.INPROGRESS]: {
        bg: 'bg-blue-100 dark:bg-blue-950/50',
        text: 'text-blue-800 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
    },
    [OrderStatus.APPROVED]: {
        bg: 'bg-green-100 dark:bg-green-950/50',
        text: 'text-green-800 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800',
    },
    [OrderStatus.REJECTED]: {
        bg: 'bg-red-100 dark:bg-red-950/50',
        text: 'text-red-800 dark:text-red-300',
        border: 'border-red-200 dark:border-red-800',
    },
    [OrderStatus.COMPLETED]: {
        bg: 'bg-purple-100 dark:bg-purple-950/50',
        text: 'text-purple-800 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800',
    },
    [OrderStatus.CANCELLED]: {
        bg: 'bg-gray-100 dark:bg-gray-950/50',
        text: 'text-gray-800 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-800',
    },
    [OrderStatus.POSTPONED]: {
        bg: 'bg-orange-100 dark:bg-orange-950/50',
        text: 'text-orange-800 dark:text-orange-300',
        border: 'border-orange-200 dark:border-orange-800',
    },
    [OrderStatus.OUTFORDELIVERY]: {
        bg: 'bg-blue-100 dark:bg-blue-950/50',
        text: 'text-blue-800 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
    },
    [OrderStatus.DELIVERED]: {
        bg: 'bg-teal-100 dark:bg-teal-950/50',
        text: 'text-teal-800 dark:text-teal-300',
        border: 'border-teal-200 dark:border-teal-800',
    },
};

export interface QuotationItem {
    uid: number;
    product: Product;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    description?: string;
    sku: string;
    quotation?: Quotation;
}

export interface Quotation {
    uid: number;
    quotationNumber: string;
    totalAmount: number;
    totalItems: number;
    status: OrderStatus;
    quotationDate: Date;
    placedBy: User;
    client: Client;
    quotationItems: QuotationItem[];
    shippingMethod?: string;
    notes?: string;
    shippingInstructions?: string;
    packagingRequirements?: string;
    reseller?: User;
    resellerCommission?: number;
    createdAt: Date;
    updatedAt: Date;
    validUntil?: Date;
    pdfURL?: string;
    branch?: {
        uid: number;
        name: string;
    };
    project?: ProjectSummary;
    isDeleted?: boolean;
}

export interface PaginatedQuotationsResponse {
    items: Quotation[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface QuotationFilterParams {
    status?: OrderStatus;
    clientId?: number;
    placedById?: number;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    page?: number;
    limit?: number;
}

export interface QuotationsByStatus {
    draft: Quotation[];
    pending_internal: Quotation[];
    pending_client: Quotation[];
    negotiation: Quotation[];
    approved: Quotation[];
    rejected: Quotation[];
    sourcing: Quotation[];
    packing: Quotation[];
    in_fulfillment: Quotation[];
    paid: Quotation[];
    outfordelivery: Quotation[];
    delivered: Quotation[];
    returned: Quotation[];
    completed: Quotation[];
    cancelled: Quotation[];
    postponed: Quotation[];
    // Legacy status fields - keep for backward compatibility
    pending: Quotation[];
    inprogress: Quotation[];
}

export interface QuotationStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    completed: number;
    conversion: number;
    averageValue: number;
}
