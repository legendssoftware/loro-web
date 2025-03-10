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
    PENDING = 'pending',
    INPROGRESS = 'inprogress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    POSTPONED = 'postponed',
    OUTFORDELIVERY = 'outfordelivery',
    DELIVERED = 'delivered',
    REJECTED = 'rejected',
    APPROVED = 'approved',
}
