export enum AccountStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DELETED = 'deleted',
    BANNED = 'banned',
    PENDING = 'pending',
    APPROVED = 'approved',
    REVIEW = 'review',
    DECLINED = 'declined',
}

export enum PaymentStatus {
    PAID = 'paid',
    UNPAID = 'unpaid',
    PARTIAL = 'partial',
    OVERDUE = 'overdue',
}

export enum ClaimStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    PAID = 'paid',
    CANCELLED = 'cancelled',
    DECLINED = 'declined',
    DELETED = 'deleted',
}

export enum OrderStatus {
    DRAFT = 'draft',
    PENDING_INTERNAL = 'pending_internal',
    PENDING_CLIENT = 'pending_client',
    NEGOTIATION = 'negotiation',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    SOURCING = 'sourcing',
    PACKING = 'packing',
    IN_FULFILLMENT = 'in_fulfillment',
    PAID = 'paid',
    OUTFORDELIVERY = 'outfordelivery',
    DELIVERED = 'delivered',
    RETURNED = 'returned',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    POSTPONED = 'postponed',
    INPROGRESS = 'inprogress',
    PENDING = 'pending',
}
