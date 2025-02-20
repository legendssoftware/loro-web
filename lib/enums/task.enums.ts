export enum TaskType {
    IN_PERSON_MEETING = 'IN_PERSON_MEETING',
    VIRTUAL_MEETING = 'VIRTUAL_MEETING',
    CALL = 'CALL',
    EMAIL = 'EMAIL',
    WHATSAPP = 'WHATSAPP',
    SMS = 'SMS',
    FOLLOW_UP = 'FOLLOW_UP',
    PROPOSAL = 'PROPOSAL',
    REPORT = 'REPORT',
    QUOTATION = 'QUOTATION',
    VISIT = 'VISIT',
    OTHER = 'OTHER',
}

export enum RepetitionType {
    NONE = 'NONE',
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
}

export enum Priority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
}

export enum TaskStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    OVERDUE = 'OVERDUE',
    POSTPONED = 'POSTPONED',
    MISSED = 'MISSED',
}

export enum TargetCategory {
    STANDARD = 'standard',
    PREMIUM = 'premium',
    ENTERPRISE = 'enterprise',
}
