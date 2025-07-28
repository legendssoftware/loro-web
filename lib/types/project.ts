// Project Types and Enums
export enum ProjectType {
    RESIDENTIAL_HOUSE = 'residential_house',
    COMMERCIAL_BUILDING = 'commercial_building',
    INDUSTRIAL_FACILITY = 'industrial_facility',
    RETAIL_SPACE = 'retail_space',
    OFFICE_BUILDING = 'office_building',
    WAREHOUSE = 'warehouse',
    HOTEL = 'hotel',
    RESTAURANT = 'restaurant',
    HOSPITAL = 'hospital',
    SCHOOL = 'school',
    APARTMENT_COMPLEX = 'apartment_complex',
    SHOPPING_CENTER = 'shopping_center',
    INFRASTRUCTURE = 'infrastructure',
    RENOVATION = 'renovation',
    MAINTENANCE = 'maintenance',
    OTHER = 'other'
}

export enum ProjectStatus {
    PLANNING = 'planning',
    DESIGN = 'design',
    APPROVED = 'approved',
    SOURCING = 'sourcing',
    IN_PROGRESS = 'in_progress',
    ON_HOLD = 'on_hold',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    DELAYED = 'delayed',
    REVIEW = 'review'
}

export enum ProjectPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent',
    CRITICAL = 'critical'
}

// Project Address interface
export interface ProjectAddress {
    street: string;
    suburb: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}

// Main Project interface
export interface Project {
    uid: number;
    name: string;
    description?: string;
    type: ProjectType;
    status: ProjectStatus;
    priority: ProjectPriority;

    // Budget information
    budget: number;
    currentSpent: number;

    // Contact information
    contactPerson: string;
    contactEmail?: string;
    contactPhone?: string;

    // Project timeline
    startDate?: Date;
    endDate?: Date;
    expectedCompletionDate?: Date;

    // Location information
    address?: ProjectAddress;
    latitude?: number;
    longitude?: number;

    // Additional project details
    requirements?: string[];
    tags?: string[];
    notes?: string;

    // Currency information
    currency?: string;

    // Progress tracking
    progressPercentage: number;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;

    // Relations
    client: {
        uid: number;
        name: string;
        email?: string;
        phone?: string;
    };

    assignedUser: {
        uid: number;
        name: string;
        email?: string;
        surname?: string;
    };

    quotations?: Array<{
        uid: number;
        quotationNumber: string;
        totalAmount: number;
        status: string;
        quotationDate: Date;
    }>;

    organisation?: {
        uid: number;
        name: string;
    };

    branch?: {
        uid: number;
        name: string;
    };
}

// Simplified Project interface for dropdowns and lists
export interface ProjectSummary {
    uid: number;
    name: string;
    type: ProjectType;
    status: ProjectStatus;
    priority: ProjectPriority;
    client: {
        uid: number;
        name: string;
    };
    budget: number;
    progressPercentage: number;
}

// Project creation/update interface
export interface CreateProjectRequest {
    name: string;
    description?: string;
    type: ProjectType;
    status?: ProjectStatus;
    priority?: ProjectPriority;
    budget: number;
    contactPerson: string;
    contactEmail?: string;
    contactPhone?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    expectedCompletionDate?: Date | string;
    address?: ProjectAddress;
    latitude?: number;
    longitude?: number;
    requirements?: string[];
    tags?: string[];
    notes?: string;
    currency?: string;
    clientUid: number;
    assignedUserUid: number;
    organisationUid?: number;
    branchUid?: number;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
    uid: number;
    progressPercentage?: number;
    currentSpent?: number;
}
