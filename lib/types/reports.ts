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
        total: number;
        metrics?: {
            valueGrowth: string;
        };
        breakdown: {
            label: string;
            value: number;
        }[];
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

export type MetricTrend = 'up' | 'down' | 'stable';

export interface BreakdownMetric {
    category: string;
    value: number;
    percentage: number;
}

export interface FinancialMetrics {
    revenue: {
        current: number;
        previous: number;
        growth: string;
        trend: MetricTrend;
        breakdown: BreakdownMetric[];
    };
    claims: {
        total: number;
        paid: number;
        pending: number;
        average: number;
        largestClaim: number;
        byType: Record<string, number>;
    };
    quotations: {
        total: number;
        accepted: number;
        pending: number;
        conversion: number;
        averageValue: number;
    };
}

export interface PerformanceMetrics {
    leads: {
        total: number;
        converted: number;
        conversionRate: number;
        averageResponseTime: string;
        bySource: Record<string, number>;
        qualityScore: number;
    };
    tasks: {
        total: number;
        completed: number;
        overdue: number;
        completionRate: number;
        averageCompletionTime: string;
        byPriority: Record<string, number>;
        byType: Record<string, number>;
    };
    attendance: {
        averageHours: number;
        punctuality: number;
        overtime: number;
        absences: number;
        remoteWork: number;
        byDepartment: Record<string, number>;
    };
}

export interface ComparisonMetrics {
    previousPeriod: {
        revenue: number;
        leads: number;
        tasks: number;
        claims: number;
    };
    yearOverYear: {
        revenue: number;
        leads: number;
        tasks: number;
        claims: number;
    };
    targets: {
        revenue: { target: number; achieved: number };
        leads: { target: number; achieved: number };
        tasks: { target: number; achieved: number };
        claims: { target: number; achieved: number };
    };
}

export interface TrendMetrics {
    seasonal: {
        peak: { period: string; value: number };
        low: { period: string; value: number };
    };
    patterns: {
        daily: Record<string, number>;
        weekly: Record<string, number>;
        monthly: Record<string, number>;
    };
    forecast: {
        nextPeriod: number;
        confidence: number;
        factors: string[];
    };
}

export interface DailyReportMetrics {
    totalQuotations: number;
    grossQuotationValue: string;
    averageQuotationValue: string;
    quotationTrends?: {
        growth: string;
    };
}

export interface DailyReportOrders {
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
    postponed: number;
    rejected: number;
    approved: number;
    metrics: DailyReportMetrics;
}

export interface DailyReportTasks {
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
}

export interface ReportResponse {
    // Generated report format
    metadata?: {
        generatedAt: string;
        period: string;
        filters: Record<string, unknown>;
    };
    financial?: FinancialMetrics;
    performance?: PerformanceMetrics;
    comparison?: ComparisonMetrics;
    trends?: TrendMetrics;
    summary?: {
        highlights: string[];
        recommendations: string[];
    };

    // Daily report format
    orders?: DailyReportOrders;
    tasks?: DailyReportTasks;
    leads?: {
        pending: number;
        approved: number;
        inReview: number;
        declined: number;
        total: number;
        metrics?: {
            leadTrends: {
                growth: string;
            };
        };
    };
    claims?: {
        pending: number;
        approved: number;
        declined: number;
        paid: number;
        totalValue: string;
        total: number;
        metrics?: {
            valueGrowth: string;
        };
    };
    attendance?: {
        attendance: number;
        present: number;
        total: number;
    };
}

export interface ChartDataPoint {
    date: string;
    value: number;
    trend?: MetricTrend;
}

export interface TaskMetrics {
    total: number;
    completed: number;
    pending: number;
    priority: Record<string, number>;
}

export interface QuotationMetrics {
    total: number;
    accepted: number;
    pending: number;
    averageValue: number;
    conversion: number;
}

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type ReportType = 'quotation' | 'task' | 'lead' | 'claim';
//     leads: {
//         pending: number;
//         approved: number;
//         inReview: number;
//         declined: number;
//         total: number;
//         metrics?: {
//             leadTrends?: {
//                 growth?: string;
//             };
//         };
//     };
//     claims: {
//         pending: number;
//         approved: number;
//         declined: number;
//         paid: number;
//         totalValue: number;
//         metrics?: {
//             valueGrowth?: string;
//         };
//     };
//     tasks: {
//         pending: number;
//         completed: number;
//         missed: number;
//         postponed: number;
//         total: number;
//         metrics?: {
//             taskTrends?: {
//                 growth?: string;
//             };
//         };
//     };
//     orders: {
//         pending: number;
//         processing: number;
//         completed: number;
//         cancelled: number;
//         postponed: number;
//         rejected: number;
//         approved: number;
//         metrics: {
//             totalQuotations: number;
//             grossQuotationValue: number;
//             averageQuotationValue: number;
//             quotationTrends?: {
//                 growth?: string;
//             };
//         };
//     };
// }
