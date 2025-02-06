interface Lead {
    uid: number;
    name: string;
    email: string;
    phone: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface Claim {
    uid: number;
    amount: number;
    status: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface ReportMetrics {
    totalQuotations: number;
    totalRevenue: string;
    newCustomers: number;
    customerGrowth: string;
    userSpecific: {
        todayLeads: number;
        todayClaims: number;
        todayTasks: number;
        todayQuotations: number;
        hoursWorked: number;
    };
}

export interface DailyReport {
    leads: {
        total: number;
        review: Lead[];
        pending: Lead[];
        approved: Lead[];
        declined: Lead[];
        metrics?: {
            leadTrends: {
                growth: string;
            };
        };
    };
    claims: {
        paid: Claim[];
        pending: Claim[];
        approved: Claim[];
        declined: Claim[];
        totalValue: string;
        metrics?: {
            valueGrowth: string;
        };
    };
    tasks: {
        pending: number;
        completed: number;
        missed: number;
        postponed: number;
        total: number;
        metrics?: {
            taskTrends: {
                growth: string;
            };
        };
    };
    orders: {
        pending: number;
        processing: number;
        completed: number;
        cancelled: number;
        postponed: number;
        rejected: number;
        approved: number;
        metrics: {
            totalQuotations: number;
            grossQuotationValue: string;
            averageQuotationValue: string;
            quotationTrends: {
                growth: string;
            };
        };
    };
    attendance: {
        attendance: number;
        present: number;
        total: number;
    };
    metrics: ReportMetrics;
}

export interface MetricValue {
    value: number | string;
    label: string;
    change?: string;
    trend?: 'up' | 'down';
}

export interface GeneratedReport {
    uid: number;
    title: string;
    description: string;
    type: string;
    metadata: {
        period: string;
        startDate: string;
        endDate: string;
        branchId?: number;
        generatedAt: string;
        total: number;
        metrics: Record<string, MetricValue>;
    };
    createdAt: string;
    updatedAt: string;
} 