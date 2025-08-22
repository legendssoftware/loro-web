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
    organizationName: string;
    organizationStartTime: string;
    organization: {
        uid: number;
        name: string;
        workingHours: {
            start: string;
            end: string;
        };
    };
    summary: AttendanceSummaryMetrics & {
        totalActualHours: number;
        totalExpectedHours: number;
        productivityRate: number;
        hoursDeficit: number;
    };
    comparisons: AttendanceComparisons;
    punctuality: {
        earlyArrivals: AttendanceReportUser[];
        onTimeArrivals: AttendanceReportUser[];
        lateArrivals: AttendanceReportUser[];
        veryLateArrivals: AttendanceReportUser[];
        earlyPercentage: number;
        onTimePercentage: number;
        latePercentage: number;
        veryLatePercentage: number;
        averageLateMinutes: number;
        totalLateMinutes: number;
        byBranch: Array<{
            branchId: number;
            branchName: string;
            earlyArrivals: AttendanceReportUser[];
            onTimeArrivals: AttendanceReportUser[];
            lateArrivals: AttendanceReportUser[];
            veryLateArrivals: AttendanceReportUser[];
            earlyPercentage: number;
            onTimePercentage: number;
            latePercentage: number;
            veryLatePercentage: number;
            averageLateMinutes: number;
            totalLateMinutes: number;
            totalEmployees: number;
        }>;
    };
    presentEmployees: AttendanceReportUser[];
    absentEmployees: AttendanceReportUser[];
    currentlyWorkingEmployees: AttendanceReportUser[];
    completedShiftEmployees: AttendanceReportUser[];
    overtimeEmployees: AttendanceReportUser[];
    branchBreakdown: AttendanceReportBranch[];
    targetPerformance: {
        expectedDailyHours: number;
        actualHoursToDate: number;
        projectedEndOfDayHours: number;
        onTrackToMeetTargets: boolean;
        targetAchievementRate: number;
        hoursGapAnalysis: string;
    };
    branches: AttendanceReportBranch[];
    insights: AttendanceInsights;
    recommendations: AttendanceRecommendations;
    alerts: {
        critical: string[];
        warning: string[];
        info: string[];
    };
    hasEmployees: boolean;
    latenessSummary: {
        totalLateEmployees: number;
        totalLateMinutes: number;
        averageLateMinutes: number;
        worstLateArrival?: {
            employee: string;
            minutes: number;
        };
    };
    dashboardUrl: string;
    socialLinks?: any;
    enhancedAnalytics: {
        performance: any;
        productivity: any;
        wellness: any;
    };
}

export interface EmployeeMetric {
    uid: number;
    name: string;
    surname: string;
    email: string;
    role: string;
    branch?: {
        uid: number;
        name: string;
    };
    checkInTime?: string;
    checkOutTime?: string;
    hoursWorked: number;
    isLate: boolean;
    lateMinutes: number;
    status: 'Absent' | 'Late' | 'On Time' | 'Completed' | 'Currently Working';
    yesterdayComparison: {
        hoursChange: number;
        punctualityChange: string;
    };
    avatar?: string;
}

export interface EveningAttendanceReport {
    reportDate: string;
    generatedAt: string;
    reportType: 'evening';
    organizationName: string;
    organizationStartTime: string;
    organizationCloseTime: string;
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
    // Individual Performance Summary data
    employeeMetrics: EmployeeMetric[];
    presentEmployees: AttendanceReportUser[];
    absentEmployees: AttendanceReportUser[];
    currentlyWorkingEmployees: AttendanceReportUser[];
    completedShiftEmployees: AttendanceReportUser[];
    overtimeEmployees: AttendanceReportUser[];
    branchBreakdown: AttendanceReportBranch[];
    targetPerformance: {
        expectedDailyHours: number;
        actualTotalHours: number;
        targetAchievementRate: number;
        hoursOverTarget: number;
        hoursUnderTarget: number;
        teamEfficiencyRating: string;
        individualTargetsMet: number;
        individualTargetsMissed: number;
    };
    insights: AttendanceInsights;
    recommendations: AttendanceRecommendations;
    nextDayPlanning: {
        expectedAttendance: number;
        plannedTasks: number;
        resourceAllocation: string[];
    };
    // Additional fields for comprehensive reporting
    hasEmployees: boolean;
    latenessSummary: {
        totalLateEmployees: number;
        totalLateMinutes: number;
        averageLateMinutes: number;
        punctualityTrend: string;
    };
    totalEmployees: number;
    workedTodayCount: number;
    totalHoursWorked: number;
    averageHoursWorked: number;
    attendanceChange: number;
    hoursChange: number;
    punctualityChange: number;
    performanceTrend: string;
    attendanceRate: number;
    yesterdayAttendanceRate: number;
    punctualityRate: number;
    overallPerformance: {
        description: string;
    };
    topPerformers?: Array<{
        name: string;
        surname: string;
        hoursWorked: number;
        achievement: string;
        metric: string;
    }>;
    improvementAreas?: Array<{
        area: string;
        description: string;
        count: number;
    }>;
    tomorrowActions: string[];
    dashboardUrl: string;
    socialLinks?: any;
    enhancedAnalytics: {
        performance: any;
        productivity: any;
        wellness: any;
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
