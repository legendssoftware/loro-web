export enum LeadStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REVIEW = 'REVIEW',
    DECLINED = 'DECLINED',
    CONVERTED = 'CONVERTED',
    CANCELLED = 'CANCELLED',
}

export interface StatusColorConfig {
    bg: string;
    text: string;
    border: string;
}

export const StatusColors: Record<LeadStatus, StatusColorConfig> = {
    [LeadStatus.PENDING]: {
        bg: 'bg-yellow-100 dark:bg-yellow-950/50',
        text: 'text-yellow-800 dark:text-yellow-300',
        border: 'border-yellow-200 dark:border-yellow-800',
    },
    [LeadStatus.APPROVED]: {
        bg: 'bg-green-100 dark:bg-green-950/50',
        text: 'text-green-800 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800',
    },
    [LeadStatus.REVIEW]: {
        bg: 'bg-blue-100 dark:bg-blue-950/50',
        text: 'text-blue-800 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
    },
    [LeadStatus.DECLINED]: {
        bg: 'bg-red-100 dark:bg-red-950/50',
        text: 'text-red-800 dark:text-red-300',
        border: 'border-red-200 dark:border-red-800',
    },
    [LeadStatus.CONVERTED]: {
        bg: 'bg-purple-100 dark:bg-purple-950/50',
        text: 'text-purple-800 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800',
    },
    [LeadStatus.CANCELLED]: {
        bg: 'bg-gray-100 dark:bg-gray-950/50',
        text: 'text-gray-800 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-800',
    },
};

export interface LeadStatusHistoryEntry {
    timestamp: Date;
    oldStatus?: LeadStatus;
    newStatus: LeadStatus;
    reason?: string;
    description?: string;
    nextStep?: string;
    userId?: number;
    user?: {
        uid: number;
        username?: string;
        name?: string;
        surname?: string;
        email?: string;
        phone?: string;
        photoURL?: string;
        accessLevel?: string;
        status?: string;
    };
}

export interface Lead {
    uid: number;
    name: string;
    email: string;
    phone: string;
    notes?: string;
    companyName?: string;
    image?: string;
    status: LeadStatus;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    latitude?: number;
    longitude?: number;
    category?: string;

    // Enhanced fields
    intent?: LeadIntent;
    userQualityRating?: number;
    temperature?: LeadTemperature;
    source?: LeadSource;
    priority?: LeadPriority;
    lifecycleStage?: LeadLifecycleStage;
    jobTitle?: string;
    decisionMakerRole?: DecisionMakerRole;
    industry?: Industry;
    businessSize?: BusinessSize;
    budgetRange?: BudgetRange;
    purchaseTimeline?: Timeline;
    preferredCommunication?: CommunicationPreference;
    timezone?: string;
    bestContactTime?: string;
    painPoints?: string;
    estimatedValue?: number;
    competitorInfo?: string;
    referralSource?: string;
    campaignName?: string;
    landingPage?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmContent?: string;
    customFields?: Record<string, any>;

    // Scoring and activity fields
    leadScore?: number;
    lastContactDate?: Date;
    nextFollowUpDate?: Date;
    totalInteractions?: number;
    averageResponseTime?: string;
    daysSinceLastResponse?: number;

    // Complex objects
    scoringData?: {
        fitScore: number;
        totalScore: number;
        scoreHistory: Array<{
            score: number;
            reason: string;
            timestamp: string;
        }>;
        lastCalculated: string;
        behavioralScore: number;
        engagementScore: number;
        demographicScore: number;
    };

    activityData?: {
        engagementLevel: string;
        lastContactDate?: Date;
        nextFollowUpDate?: Date;
        touchPointsCount: number;
        emailInteractions: number;
        phoneInteractions: number;
        totalInteractions: number;
        lastEngagementType: string;
        unresponsiveStreak: number;
        averageResponseTime: number;
        meetingInteractions: number;
    };

    bantQualification?: any;
    sourceTracking?: any;
    competitorData?: any;

    // Ownership fields
    ownerUid?: number;
    organisationUid?: number;
    branchUid?: number;

