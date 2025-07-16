'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Users, DollarSign, UserPlus, Award, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHRReportsQuery, type HRAttendanceData, type HREmployeePerformanceData, type HRPayrollData, type HRRecruitmentData } from '@/hooks/use-hr-reports-query';
import { useBranchQuery } from '@/hooks/use-branch-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { showSuccessToast } from '@/lib/utils/toast-config';
import { useRBAC } from '@/hooks/use-rbac';
import { AccessLevel } from '@/types/auth';
import type { ChartConfig } from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils/formatters';

const chartConfig = {
  attendance: {
    label: 'Attendance',
    color: 'hsl(var(--chart-1))',
  },
  rate: {
    label: 'Rate',
    color: 'hsl(var(--chart-1))',
  },
  performance: {
    label: 'Performance',
    color: 'hsl(var(--chart-2))',
  },
  score: {
    label: 'Score',
    color: 'hsl(var(--chart-2))',
  },
  cost: {
    label: 'Cost',
    color: 'hsl(var(--chart-3))',
  },
  salary: {
    label: 'Salary',
    color: 'hsl(var(--chart-3))',
  },
  applications: {
    label: 'Applications',
    color: 'hsl(var(--chart-4))',
  },
  hired: {
    label: 'Hired',
    color: 'hsl(var(--chart-5))',
  },
  count: {
    label: 'Count',
    color: 'hsl(var(--chart-4))',
  },
  value: {
    label: 'Value',
    color: 'hsl(var(--chart-5))',
  },
  // Status labels
  present: {
    label: 'Present',
    color: 'hsl(var(--chart-1))',
  },
  absent: {
    label: 'Absent',
    color: 'hsl(var(--chart-2))',
  },
  late: {
    label: 'Late',
    color: 'hsl(var(--chart-3))',
  },
  onTime: {
    label: 'On Time',
    color: 'hsl(var(--chart-4))',
  },
  excellent: {
    label: 'Excellent',
    color: 'hsl(var(--chart-1))',
  },
  good: {
    label: 'Good',
    color: 'hsl(var(--chart-2))',
  },
  average: {
    label: 'Average',
    color: 'hsl(var(--chart-3))',
  },
  poor: {
    label: 'Poor',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

const getChartColor = (index: number) => `hsl(var(--chart-${(index % 5) + 1}))`;

const isChartDataEmpty = (data: any[], dataKey: string = 'value') => {
  if (!data || data.length === 0) return true;
  return data.every(item => (item[dataKey] || 0) === 0);
};

// Comprehensive default chart data for proper chart rendering
const defaultChartData = {
  // Attendance data
  attendanceOverTime: [
    { period: 'Week 1', rate: 0 },
    { period: 'Week 2', rate: 0 },
    { period: 'Week 3', rate: 0 },
    { period: 'Week 4', rate: 0 },
  ],
  punctualityDistribution: [
    { name: 'On Time', value: 0 },
    { name: 'Late (< 15min)', value: 0 },
    { name: 'Late (> 15min)', value: 0 },
  ],
  departmentBreakdown: [
    { department: 'Sales', rate: 0, total: 0 },
    { department: 'Engineering', rate: 0, total: 0 },
    { department: 'Marketing', rate: 0, total: 0 },
    { department: 'Operations', rate: 0, total: 0 },
  ],
  // Performance data
  performanceDistribution: [
    { range: 'Excellent (4.5-5.0)', count: 0 },
    { range: 'Good (3.5-4.4)', count: 0 },
    { range: 'Average (2.5-3.4)', count: 0 },
    { range: 'Below Average (1.5-2.4)', count: 0 },
  ],
  skillsMatrix: [
    { skill: 'Communication', average: 0, trend: 0 },
    { skill: 'Technical', average: 0, trend: 0 },
    { skill: 'Leadership', average: 0, trend: 0 },
  ],
  performanceTrends: [
    { period: 'Q1', score: 0 },
    { period: 'Q2', score: 0 },
    { period: 'Q3', score: 0 },
    { period: 'Q4', score: 0 },
  ],
  // Payroll data
  payrollTrends: [
    { period: 'Jan', cost: 0 },
    { period: 'Feb', cost: 0 },
    { period: 'Mar', cost: 0 },
    { period: 'Apr', cost: 0 },
    { period: 'May', cost: 0 },
    { period: 'Jun', cost: 0 },
  ],
  salaryBands: [
    { band: 'Junior', employees: 0, avgSalary: 0 },
    { band: 'Mid-Level', employees: 0, avgSalary: 0 },
    { band: 'Senior', employees: 0, avgSalary: 0 },
    { band: 'Management', employees: 0, avgSalary: 0 },
  ],
  benefitsCosts: [
    { benefit: 'Medical Aid', cost: 0 },
    { benefit: 'Retirement Fund', cost: 0 },
    { benefit: 'Life Insurance', cost: 0 },
    { benefit: 'Disability Cover', cost: 0 },
  ],
  // Recruitment data
  hiringTrends: [
    { period: 'Jan', hired: 0, applications: 0 },
    { period: 'Feb', hired: 0, applications: 0 },
    { period: 'Mar', hired: 0, applications: 0 },
    { period: 'Apr', hired: 0, applications: 0 },
    { period: 'May', hired: 0, applications: 0 },
    { period: 'Jun', hired: 0, applications: 0 },
  ],
  sourcingChannels: [
    { channel: 'Job Boards', applications: 0, hired: 0 },
    { channel: 'Referrals', applications: 0, hired: 0 },
    { channel: 'Social Media', applications: 0, hired: 0 },
    { channel: 'Recruiters', applications: 0, hired: 0 },
  ],
  candidatePipeline: [
    { stage: 'Applied', count: 0, conversionRate: 0 },
    { stage: 'Screening', count: 0, conversionRate: 0 },
    { stage: 'Interview', count: 0, conversionRate: 0 },
    { stage: 'Final Review', count: 0, conversionRate: 0 },
    { stage: 'Offer', count: 0, conversionRate: 0 },
  ],
};

interface HRAnalyticsDashboardProps {
  className?: string;
}

export function HRAnalyticsDashboard({ className }: HRAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>('attendance');
  const [selectedBranch, setSelectedBranch] = useState<number | undefined>(undefined);
  const { branches } = useBranchQuery();
  const { hasRole } = useRBAC();

  // RBAC Check - only admin, owner, manager can see all reports
  const canViewAllReports = hasRole([AccessLevel.ADMIN, AccessLevel.OWNER, AccessLevel.MANAGER]);

  const {
    attendanceAnalytics,
    employeePerformanceAnalytics,
    payrollAnalytics,
    recruitmentAnalytics,
    isLoading,
    refetchAll,
  } = useHRReportsQuery(selectedBranch);

  // Use actual data from reports service with proper defaults
  const attendanceData = attendanceAnalytics.data || {
    summary: {
      totalEmployees: 0,
      presentToday: 0,
      attendanceRate: 0,
      averageHoursWorked: 0,
      lateArrivals: 0,
      earlyDepartures: 0,
      punctualityRate: 0,
      totalWorkingMinutes: 0,
      organizationEfficiency: 0
    },
    trends: { dailyAttendance: [], monthlyAttendance: [], punctualityTrends: [] },
    chartData: {
      attendanceOverTime: defaultChartData.attendanceOverTime,
      punctualityDistribution: defaultChartData.punctualityDistribution,
      departmentBreakdown: defaultChartData.departmentBreakdown,
    }
  };

  const performanceData = employeePerformanceAnalytics.data || {
    summary: {
      totalEmployees: 0,
      averagePerformanceScore: 0,
      topPerformers: [],
      improvementNeeded: [],
      targetAchievementRate: 0
    },
    metrics: { productivityScores: [], goalAchievements: [], skillAssessments: [] },
    chartData: {
      performanceDistribution: defaultChartData.performanceDistribution,
      skillsMatrix: defaultChartData.skillsMatrix,
      performanceTrends: defaultChartData.performanceTrends,
    }
  };

  const payrollData = payrollAnalytics.data || {
    summary: {
      totalPayrollCost: 0,
      averageSalary: 0,
      totalBenefitsCost: 0,
      payrollGrowth: 0,
      costPerEmployee: 0
    },
    breakdown: { salaryDistribution: [], benefitsUtilization: [], departmentCosts: [] },
    chartData: {
      payrollTrends: defaultChartData.payrollTrends,
      salaryBands: defaultChartData.salaryBands,
      benefitsCosts: defaultChartData.benefitsCosts,
    }
  };

  const recruitmentData = recruitmentAnalytics.data || {
    summary: {
      totalApplications: 0,
      activePositions: 0,
      averageTimeToHire: 0,
      offerAcceptanceRate: 0,
      recruitmentCost: 0
    },
    pipeline: { candidatesByStage: [], interviewScheduled: 0, offersSent: 0, positionsToFill: 0 },
    chartData: {
      hiringTrends: defaultChartData.hiringTrends,
      sourcingChannels: defaultChartData.sourcingChannels,
      candidatePipeline: defaultChartData.candidatePipeline,
    }
  };

  const availableTabs = [
    { id: 'attendance', label: 'Attendance' },
    { id: 'performance', label: 'Performance' },
    { id: 'payroll', label: 'Payroll' },
    { id: 'recruitment', label: 'Recruitment' },
  ];

  const handleRefresh = () => {
    refetchAll();
    showSuccessToast('HR analytics refreshed successfully', toast);
  };

  const handleBranchChange = (branchId: string) => {
    setSelectedBranch(branchId === 'all' ? undefined : Number(branchId));
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const formatPercentage = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(value)) return '0.0%';
    return `${value.toFixed(1)}%`;
  };

  const formatCurrencyValue = (amount: number | undefined) => {
    if (amount === undefined || amount === null || isNaN(amount)) return 'R0.00';
    return formatCurrency(amount, 'ZAR', 'en-ZA');
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return num.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="w-48 h-8 bg-gray-300 rounded animate-pulse"></div>
          <div className="w-32 h-10 bg-gray-300 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                <div className="w-24 h-4 bg-gray-300 rounded"></div>
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="mb-1 w-20 h-8 bg-gray-300 rounded"></div>
                <div className="w-32 h-3 bg-gray-300 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="w-32 h-5 bg-gray-300 rounded"></div>
                <div className="w-48 h-4 bg-gray-300 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-300 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <div className="flex flex-col gap-4 justify-between items-start sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">HR Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive HR performance metrics and insights
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {canViewAllReports && (
            <Select value={selectedBranch?.toString() || 'all'} onValueChange={handleBranchChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {Array.isArray(branches) && branches.map((branch) => (
                  <SelectItem key={branch.uid} value={branch.uid.toString()}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Custom Tabs with consistent styling */}
      <div className="space-y-4">
        <div className="flex overflow-x-auto items-center px-10 border-b border-border/10">
          {availableTabs?.map((tab) => (
            <div
              key={tab.id}
              className="flex relative gap-1 justify-center items-center mr-8 w-28 cursor-pointer"
            >
              <div
                className={`mb-3 font-body px-0 font-normal cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-primary dark:text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => handleTabChange(tab.id)}
              >
                <span className="text-xs font-thin uppercase font-body">
                  {tab.label}
                </span>
              </div>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-primary" />
              )}
            </div>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              {attendanceData?.summary && (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(attendanceData?.summary?.totalEmployees)}</div>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(attendanceData?.summary?.presentToday)} present today
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatPercentage(attendanceData?.summary?.attendanceRate)}</div>
                        <p className="text-xs text-muted-foreground">
                          Organization efficiency
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Average Hours</CardTitle>
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(attendanceData?.summary?.averageHoursWorked)}h</div>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(attendanceData?.summary?.lateArrivals)} late arrivals
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Punctuality</CardTitle>
                        <Award className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatPercentage(attendanceData?.summary?.punctualityRate)}</div>
                        <p className="text-xs text-muted-foreground">
                          On-time performance
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Attendance Trends</CardTitle>
                        <CardDescription>Attendance rate over time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                          <AreaChart data={attendanceData?.chartData?.attendanceOverTime || defaultChartData.attendanceOverTime}>
                            <defs>
                              <linearGradient id="fillAttendance" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                  offset="5%"
                                  stopColor="hsl(var(--chart-1))"
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="hsl(var(--chart-1))"
                                  stopOpacity={0.1}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                              dataKey="period"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              minTickGap={32}
                            />
                            <YAxis tickLine={false} axisLine={false} />
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Area
                              dataKey="rate"
                              type="natural"
                              fill="url(#fillAttendance)"
                              stroke="hsl(var(--chart-1))"
                              strokeWidth={2}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                          </AreaChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col">
                      <CardHeader className="items-center pb-0">
                        <CardTitle>Punctuality Distribution</CardTitle>
                        <CardDescription>On-time vs late arrivals</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 pb-0">
                        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                          <PieChart>
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                              data={attendanceData?.chartData?.punctualityDistribution || defaultChartData.punctualityDistribution}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={60}
                              strokeWidth={5}
                            >
                              {(attendanceData?.chartData?.punctualityDistribution || defaultChartData.punctualityDistribution).map((entry, index) => (
                                <Cell key={`punctuality-cell-${entry.name}-${index}`} fill={getChartColor(index)} />
                              ))}
                            </Pie>
                            <ChartLegend content={<ChartLegendContent />} />
                          </PieChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Department Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Department Attendance</CardTitle>
                      <CardDescription>Attendance rates by department</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                        <BarChart data={attendanceData?.chartData?.departmentBreakdown || defaultChartData.departmentBreakdown}>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="department"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                          />
                          <YAxis tickLine={false} axisLine={false} />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dashed" />}
                          />
                          <Bar dataKey="rate" fill="hsl(var(--chart-1))" radius={4} />
                          <ChartLegend content={<ChartLegendContent />} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-4">
              {performanceData?.summary && (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        <Award className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{(performanceData?.summary?.averagePerformanceScore || 0).toFixed(1)}/5.0</div>
                        <p className="text-xs text-muted-foreground">
                          Overall performance rating
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Target Achievement</CardTitle>
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatPercentage(performanceData?.summary?.targetAchievementRate)}</div>
                        <p className="text-xs text-muted-foreground">
                          Goals achieved
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
                        <Users className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(performanceData?.summary?.topPerformers?.length)}</div>
                        <p className="text-xs text-muted-foreground">
                          Excellent performers
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(performanceData?.summary?.totalEmployees)}</div>
                        <p className="text-xs text-muted-foreground">
                          In performance review
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Trends</CardTitle>
                        <CardDescription>Performance scores over time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                          <LineChart data={performanceData?.chartData?.performanceTrends || defaultChartData.performanceTrends}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                              dataKey="period"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              minTickGap={32}
                            />
                            <YAxis tickLine={false} axisLine={false} />
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Line
                              dataKey="score"
                              type="natural"
                              stroke="hsl(var(--chart-2))"
                              strokeWidth={2}
                              dot={false}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                          </LineChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col">
                      <CardHeader className="items-center pb-0">
                        <CardTitle>Performance Distribution</CardTitle>
                        <CardDescription>Performance rating breakdown</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 pb-0">
                        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                          <PieChart>
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                              data={performanceData?.chartData?.performanceDistribution || defaultChartData.performanceDistribution}
                              dataKey="count"
                              nameKey="range"
                              innerRadius={60}
                              strokeWidth={5}
                            >
                              {(performanceData?.chartData?.performanceDistribution || defaultChartData.performanceDistribution).map((entry, index) => (
                                <Cell key={`performance-cell-${entry.range}-${index}`} fill={getChartColor(index)} />
                              ))}
                            </Pie>
                            <ChartLegend content={<ChartLegendContent />} />
                          </PieChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Skills Matrix Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Skills Matrix</CardTitle>
                      <CardDescription>Skills assessment across organization</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                        <BarChart data={performanceData?.chartData?.skillsMatrix || defaultChartData.skillsMatrix}>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="skill"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                          />
                          <YAxis tickLine={false} axisLine={false} />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dashed" />}
                          />
                          <Bar dataKey="average" fill="hsl(var(--chart-2))" radius={4} />
                          <ChartLegend content={<ChartLegendContent />} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* Payroll Tab */}
          {activeTab === 'payroll' && (
            <div className="space-y-4">
              {payrollData?.summary && (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrencyValue(payrollData?.summary?.totalPayrollCost)}</div>
                        <p className="text-xs text-muted-foreground">
                          Monthly payroll cost
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
                        <Users className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrencyValue(payrollData?.summary?.averageSalary)}</div>
                        <p className="text-xs text-muted-foreground">
                          Per employee
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Benefits Cost</CardTitle>
                        <Award className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrencyValue(payrollData?.summary?.totalBenefitsCost)}</div>
                        <p className="text-xs text-muted-foreground">
                          Total benefits
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Payroll Growth</CardTitle>
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatPercentage(payrollData?.summary?.payrollGrowth)}</div>
                        <p className="text-xs text-muted-foreground">
                          Year over year
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Payroll Trends</CardTitle>
                        <CardDescription>Payroll costs over time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                          <AreaChart data={payrollData?.chartData?.payrollTrends || defaultChartData.payrollTrends}>
                            <defs>
                              <linearGradient id="fillCost" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                  offset="5%"
                                  stopColor="hsl(var(--chart-3))"
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="hsl(var(--chart-3))"
                                  stopOpacity={0.1}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                              dataKey="period"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              minTickGap={32}
                            />
                            <YAxis tickLine={false} axisLine={false} />
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Area
                              dataKey="cost"
                              type="natural"
                              fill="url(#fillCost)"
                              stroke="hsl(var(--chart-3))"
                              strokeWidth={2}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                          </AreaChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Benefits Breakdown</CardTitle>
                        <CardDescription>Benefits costs by type</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                          <BarChart data={payrollData?.chartData?.benefitsCosts || defaultChartData.benefitsCosts}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                              dataKey="benefit"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                            />
                            <YAxis tickLine={false} axisLine={false} />
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent indicator="dashed" />}
                            />
                            <Bar dataKey="cost" fill="hsl(var(--chart-3))" radius={4} />
                            <ChartLegend content={<ChartLegendContent />} />
                          </BarChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Salary Bands Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Salary Bands</CardTitle>
                      <CardDescription>Employee distribution by salary levels</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                        <BarChart data={payrollData?.chartData?.salaryBands || defaultChartData.salaryBands}>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="band"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                          />
                          <YAxis tickLine={false} axisLine={false} />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dashed" />}
                          />
                          <Bar dataKey="employees" fill="hsl(var(--chart-3))" radius={4} />
                          <ChartLegend content={<ChartLegendContent />} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* Recruitment Tab */}
          {activeTab === 'recruitment' && (
            <div className="space-y-4">
              {recruitmentData?.summary && (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                        <UserPlus className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(recruitmentData?.summary?.totalApplications)}</div>
                        <p className="text-xs text-muted-foreground">
                          Applications received
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
                        <Users className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(recruitmentData?.summary?.activePositions)}</div>
                        <p className="text-xs text-muted-foreground">
                          Open positions
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Time to Hire</CardTitle>
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(recruitmentData?.summary?.averageTimeToHire)} days</div>
                        <p className="text-xs text-muted-foreground">
                          Average hiring time
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
                        <Award className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatPercentage(recruitmentData?.summary?.offerAcceptanceRate)}</div>
                        <p className="text-xs text-muted-foreground">
                          Offer acceptance
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Hiring Trends</CardTitle>
                        <CardDescription>Applications vs hires over time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                          <LineChart data={recruitmentData?.chartData?.hiringTrends || defaultChartData.hiringTrends}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                              dataKey="period"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              minTickGap={32}
                            />
                            <YAxis tickLine={false} axisLine={false} />
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Line
                              dataKey="applications"
                              type="natural"
                              stroke="hsl(var(--chart-4))"
                              strokeWidth={2}
                              dot={false}
                            />
                            <Line
                              dataKey="hired"
                              type="natural"
                              stroke="hsl(var(--chart-5))"
                              strokeWidth={2}
                              dot={false}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                          </LineChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col">
                      <CardHeader className="items-center pb-0">
                        <CardTitle>Candidate Pipeline</CardTitle>
                        <CardDescription>Candidates by stage</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 pb-0">
                        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                          <PieChart>
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                              data={recruitmentData?.chartData?.candidatePipeline || defaultChartData.candidatePipeline}
                              dataKey="count"
                              nameKey="stage"
                              innerRadius={60}
                              strokeWidth={5}
                            >
                              {(recruitmentData?.chartData?.candidatePipeline || defaultChartData.candidatePipeline).map((entry, index) => (
                                <Cell key={`pipeline-cell-${entry.stage}-${index}`} fill={getChartColor(index)} />
                              ))}
                            </Pie>
                            <ChartLegend content={<ChartLegendContent />} />
                          </PieChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sourcing Channels Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Sourcing Channels</CardTitle>
                      <CardDescription>Applications and hires by channel</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                        <BarChart data={recruitmentData?.chartData?.sourcingChannels || defaultChartData.sourcingChannels}>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="channel"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                          />
                          <YAxis tickLine={false} axisLine={false} />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dashed" />}
                          />
                          <Bar dataKey="applications" fill="hsl(var(--chart-4))" radius={4} />
                          <Bar dataKey="hired" fill="hsl(var(--chart-5))" radius={4} />
                          <ChartLegend content={<ChartLegendContent />} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
