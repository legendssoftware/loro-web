import { OrderStatus } from '@/lib/enums/status.enums';
import { User } from './user';
import { Product } from './product';
import { Client } from './client';

export interface StatusColorConfig {
    bg: string;
    text: string;
    border: string;
}

export const StatusColors: Record<string, StatusColorConfig> = {
    [OrderStatus.PENDING]: {
        bg: 'bg-yellow-100 dark:bg-yellow-950/50',
        text: 'text-yellow-800 dark:text-yellow-300',
        border: 'border-yellow-200 dark:border-yellow-800',
    },
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
    branch?: {
        uid: number;
        name: string;
    };
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
    'pending': Quotation[];
    'inprogress': Quotation[];
    'approved': Quotation[];
    'rejected': Quotation[];
    'completed': Quotation[];
    'cancelled': Quotation[];
    'postponed': Quotation[];
    'outfordelivery': Quotation[];
    'delivered': Quotation[];
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