    owner?: {
        uid: number;
        username?: string;
        name: string;
        surname?: string;
        email: string;
        phone?: string;
        photoURL?: string;
        role?: string;
        status?: string;
        accessLevel?: string;
        businesscardURL?: string;
        departmentId?: number;
        createdAt?: Date;
        updatedAt?: Date;
        organisationRef?: number;
        isDeleted?: boolean;
        // Additional fields for expanded owner object
        password?: string;
        verificationToken?: string;
        resetToken?: string;
        tokenExpires?: Date;
        expoPushToken?: string;
        deviceId?: string;
        platform?: string;
        pushTokenUpdatedAt?: Date;
    };

    branch?: {
        uid: number;
        name: string;
        email: string;
        phone: string;
        contactPerson: string;
        ref: string;
        address: {
            city: string;
            state: string;
            street: string;
            suburb: string;
            country: string;
            postalCode: string;
        };
        website: string;
        status: string;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    };

    organisation?: {
        uid: number;
        name: string;
        email: string;
        phone: string;
        website: string;
        logo?: string;
        address: {
            city: string;
            state: string;
            street: string;
            suburb: string;
            country: string;
            postalCode: string;
        };
        status: string;
        isDeleted: boolean;
        ref: string;
        createdAt: Date;
        updatedAt: Date;
    };

    client?: {
        uid: number;
        name: string;
        email: string;
        phone: string;
    };

    // Updated assignees to full user objects
    assignees?: Array<{
        uid: number;
        username?: string;
        name: string;
        surname?: string;
        email: string;
        phone?: string;
        photoURL?: string;
        status: string;
        accessLevel: string;
    }>;

    assignTo?: { uid: number }[];
    statusChangeReason?: string;
    statusChangeDescription?: string;
    nextStep?: string;
    changeHistory?: LeadStatusHistoryEntry[];
}

