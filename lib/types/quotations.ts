import { Client } from './tasks';
import { User } from './tasks';

export interface QuotationItem {
    uid: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    product: {
        uid: number;
        name: string;
        sku: string;
        barcode: string;
        productRef: string;
    };
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
}
export enum OrderStatus {
    PENDING = "Pending",
    ACCEPTED = "Accepted",
    REJECTED = "Rejected",
}

export type CreateQuotationDTO = Omit<Quotation, 'uid' | 'createdAt' | 'updatedAt'>;
export type UpdateQuotationDTO = Partial<CreateQuotationDTO>; 