export enum GeneralStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    PENDING = 'pending',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export enum TaskStatus {
    POSTPONED = 'postponed',
    MISSED = 'missed',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    PENDING = 'pending',
    INPROGRESS = 'inprogress',
}

export enum SubTaskStatus {
    COMPLETED = 'completed',
    PENDING = 'pending',
    INPROGRESS = 'inprogress',
}