export interface PaginatedLeadsResponse {
    items: Lead[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface LeadFilterParams {
    status?: LeadStatus;
    search?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
    ownerUid?: number;
    branchUid?: number;
    clientUid?: number;
}

export interface LeadStats {
    total: number;
    pending: number;
    approved: number;
    review: number;
    declined: number;
    converted: number;
    cancelled: number;
}

export interface LeadsByStatus {
    [LeadStatus.PENDING]: Lead[];
    [LeadStatus.APPROVED]: Lead[];
    [LeadStatus.REVIEW]: Lead[];
    [LeadStatus.DECLINED]: Lead[];
    [LeadStatus.CONVERTED]: Lead[];
    [LeadStatus.CANCELLED]: Lead[];
}

// Enhanced Lead Management Enums
export enum LeadIntent {
    PURCHASE = "PURCHASE",
    ENQUIRY = "ENQUIRY",
    SERVICES = "SERVICES",
    LOST = "LOST",
    CONVERSION = "CONVERSION",
    CONSULTATION = "CONSULTATION",
    QUOTE_REQUEST = "QUOTE_REQUEST",
    DEMO_REQUEST = "DEMO_REQUEST",
    INFORMATION_GATHERING = "INFORMATION_GATHERING",
    COMPARISON_SHOPPING = "COMPARISON_SHOPPING",
    PRICE_CHECK = "PRICE_CHECK",
    SUPPORT = "SUPPORT",
    PARTNERSHIP = "PARTNERSHIP",
    INVESTMENT = "INVESTMENT",
    BULK_ORDER = "BULK_ORDER",
    CUSTOM_SOLUTION = "CUSTOM_SOLUTION",
    TRIAL = "TRIAL",
    RENEWAL = "RENEWAL",
    UPGRADE = "UPGRADE",
    DOWNGRADE = "DOWNGRADE",
    COMPLAINT = "COMPLAINT",
    FEEDBACK = "FEEDBACK",
    REFERRAL = "REFERRAL",
    RESEARCH = "RESEARCH",
    UNKNOWN = "UNKNOWN",
}

export enum LeadTemperature {
    HOT = "HOT",
    WARM = "WARM",
    COLD = "COLD",
    FROZEN = "FROZEN",
}

export enum LeadSource {
    WEBSITE = "WEBSITE",
    SOCIAL_MEDIA = "SOCIAL_MEDIA",
    REFERRAL = "REFERRAL",
    COLD_CALL = "COLD_CALL",
    EMAIL_CAMPAIGN = "EMAIL_CAMPAIGN",
    TRADE_SHOW = "TRADE_SHOW",
    ADVERTISING = "ADVERTISING",
    DIRECT_MAIL = "DIRECT_MAIL",
    PARTNER = "PARTNER",
    ORGANIC_SEARCH = "ORGANIC_SEARCH",
    PAID_SEARCH = "PAID_SEARCH",
    CONTENT_MARKETING = "CONTENT_MARKETING",
    WEBINAR = "WEBINAR",
    OTHER = "OTHER",
}

export enum LeadPriority {
    CRITICAL = "CRITICAL",
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW",
}

export enum LeadLifecycleStage {
    SUBSCRIBER = "SUBSCRIBER",
    LEAD = "LEAD",
    MARKETING_QUALIFIED_LEAD = "MARKETING_QUALIFIED_LEAD",
    SALES_QUALIFIED_LEAD = "SALES_QUALIFIED_LEAD",
    OPPORTUNITY = "OPPORTUNITY",
    CUSTOMER = "CUSTOMER",
    EVANGELIST = "EVANGELIST",
}

export enum BusinessSize {
    STARTUP = "STARTUP",
    SMALL = "SMALL",
    MEDIUM = "MEDIUM",
    LARGE = "LARGE",
    ENTERPRISE = "ENTERPRISE",
    UNKNOWN = "UNKNOWN",
}

export enum Industry {
    TECHNOLOGY = "TECHNOLOGY",
    HEALTHCARE = "HEALTHCARE",
    FINANCE = "FINANCE",
    RETAIL = "RETAIL",
    MANUFACTURING = "MANUFACTURING",
    EDUCATION = "EDUCATION",
    CONSTRUCTION = "CONSTRUCTION",
    REAL_ESTATE = "REAL_ESTATE",
    AUTOMOTIVE = "AUTOMOTIVE",
    AGRICULTURE = "AGRICULTURE",
    ENERGY = "ENERGY",
    TELECOMMUNICATIONS = "TELECOMMUNICATIONS",
    ENTERTAINMENT = "ENTERTAINMENT",
    HOSPITALITY = "HOSPITALITY",
    TRANSPORTATION = "TRANSPORTATION",
    GOVERNMENT = "GOVERNMENT",
    NON_PROFIT = "NON_PROFIT",
    CONSULTING = "CONSULTING",
    MARKETING = "MARKETING",
    LEGAL = "LEGAL",
    OTHER = "OTHER",
}

export enum BudgetRange {
    UNDER_1K = "UNDER_1K",
    R1K_5K = "R1K_5K",
    R5K_10K = "R5K_10K",
    R10K_25K = "R10K_25K",
    R25K_50K = "R25K_50K",
    R50K_100K = "R50K_100K",
    R100K_250K = "R100K_250K",
    R250K_500K = "R250K_500K",
    R500K_1M = "R500K_1M",
    OVER_1M = "OVER_1M",
    UNKNOWN = "UNKNOWN",
}

export enum Timeline {
    IMMEDIATE = "IMMEDIATE",
    SHORT_TERM = "SHORT_TERM",
    MEDIUM_TERM = "MEDIUM_TERM",
    LONG_TERM = "LONG_TERM",
    FUTURE = "FUTURE",
    UNKNOWN = "UNKNOWN",
}

export enum CommunicationPreference {
    EMAIL = "EMAIL",
    PHONE = "PHONE",
    SMS = "SMS",
    WHATSAPP = "WHATSAPP",
    IN_PERSON = "IN_PERSON",
    VIDEO_CALL = "VIDEO_CALL",
    SOCIAL_MEDIA = "SOCIAL_MEDIA",
}

export enum DecisionMakerRole {
    CEO = "CEO",
    CTO = "CTO",
    CFO = "CFO",
    CMO = "CMO",
    DIRECTOR = "DIRECTOR",
    MANAGER = "MANAGER",
    SUPERVISOR = "SUPERVISOR",
    ANALYST = "ANALYST",
    COORDINATOR = "COORDINATOR",
    SPECIALIST = "SPECIALIST",
    CONSULTANT = "CONSULTANT",
    OWNER = "OWNER",
    PARTNER = "PARTNER",
    OTHER = "OTHER",
    UNKNOWN = "UNKNOWN",
}
