// Attendance Reports Types & Interfaces

export interface AttendanceReportUser {
    uid: number;
    name: string;
    surname: string;
    fullName: string;
    email: string;
    phone?: string;
    role: string;
    userProfile?: {
        avatar?: string;
    };
    branch?: {
        uid: number;
        name: string;
    };
    lateMinutes?: number;
    earlyMinutes?: number;
    checkInTime?: string;
    checkOutTime?: string;
    lateStatus?: 'on-time' | 'late' | 'very-late' | 'extremely-late';
    attendanceStatus?: 'present' | 'absent' | 'late' | 'on-break' | 'checked-out';
    totalWorkingMinutes?: number;
    totalBreakMinutes?: number;
    efficiency?: number;
}

export interface AttendanceReportBranch {
    uid: number;
    name: string;
    address?: string;
    totalEmployees: number;
    presentEmployees: number;
    absentEmployees: number;
    lateEmployees: number;
    attendanceRate: number;
    punctualityRate: number;
    averageWorkingHours: number;
    users: AttendanceReportUser[];
}

export interface AttendanceSummaryMetrics {
    totalEmployees: number;
    presentToday: number;
    absentToday: number;
    lateToday: number;
    onBreak: number;
    checkedOut: number;
    attendanceRate: number;
    punctualityRate: number;
    averageWorkingHours: number;
    totalWorkingMinutes: number;
    totalBreakMinutes: number;
    organizationEfficiency: number;
}

export interface AttendanceComparisons {
    yesterdayAttendanceRate: number;
    yesterdayPunctualityRate: number;
    lastWeekAttendanceRate: number;
    lastWeekPunctualityRate: number;
    monthlyTrend: number;
    attendanceRateChange: number;
    punctualityRateChange: number;
}

export interface AttendanceInsights {
    topPerformers: AttendanceReportUser[];
    concerningUsers: AttendanceReportUser[];
    branchComparisons: AttendanceReportBranch[];
    patterns: {
        mostProductiveHours: string[];
        commonLateReasons: string[];
        seasonalTrends: string[];
    };
}

export interface AttendanceRecommendations {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    policies: string[];
}

export interface MorningAttendanceReport {
    reportDate: string;
    generatedAt: string;
    reportType: 'morning';
    organization: {
        uid: number;
        name: string;
        workingHours: {
            start: string;
            end: string;
        };
    };
    summary: AttendanceSummaryMetrics;
    comparisons: AttendanceComparisons;
    branches: AttendanceReportBranch[];
    insights: AttendanceInsights;
    recommendations: AttendanceRecommendations;
    alerts: {
        critical: string[];
        warning: string[];
        info: string[];
    };
}

export interface EveningAttendanceReport {
    reportDate: string;
    generatedAt: string;
    reportType: 'evening';
    organization: {
        uid: number;
        name: string;
        workingHours: {
            start: string;
            end: string;
        };
    };
    summary: AttendanceSummaryMetrics;
    productivity: {
        totalProductiveHours: number;
        averageProductivity: number;
        overtimeHours: number;
        efficiencyScore: number;
    };
    completion: {
        tasksCompleted: number;
        goalsAchieved: number;
        projectsAdvanced: number;
        completionRate: number;
    };
    branches: AttendanceReportBranch[];
    insights: AttendanceInsights;
    recommendations: AttendanceRecommendations;
    nextDayPlanning: {
        expectedAttendance: number;
        plannedTasks: number;
        resourceAllocation: string[];
    };
}

export interface OrganizationAttendanceReport {
    reportDate: string;
    generatedAt: string;
    reportType: 'organization';
    dateRange: {
        start: string;
        end: string;
    };
    organization: {
        uid: number;
        name: string;
        totalEmployees: number;
        totalBranches: number;
    };
    summary: AttendanceSummaryMetrics;
    trends: {
        daily: Array<{
            date: string;
            attendanceRate: number;
            punctualityRate: number;
            productivity: number;
        }>;
        weekly: Array<{
            week: string;
            attendanceRate: number;
            punctualityRate: number;
            productivity: number;
        }>;
        monthly: Array<{
            month: string;
            attendanceRate: number;
            punctualityRate: number;
            productivity: number;
        }>;
    };
    branches: AttendanceReportBranch[];
    analytics: {
        peakAttendanceDays: string[];
        lowAttendanceDays: string[];
        productivityCorrelation: number;
        seasonalPatterns: string[];
    };
    insights: AttendanceInsights;
    recommendations: AttendanceRecommendations;
}

export interface AttendanceReportRequest {
    reportType: 'morning' | 'evening';
    organizationId?: number;
    userId?: number;
}

export interface AttendanceReportResponse {
    message: string;
    reportType: string;
    sentTo: string;
    generatedAt: string;
    organizationId: number;
    reportData: MorningAttendanceReport | EveningAttendanceReport | OrganizationAttendanceReport;
}

export interface AttendanceReportFilters {
    dateRange?: {
        start: string;
        end: string;
    };
    branchId?: number;
    departmentId?: number;
    status?: 'present' | 'absent' | 'late' | 'on-break' | 'checked-out';
    reportType?: 'morning' | 'evening' | 'organization';
}

export interface AttendanceChartData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string | string[];
        borderWidth?: number;
        fill?: boolean;
    }>;
}

export interface AttendanceAnalyticsData {
    attendanceRate: AttendanceChartData;
    punctualityTrends: AttendanceChartData;
    productivityMetrics: AttendanceChartData;
    branchComparison: AttendanceChartData;
    timeDistribution: AttendanceChartData;
    efficiencyScore: AttendanceChartData;
}

export interface AttendanceReportState {
    isLoading: boolean;
    error: string | null;
    lastUpdated: string | null;
    currentReport: MorningAttendanceReport | EveningAttendanceReport | OrganizationAttendanceReport | null;
    filters: AttendanceReportFilters;
    chartData: AttendanceAnalyticsData | null;
}

export interface AttendanceReportActions {
    fetchMorningReport: () => Promise<void>;
    fetchEveningReport: () => Promise<void>;
    requestReport: (reportType: 'morning' | 'evening') => Promise<void>;
    sendMorningReport: () => Promise<void>;
    sendEveningReport: () => Promise<void>;
    setFilters: (filters: AttendanceReportFilters) => void;
    refreshData: () => Promise<void>;
    exportReport: (format: 'csv' | 'pdf' | 'excel') => Promise<void>;
}
