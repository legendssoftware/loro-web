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
    status?: string;

    // Daily report GPS data
    dailyReport?: {
        gpsData?: {
            tripSummary?: {
                totalDistanceKm?: number;
            };
        };
    };

    // Enhanced comprehensive metrics from user daily reports
    dailyMetrics?: {
        // Location and Travel Data
        location?: {
            totalLocations?: number;
            totalDistance?: string | number;
            totalDistanceKm?: number;
            trackingData?: {
                averageTimePerLocation?: string;
            };
        };

        // Visits Data (alternative structure)
        visits?: {
            totalVisits?: number;
            totalDistance?: string;
            averageTimePerLocation?: string;
            visitDetails?: Array<{
                location?: string;
                duration?: string;
                timestamp?: string;
            }>;
        };

        // Leads and Sales
        leads?: {
            newLeads?: number;
            newLeadsCount?: number;
            convertedLeads?: number;
            convertedCount?: number;
            conversionRate?: number;
            totalValue?: string;
        };

        // Clients and Interactions
        clients?: {
            totalInteractions?: number;
            newClients?: number;
            clientInteractions?: number;
        };

        // Claims Data
        claims?: {
            count?: number;
            totalClaims?: number;
            totalClaimsValue?: string;
            claimTypes?: string[];
            hasClaims?: boolean;
        };

        // Tasks and Productivity
        tasks?: {
            completed?: number;
            completedCount?: number;
            overdue?: number;
            overdueCount?: number;
            completionRate?: number;
            createdCount?: number;
            dueTomorrowCount?: number;
            priorityBreakdown?: {
                urgent?: number;
                high?: number;
                medium?: number;
                low?: number;
            };
        };

        // Quotations and Revenue
        quotations?: {
            totalRevenue?: string;
            totalRevenueFormatted?: string;
            totalQuotations?: number;
            clientInteractions?: number;
            revenuePerHour?: number;
        };

        // Sales and Revenue (alternative structure)
        sales?: {
            totalRevenue?: string;
            quotations?: number;
            clientInteractions?: number;
            revenuePerHour?: number;
        };

        // Rewards and Gamification
        rewards?: {
            dailyXPEarned?: number;
            currentXP?: number;
            currentLevel?: number;
            currentRank?: string;
            leaderboardPosition?: string | number;
        };

        // Wellness Metrics
        wellness?: {
            stressLevel?: 'low' | 'medium' | 'high';
            wellnessScore?: number;
            breaksTaken?: number;
            workLifeBalance?: {
                score?: number;
                overtimeDays?: number;
                averageHoursPerDay?: number;
            };
            leaveStatus?: {
                type?: string;
                remainingDays?: number;
            };
        };

        // Performance Analytics
        performance?: {
            efficiencyScore?: number;
            productivityRank?: number;
            xpEarned?: number;
            overallScore?: number;
            revenuePerHour?: number;
            improvementAreas?: string[];
        };

        // Targets and Goals
        targets?: {
            salesProgress?: number;
            leadsProgress?: number;
            hoursProgress?: number;
            overallTargetScore?: number;
            hoursTarget?: {
                target?: number;
                current?: number;
            };
            leadsTarget?: {
                target?: number;
                current?: number;
            };
            salesTarget?: {
                targetFormatted?: string;
                formatted?: string;
            };
            callsTarget?: {
                target?: number;
                current?: number;
            };
            targetProgress?: {
                hours?: {
                    progress?: number;
                };
                leads?: {
                    progress?: number;
                };
                sales?: {
                    progress?: number;
                };
                calls?: {
                    progress?: number;
                };
            };
        };

        // Productivity Insights
        productivity?: {
            productivityScore?: number;
            peakProductivityHour?: number;
            averageFocusTime?: string;
            workPatterns?: {
                consistencyScore?: number;
                preferredStartTime?: number;
                preferredEndTime?: number;
            };
        };

        // Weekly Comparison
        weeklyComparison?: {
            trend?: string;
            changes?: {
                hoursWorked?: string;
                leads?: string;
                revenue?: string;
                tasksCompleted?: string;
            };
        };

        // Journal Entries
        journal?: {
            count?: number;
            hasEntries?: boolean;
        };

        // Predictions and Insights
        predictions?: {
            targetAchievementProbability?: number;
            riskFactors?: string[];
        };
    };
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

    // Enhanced comprehensive metrics from user daily reports
    dailyMetrics?: {
        // Visits and Location Data
        visits: {
            totalVisits: number;
            totalDistance: string; // e.g., "15.2 km"
            averageTimePerLocation: string; // e.g., "45 min"
            visitDetails: Array<{
                location: string;
                duration: string;
                timestamp: string;
            }>;
        };

        // Leads and Sales
        leads: {
            newLeads: number;
            convertedLeads: number;
            conversionRate: number;
            totalValue?: string; // Formatted currency value
        };

        // Claims Data
        claims: {
            totalClaims: number;
            totalClaimsValue: string; // Formatted currency
            claimTypes: string[]; // Types of claims made
        };

        // Tasks and Productivity
        tasks: {
            completed: number;
            overdue: number;
            completionRate: number;
            priorityBreakdown: {
                urgent: number;
                high: number;
                medium: number;
                low: number;
            };
        };

        // Sales and Revenue
        sales: {
            totalRevenue: string; // Formatted currency
            quotations: number;
            clientInteractions: number;
            revenuePerHour: number;
        };

        // Targets and Performance
        targets: {
            salesProgress: number; // Percentage
            leadsProgress: number;
            hoursProgress: number;
            overallTargetScore: number;
        };

        // Wellness and Leave
        wellness: {
            stressLevel: 'low' | 'medium' | 'high';
            wellnessScore: number;
            breaksTaken: number;
            leaveStatus?: {
                type: string;
                remainingDays: number;
            };
        };

        // Performance Analytics
        performance: {
            efficiencyScore: number;
            productivityRank: number;
            xpEarned: number;
            currentLevel: number;
            currentRank: string;
        };
    };
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
        uid: number;
        name: string;
        surname: string;
        fullName: string;
        hoursWorked: number;
        achievement: string;
        metric: string;
        // Enhanced performance metrics
        totalScore: number; // Combined score from hours, tasks, leads, sales
        efficiency?: number;
        totalWorkingMinutes?: number;
        tasksCompleted?: number;
        leadsGenerated?: number;
        salesRevenue?: string;
        rank?: number;
        branch?: {
            uid: number;
            name: string;
        };
        role?: string;
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

    // CSV export data for comprehensive reporting
    csvExportData?: {
        filename: string;
        headers: string[];
        data: Array<Record<string, any>>;
    };

    // Comprehensive organizational metrics
    organizationMetrics?: {
        totalVisits: number;
        totalDistance: string;
        totalLeadsGenerated: number;
        totalClaimsMade: number;
        totalClaimsValue: string;
        totalRevenue: string;
        totalTasksCompleted: number;
        averageWellnessScore: number;
        averageEfficiencyScore: number;
        topBranches: Array<{
            name: string;
            score: number;
            employeeCount: number;
        }>;
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
