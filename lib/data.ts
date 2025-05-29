export type MarkerType =
    | 'check-in'
    | 'shift-start'
    | 'lead'
    | 'journal'
    | 'task'
    | 'break-start'
    | 'break-end'
    | 'client'
    | 'competitor'
    | 'quotation';

export interface JobStatusType {
    startTime: string;
    endTime: string;
    duration: string;
    status: string;
    completionPercentage: number;
}

export interface BreakDataType {
    startTime: string;
    endTime: string;
    duration: string;
    location: string;
    remainingTime: string;
}

export interface WorkerType {
    id: string;
    name: string;
    status: string;
    position: [number, number];
    markerType: MarkerType;
    image?: string;
    canAddTask?: boolean;
    task?: {
        id: string;
        title: string;
        client: string;
    };
    location: {
        address: string;
        imageUrl?: string;
    };
    schedule: {
        current: string;
        next: string;
    };
    jobStatus?: JobStatusType;
    breakData?: BreakDataType;
    activity?: {
        claims: number;
        journals: number;
        leads: number;
        checkIns: number;
        tasks: number;
        quotations: number;
    };
}

export interface ClientType {
    id: number;
    name: string;
    position: [number, number];
    latitude: number;
    longitude: number;
    clientRef: string;
    contactName?: string;
    email?: string;
    phone?: string;
    alternativePhone?: string;
    status: string;
    website?: string;
    logo?: string;
    logoUrl?: string;
    address: any;
    markerType: MarkerType;
    // Enhanced client fields
    description?: string;
    industry?: string;
    companySize?: number;
    annualRevenue?: number;
    creditLimit?: number;
    outstandingBalance?: number;
    lifetimeValue?: number;
    priceTier?: string;
    riskLevel?: string;
    satisfactionScore?: number;
    npsScore?: number;
    preferredContactMethod?: string;
    preferredPaymentMethod?: string;
    paymentTerms?: string;
    discountPercentage?: number;
    lastVisitDate?: Date | string;
    nextContactDate?: Date | string;
    acquisitionChannel?: string;
    acquisitionDate?: Date | string;
    birthday?: Date | string;
    anniversaryDate?: Date | string;
    tags?: string[];
    visibleCategories?: string[];
    socialProfiles?: {
        linkedin?: string;
        twitter?: string;
        facebook?: string;
        instagram?: string;
    };
    customFields?: Record<string, any>;
    assignedSalesRep?: {
        uid: number;
        name: string;
    };
    geofencing?: {
        enabled: boolean;
        type: string;
        radius: number;
    };
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface CompetitorType {
    id: number;
    name: string;
    position: [number, number];
    latitude: number;
    longitude: number;
    markerType: MarkerType;
    threatLevel?: number;
    isDirect?: boolean;
    industry?: string;
    status: string;
    website?: string;
    logoUrl?: string;
    competitorRef: string;
    address: any;
    // Enhanced competitor fields
    description?: string;
    contactEmail?: string;
    contactPhone?: string;
    marketSharePercentage?: number;
    estimatedAnnualRevenue?: number;
    estimatedEmployeeCount?: number;
    competitiveAdvantage?: number;
    foundedDate?: Date | string;
    keyProducts?: string[];
    keyStrengths?: string[];
    keyWeaknesses?: string[];
    pricingData?: {
        lowEndPricing?: number;
        midRangePricing?: number;
        highEndPricing?: number;
        pricingModel?: string;
    };
    businessStrategy?: string;
    marketingStrategy?: string;
    socialMedia?: {
        linkedin?: string;
        twitter?: string;
        facebook?: string;
        instagram?: string;
    };
    geofencing?: {
        enabled: boolean;
        type: string;
        radius: number;
    };
    createdBy?: {
        uid: number;
        name: string;
    };
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface QuotationType {
    id: number;
    quotationNumber: string;
    clientName: string;
    position: [number, number];
    totalAmount: number;
    status: string;
    quotationDate: string | Date;
    placedBy: string;
    isConverted: boolean;
    validUntil?: string | Date;
    markerType: MarkerType;
}

// Updated worker data with Johannesburg coordinates
export const workers: WorkerType[] = [
    {
        id: 'worker-1',
        name: 'Thabo Mbeki',
        status: 'Work in progress',
        position: [-26.2041, 28.0473], // Johannesburg CBD
        markerType: 'check-in',
        image: '/placeholder.svg?height=100&width=100',
        canAddTask: true,
        task: {
            id: 'J22008',
            title: 'Fix broken heating vent',
            client: 'Sandton City Mall',
        },
        location: {
            address: 'Nelson Mandela Square, Sandton, Johannesburg',
        },
        schedule: {
            current: '09:30 AM - 12:45 PM',
            next: '02:00 PM - 04:00 PM',
        },
    },
    {
        id: 'worker-2',
        name: 'Lerato Khumalo',
        status: 'On break',
        position: [-26.1867, 28.0568], // Sandton
        markerType: 'journal',
        image: '/placeholder.svg?height=100&width=100',
        task: {
            id: 'J22009',
            title: 'Install new AC unit',
            client: 'Sandton City Mall',
        },
        location: {
            address: '155 West Street, Sandton, Johannesburg',
        },
        schedule: {
            current: '08:00 AM - 12:00 PM',
            next: '01:00 PM - 05:00 PM',
        },
    },
    {
        id: 'worker-3',
        name: 'Sipho Nkosi',
        status: 'Completed task',
        position: [-26.1052, 28.056], // Midrand
        markerType: 'shift-start',
        image: '/placeholder.svg?height=100&width=100',
        task: {
            id: 'J22010',
            title: 'Repair electrical panel',
            client: 'Mall of Africa',
        },
        location: {
            address: 'Magwa Crescent, Midrand, Johannesburg',
        },
        schedule: {
            current: '10:00 AM - 01:30 PM',
            next: '03:00 PM - 06:00 PM',
        },
    },
    {
        id: 'worker-4',
        name: 'Nomsa Dlamini',
        status: 'En route to next job',
        position: [-26.2485, 28.13], // Kempton Park
        markerType: 'task',
        image: '/placeholder.svg?height=100&width=100',
        task: {
            id: 'J22011',
            title: 'Plumbing inspection',
            client: 'OR Tambo International Airport',
        },
        location: {
            address: 'O.R. Tambo International Airport, Kempton Park',
        },
        schedule: {
            current: '11:00 AM - 02:00 PM',
            next: '03:30 PM - 05:30 PM',
        },
    },
    {
        id: 'worker-5',
        name: 'Mandla Zulu',
        status: 'Starting shift',
        position: [-26.1719, 27.9695], // Randburg
        markerType: 'lead',
        image: '/placeholder.svg?height=100&width=100',
        canAddTask: true,
        location: {
            address: 'Brightwater Commons, Randburg, Johannesburg',
        },
        schedule: {
            current: '09:00 AM - 05:00 PM',
            next: 'Tomorrow 08:00 AM',
        },
    },
    {
        id: '6',
        name: 'Precious Moloi',
        status: 'Working on task',
        position: [-26.1844, 27.9699], // Cresta
        markerType: 'task',
        image: '/placeholder.svg?height=100&width=100',
        task: {
            id: 'J22012',
            title: 'HVAC maintenance',
            client: 'Cresta Shopping Centre',
        },
        location: {
            address: 'Cresta Shopping Centre, Randburg, Johannesburg',
        },
        schedule: {
            current: '10:30 AM - 01:45 PM',
            next: '03:00 PM - 06:00 PM',
        },
    },
    {
        id: '7',
        name: 'Bongani Khumalo',
        status: 'Completed journal entry',
        position: [-26.2708, 28.1124], // Germiston
        markerType: 'journal',
        image: '/placeholder.svg?height=100&width=100',
        task: {
            id: 'J22013',
            title: 'Weekly maintenance report',
            client: 'East Rand Mall',
        },
        location: {
            address: 'East Rand Mall, Boksburg, Johannesburg',
        },
        schedule: {
            current: '09:15 AM - 12:30 PM',
            next: '02:15 PM - 05:30 PM',
        },
    },
    {
        id: '8',
        name: 'Themba Ndlovu',
        status: 'New lead acquisition',
        position: [-26.1742, 27.91], // Roodepoort
        markerType: 'lead',
        image: '/placeholder.svg?height=100&width=100',
        task: {
            id: 'J22014',
            title: 'New client consultation',
            client: 'Clearwater Mall',
        },
        location: {
            address: 'Clearwater Mall, Roodepoort, Johannesburg',
        },
        schedule: {
            current: '11:30 AM - 01:00 PM',
            next: '03:30 PM - 05:00 PM',
        },
    },
];

export interface EventType {
    id: string | number;
    type: string;
    userId?: number;
    userName?: string;
    timestamp?: string;
    location?:
        | string
        | {
              lat: number;
              lng: number;
              address: string;
              imageUrl?: string;
          };
    details?: string;
    title?: string;
    time?: string;
    user?: string;
    amount?: string;
    currency?: string;
}

export const events: EventType[] = [
    {
        id: 'event-1',
        type: 'check-in',
        title: 'Morning check-in',
        time: 'Today, 08:15 AM',
        location: 'Nelson Mandela Square, Sandton, Johannesburg',
        user: 'Thabo Mbeki',
    },
    {
        id: 'event-2',
        type: 'task',
        title: 'Fix broken heating vent',
        time: 'Today, 09:30 AM',
        location: 'Nelson Mandela Square, Sandton, Johannesburg',
        user: 'Thabo Mbeki',
    },
    {
        id: 'event-3',
        type: 'journal',
        title: 'Completed maintenance report',
        time: 'Today, 11:45 AM',
        location: '155 West Street, Sandton, Johannesburg',
        user: 'Lerato Khumalo',
    },
    {
        id: 'event-4',
        type: 'shift-start',
        title: 'Started afternoon shift',
        time: 'Today, 01:00 PM',
        location: 'Magwa Crescent, Midrand, Johannesburg',
        user: 'Sipho Nkosi',
    },
    {
        id: 'event-5',
        type: 'lead',
        title: 'New client lead - Mall of Africa',
        time: 'Today, 02:30 PM',
        location: 'Brightwater Commons, Randburg, Johannesburg',
        user: 'Mandla Zulu',
    },
    {
        id: 'e6',
        type: 'check-in',
        title: 'Site arrival check-in',
        time: 'Today, 03:15 PM',
        location: 'Brightwater Commons, Randburg, Johannesburg',
        user: 'Mandla Zulu',
    },
    {
        id: 'e7',
        type: 'task',
        title: 'Install new AC unit',
        time: 'Yesterday, 02:00 PM',
        location: '155 West Street, Sandton, Johannesburg',
        user: 'Lerato Khumalo',
    },
    {
        id: 'e8',
        type: 'journal',
        title: 'Weekly progress report',
        time: 'Yesterday, 04:30 PM',
        location: 'Magwa Crescent, Midrand, Johannesburg',
        user: 'Sipho Nkosi',
    },
    {
        id: 'e9',
        type: 'task',
        title: 'HVAC maintenance',
        time: 'Today, 10:30 AM',
        location: 'Cresta Shopping Centre, Randburg, Johannesburg',
        user: 'Precious Moloi',
    },
    {
        id: 'e10',
        type: 'lead',
        title: 'New client consultation',
        time: 'Today, 11:30 AM',
        location: 'Clearwater Mall, Roodepoort, Johannesburg',
        user: 'Themba Ndlovu',
    },
];
