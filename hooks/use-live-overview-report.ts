'use client';

import { useState, useEffect } from 'react';

interface UseLiveOverviewReportProps {
    organizationId?: number;
    branchId?: number;
}

interface UseLiveOverviewReportReturn {
    report: any;
    isLoading: boolean;
    error: Error | null;
    filters: {
        organizationId: number;
        branchId: number;
    };
    updateFilters: (newFilters: Partial<{ organizationId: number; branchId: number }>) => void;
    refreshData: () => void;
}

export function useLiveOverviewReport({
    organizationId = 1,
    branchId = 1,
}: UseLiveOverviewReportProps = {}): UseLiveOverviewReportReturn {
    const [report, setReport] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [filters, setFilters] = useState({
        organizationId,
        branchId,
    });

    // For this mock implementation, we'll use some dummy data
    // In a real implementation, this would fetch from an API
    const fetchReportData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // This is dummy data matching the structure in the JSON example from the requirements
            const dummyReport = {
                name: "Live Organization Overview",
                type: "live_overview",
                generatedAt: new Date().toISOString(),
                filters: {
                    organisationId: filters.organizationId,
                    branchId: filters.branchId
                },
                generatedBy: {
                    uid: "1"
                },
                metadata: {
                    reportType: "live_overview",
                    organisationId: filters.organizationId,
                    branchId: filters.branchId,
                    generatedAt: new Date().toISOString(),
                    name: "Live Organization Overview"
                },
                summary: {
                    totalEmployees: 18,
                    activeEmployees: Math.floor(Math.random() * 10),
                    attendancePercentage: Math.floor(Math.random() * 100),
                    totalHoursToday: Math.floor(Math.random() * 100),
                    tasksCompletedToday: Math.floor(Math.random() * 20),
                    tasksInProgressCount: Math.floor(Math.random() * 15),
                    leadsGeneratedToday: Math.floor(Math.random() * 5),
                    quotationsToday: Math.floor(Math.random() * 3),
                    revenueToday: Math.floor(Math.random() * 10000),
                    clientInteractionsToday: Math.floor(Math.random() * 8)
                },
                metrics: {
                    workforce: {
                        totalEmployees: 18,
                        activeCount: Math.floor(Math.random() * 10),
                        activeWorkingCount: Math.floor(Math.random() * 8),
                        onBreakCount: Math.floor(Math.random() * 3),
                        attendancePercentage: Math.floor(Math.random() * 100),
                        totalHoursWorked: Math.floor(Math.random() * 100),
                        productivityRate: Math.floor(Math.random() * 100),
                        hourlyData: Array.from({ length: 24 }, (_, i) => ({
                            hour: i.toString().padStart(2, '0'),
                            activeCount: Math.floor(Math.random() * 10),
                            checkIns: Math.floor(Math.random() * 5),
                            checkOuts: Math.floor(Math.random() * 3),
                        })),
                        employeesWithAttendanceToday: [],
                        activeEmployees: []
                    },
                    leads: {
                        newLeadsToday: Math.floor(Math.random() * 5),
                        convertedToday: Math.floor(Math.random() * 2),
                        activeLeadCount: 10,
                        pendingLeadCount: 7,
                        todayConversionRate: Math.floor(Math.random() * 100),
                        overallConversionRate: 9,
                        hourlyData: Array.from({ length: 24 }, (_, i) => ({
                            hour: i.toString().padStart(2, '0'),
                            newLeads: Math.floor(Math.random() * 3),
                            converted: Math.floor(Math.random() * 2),
                        })),
                        topLeadGenerators: [],
                        statusDistribution: {
                            PENDING: 7,
                            APPROVED: 2,
                            REVIEW: 1,
                            DECLINED: 0,
                            CONVERTED: 1,
                            CANCELLED: 0
                        },
                        leadsByCategory: {
                            Uncategorized: 11,
                            "Walk-in": 0,
                            Referral: 0,
                            Website: 0,
                            Phone: 0,
                            Email: 0,
                            "Social Media": 0
                        },
                        allActiveLeads: [],
                        recentLeads: []
                    },
                    sales: {
                        quotationsToday: Math.floor(Math.random() * 3),
                        totalItemsToday: Math.floor(Math.random() * 10),
                        revenueToday: Math.floor(Math.random() * 10000),
                        revenueFormatted: `R ${Math.floor(Math.random() * 10000).toLocaleString('en-ZA')}`,
                        pendingQuotationsCount: 3,
                        pendingRevenue: 3740,
                        pendingRevenueFormatted: "R 3 740,00",
                        averageOrderValue: Math.floor(Math.random() * 2000),
                        dayOverDayGrowth: Math.floor(Math.random() * 20),
                        previousWeekRevenue: Math.floor(Math.random() * 50000),
                        hourlySales: Array.from({ length: 24 }, (_, i) => ({
                            hour: i.toString().padStart(2, '0'),
                            quotations: Math.floor(Math.random() * 2),
                            revenue: Math.floor(Math.random() * 1000),
                        })),
                        topPerformers: [],
                        recentQuotations: [],
                        pendingQuotations: []
                    },
                    clients: {
                        newClientsToday: Math.floor(Math.random() * 3),
                        newClientsLast30Days: Math.floor(Math.random() * 20),
                        interactionsToday: Math.floor(Math.random() * 8),
                        uniqueClientsCount: Math.floor(Math.random() * 30),
                        totalClientCount: Math.floor(Math.random() * 50),
                        activeClientsCount: Math.floor(Math.random() * 30),
                        inactiveClientsCount: Math.floor(Math.random() * 20),
                        clientEngagementRate: Math.floor(Math.random() * 100),
                        clientsByCategory: {},
                        clientsByIndustry: {},
                        clientsByRiskLevel: {},
                        hourlyData: [],
                        topStaff: [],
                        recentClients: [],
                        recentInteractions: []
                    },
                    locations: {
                        employeeLocations: [],
                        branchLocations: [
                            {
                                branchId: 1,
                                branchName: "Denver",
                                address: {
                                    city: "Midrand",
                                    state: "Gauteng",
                                    street: "123 Main St",
                                    suburb: "Halfway House",
                                    country: "South Africa",
                                    postalCode: "8001"
                                },
                                employeeCount: 0
                            }
                        ],
                        checkInLocations: [],
                        locationClusters: [],
                        employeesWithLocation: 0,
                        totalActiveEmployees: 0,
                        locationCoverage: 0
                    }
                }
            };

            setReport(dummyReport);
            setIsLoading(false);
        } catch (err: any) {
            setError(err);
            setIsLoading(false);
        }
    };

    // Fetch data when component mounts or filters change
    useEffect(() => {
        fetchReportData();

        // Set up periodic refresh (every 5 minutes)
        const intervalId = setInterval(fetchReportData, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [filters.organizationId, filters.branchId]);

    // Function to update filters
    const updateFilters = (newFilters: Partial<{ organizationId: number; branchId: number }>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    // Function to manually refresh data
    const refreshData = () => {
        fetchReportData();
    };

    return {
        report,
        isLoading,
        error,
        filters,
        updateFilters,
        refreshData,
    };
}
