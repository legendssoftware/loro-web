export interface ClientAddress {
    city: string;
    state: string;
    street: string;
    suburb: string;
    country: string;
    postalCode: string;
}

export interface ClientCommunicationSchedule {
    uid: number;
    communicationType: string;
    frequency: string;
    customFrequencyDays?: number;
    preferredTime?: string; // Format: "HH:MM"
    preferredDays?: number[]; // Array of day numbers (0=Sunday, 1=Monday, etc.)
    nextScheduledDate?: Date;
    lastCompletedDate?: Date;
    isActive: boolean;
    notes?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    isDeleted?: boolean;
    assignedTo?: {
        uid: number;
        name?: string;
        email?: string;
    };
}

export interface Client {
    uid: number;
    name: string;
    email: string;
    phone?: string;
    address?: ClientAddress;
    contactPerson?: string;
    industry?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    isDeleted?: boolean;
    photo?: string;
    ref?: string;
    type?: string;
    website?: string;
    notes?: string;
    logo?: string;
    description?: string;
    category?: string;
    alternativePhone?: string;
    gpsCoordinates?: string;
    creditLimit?: number;
    outstandingBalance?: number;
    priceTier?: string;
    preferredContactMethod?: string;
    lastVisitDate?: Date;
    nextContactDate?: Date;
    visibleCategories?: string[];
    tags?: string[];
    birthday?: Date;
    anniversaryDate?: Date;
    lifetimeValue?: number;
    discountPercentage?: number;
    paymentTerms?: string;
    acquisitionChannel?: string;
    acquisitionDate?: Date;
    riskLevel?: string;
    preferredPaymentMethod?: string;
    preferredLanguage?: string;
    companySize?: number;
    annualRevenue?: number;
    satisfactionScore?: number;
    npsScore?: number;
    customFields?: Record<string, any>;
    socialProfiles?: {
        linkedin?: string;
        twitter?: string;
        facebook?: string;
        instagram?: string;
        [key: string]: string | undefined;
    };
    assignedSalesRep?: { uid: number };
    geofenceType?: string;
    geofenceRadius?: number;
    enableGeofence?: boolean;
    latitude?: number;
    longitude?: number;
    communicationSchedules?: ClientCommunicationSchedule[];
}
