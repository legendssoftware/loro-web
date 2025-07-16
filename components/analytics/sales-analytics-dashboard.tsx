'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Sector, RadialBarChart, RadialBar, PolarGrid, PolarRadiusAxis, Label, RadarChart, Radar, PolarAngleAxis } from 'recharts';
import { TrendingUp, DollarSign, Users, ShoppingCart, Target, BarChart3, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReportsQuery, type SalesOverview, type QuotationAnalytics, type RevenueAnalytics, type SalesPerformance, type CustomerAnalytics, type BlankQuotationAnalytics } from '@/hooks/use-reports-query';
import { useBranchQuery } from '@/hooks/use-branch-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { showSuccessToast } from '@/lib/utils/toast-config';
import { useRBAC } from '@/hooks/use-rbac';
import { AccessLevel } from '@/types/auth';
import type { ChartConfig } from '@/components/ui/chart';

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-1))',
  },
  amount: {
    label: 'Revenue Amount',
    color: 'hsl(var(--chart-1))',
  },
  quotations: {
    label: 'Quotations',
    color: 'hsl(var(--chart-2))',
  },
  count: {
    label: 'Count',
    color: 'hsl(var(--chart-4))',
  },
  units: {
    label: 'Units',
    color: 'hsl(var(--chart-5))',
  },
  customers: {
    label: 'Customers',
    color: 'hsl(var(--chart-1))',
  },
  newCustomers: {
    label: 'New Customers',
    color: 'hsl(var(--chart-1))',
  },
  performance: {
    label: 'Performance',
    color: 'hsl(var(--chart-2))',
  },
  target: {
    label: 'Target',
    color: 'hsl(var(--chart-3))',
  },
  achievement: {
    label: 'Achievement',
    color: 'hsl(var(--chart-4))',
  },
  // Status labels
  pending: {
    label: 'Pending',
    color: 'hsl(var(--chart-1))',
  },
  approved: {
    label: 'Approved',
    color: 'hsl(var(--chart-2))',
  },
  rejected: {
    label: 'Rejected',
    color: 'hsl(var(--chart-3))',
  },
  draft: {
    label: 'Draft',
    color: 'hsl(var(--chart-4))',
  },
  completed: {
    label: 'Completed',
    color: 'hsl(var(--chart-1))',
  },
  'in-progress': {
    label: 'In Progress',
    color: 'hsl(var(--chart-2))',
  },
  abandoned: {
    label: 'Abandoned',
    color: 'hsl(var(--chart-3))',
  },
  // Segment labels
  enterprise: {
    label: 'Enterprise',
    color: 'hsl(var(--chart-1))',
  },
  sme: {
    label: 'SME',
    color: 'hsl(var(--chart-2))',
  },
  startup: {
    label: 'Startup',
    color: 'hsl(var(--chart-3))',
  },
  // Scatter plot legend labels
  quotationValue: {
    label: "Quotation Value",
    color: "hsl(var(--primary))",
  },
  conversionRate: {
    label: "Conversion Rate",
    color: "hsl(var(--secondary))",
  },
  correlationData: {
    label: "Value vs Conversion",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

// Chart color function with proper CSS variables
const getChartColor = (index: number) => `hsl(var(--chart-${(index % 5) + 1}))`;

// Helper function to check if chart data is empty (all values are 0)
const isChartDataEmpty = (data: any[], dataKey: string = 'value') => {
  if (!data || data.length === 0) return true;
  return data.every(item => (item[dataKey] || 0) === 0);
};

// Default fallback data for charts when no data is available
const defaultChartData = {
  revenueTimeSeries: [
    { date: '2024-01-01', amount: 0, quotations: 0 },
    { date: '2024-02-01', amount: 0, quotations: 0 },
    { date: '2024-03-01', amount: 0, quotations: 0 },
  ],
  quotationDistribution: [
    { status: 'pending', count: 0, value: 0 },
    { status: 'approved', count: 0, value: 0 },
    { status: 'rejected', count: 0, value: 0 },
    { status: 'draft', count: 0, value: 0 },
  ],
  performanceComparison: [
    { name: 'Product A', revenue: 0, units: 0 },
    { name: 'Product B', revenue: 0, units: 0 },
    { name: 'Product C', revenue: 0, units: 0 },
  ],
  correlationData: [
    { x: 0, y: 0, quotationId: 'Q001' },
    { x: 0, y: 0, quotationId: 'Q002' },
    { x: 0, y: 0, quotationId: 'Q003' },
  ],
  monthlyRevenue: [
    { month: 'Jan', revenue: 0 },
    { month: 'Feb', revenue: 0 },
    { month: 'Mar', revenue: 0 },
    { month: 'Apr', revenue: 0 },
    { month: 'May', revenue: 0 },
  ],
  productBreakdown: [
    { product: 'Product A', revenue: 0, percentage: 0, growth: 0 },
    { product: 'Product B', revenue: 0, percentage: 0, growth: 0 },
    { product: 'Product C', revenue: 0, percentage: 0, growth: 0 },
  ],
  teamPerformance: [
    { name: 'Team Member 1', revenue: 0 },
    { name: 'Team Member 2', revenue: 0 },
    { name: 'Team Member 3', revenue: 0 },
  ],
  targetVsAchievement: [
    { month: 'Jan', target: 0, achievement: 0 },
    { month: 'Feb', target: 0, achievement: 0 },
    { month: 'Mar', target: 0, achievement: 0 },
  ],
  statusDistribution: [
    { name: 'pending', value: 0 },
    { name: 'approved', value: 0 },
    { name: 'rejected', value: 0 },
    { name: 'draft', value: 0 },
  ],
  monthlyTrends: [
    { month: 'Jan', count: 0 },
    { month: 'Feb', count: 0 },
    { month: 'Mar', count: 0 },
    { month: 'Apr', count: 0 },
    { month: 'May', count: 0 },
  ],
  acquisitionTrend: [
    { month: 'Jan', newCustomers: 0 },
    { month: 'Feb', newCustomers: 0 },
    { month: 'Mar', newCustomers: 0 },
    { month: 'Apr', newCustomers: 0 },
    { month: 'May', newCustomers: 0 },
  ],
  customerSegments: [
    { name: 'Enterprise', value: 0 },
    { name: 'SME', value: 0 },
    { name: 'Startup', value: 0 },
  ],
  creationTrend: [
    { month: 'Jan', count: 0 },
    { month: 'Feb', count: 0 },
    { month: 'Mar', count: 0 },
    { month: 'Apr', count: 0 },
    { month: 'May', count: 0 },
  ],
  blankQuotationStatus: [
    { name: 'completed', value: 0 },
    { name: 'in-progress', value: 0 },
    { name: 'abandoned', value: 0 },
  ],
};

// Mock data for when real data is not available
const mockSalesData: SalesOverview = {
  summary: {
    totalRevenue: 245000,
    revenueGrowth: 12.5,
    totalQuotations: 156,
    conversionRate: 65.4,
    averageOrderValue: 1570,
    topPerformingProduct: 'Product A',
  },
  trends: {
    revenue: [
      { date: '2024-01', amount: 45000, quotations: 32 },
      { date: '2024-02', amount: 52000, quotations: 28 },
      { date: '2024-03', amount: 48000, quotations: 35 },
    ],
    quotationsByStatus: [
      { status: 'pending', count: 45, value: 67500 },
      { status: 'approved', count: 32, value: 89600 },
      { status: 'rejected', count: 12, value: 18000 },
    ],
    topProducts: [
      { name: 'Product A', revenue: 85000, units: 54 },
      { name: 'Product B', revenue: 67000, units: 43 },
      { name: 'Product C', revenue: 45000, units: 32 },
    ],
  },
  chartData: {
    revenueTimeSeries: [
      { date: '2024-01-01', amount: 45000, quotations: 32 },
      { date: '2024-01-15', amount: 52000, quotations: 28 },
      { date: '2024-02-01', amount: 48000, quotations: 35 },
      { date: '2024-02-15', amount: 56000, quotations: 31 },
      { date: '2024-03-01', amount: 51000, quotations: 29 },
    ],
    quotationDistribution: [
      { status: 'pending', count: 45, value: 67500 },
      { status: 'approved', count: 32, value: 89600 },
      { status: 'rejected', count: 12, value: 18000 },
      { status: 'draft', count: 8, value: 12000 },
    ],
    performanceComparison: [
      { name: 'Product A', revenue: 85000, units: 54 },
      { name: 'Product B', revenue: 67000, units: 43 },
      { name: 'Product C', revenue: 45000, units: 32 },
      { name: 'Product D', revenue: 38000, units: 25 },
    ],
    cumulativeGrowth: [
      { date: '2024-01', amount: 45000, quotations: 32 },
      { date: '2024-02', amount: 97000, quotations: 60 },
      { date: '2024-03', amount: 145000, quotations: 95 },
    ],
    correlationData: [
      { x: 45000, y: 32, quotationId: 'Q001' },
      { x: 52000, y: 28, quotationId: 'Q002' },
      { x: 48000, y: 35, quotationId: 'Q003' },
      { x: 56000, y: 31, quotationId: 'Q004' },
    ],
  },
};

const mockQuotationData: QuotationAnalytics = {
  summary: {
    totalQuotations: 156,
    blankQuotations: 23,
    conversionRate: 65.4,
    averageValue: 1570,
    averageTimeToConvert: 4.2,
    pipelineValue: 234000,
  },
  statusBreakdown: [
    { status: 'pending', count: 45, value: 67500, percentage: 28.8 },
    { status: 'approved', count: 32, value: 89600, percentage: 20.5 },
    { status: 'rejected', count: 12, value: 18000, percentage: 7.7 },
  ],
  priceListPerformance: [
    { priceList: 'Standard', quotations: 89, conversions: 58, conversionRate: 65.2, revenue: 140000 },
    { priceList: 'Premium', quotations: 45, conversions: 32, conversionRate: 71.1, revenue: 95000 },
  ],
  chartData: {
    statusDistribution: [
      { name: 'pending', value: 45 },
      { name: 'approved', value: 32 },
      { name: 'rejected', value: 12 },
      { name: 'draft', value: 8 },
    ],
    monthlyTrends: [
      { month: 'Jan', count: 32 },
      { month: 'Feb', count: 28 },
      { month: 'Mar', count: 35 },
      { month: 'Apr', count: 31 },
      { month: 'May', count: 30 },
    ],
  },
};

const mockRevenueData: RevenueAnalytics = {
  summary: {
    totalRevenue: 245000,
    revenueGrowth: 12.5,
    monthlyRevenue: 51000,
    topProduct: 'Product A',
    averageOrderValue: 1570,
    revenuePerCustomer: 2850,
    grossMargin: 42.5,
    profitMargin: 18.7,
  },
  timeSeries: [
    { date: '2024-01-01', revenue: 45000, transactions: 32, averageValue: 1406 },
    { date: '2024-01-15', revenue: 52000, transactions: 28, averageValue: 1857 },
    { date: '2024-02-01', revenue: 48000, transactions: 35, averageValue: 1371 },
  ],
  productBreakdown: [
    { product: 'Product A', revenue: 85000, percentage: 34.7, growth: 15.2 },
    { product: 'Product B', revenue: 67000, percentage: 27.3, growth: 8.9 },
    { product: 'Product C', revenue: 45000, percentage: 18.4, growth: 12.1 },
    { product: 'Product D', revenue: 38000, percentage: 15.5, growth: 6.3 },
  ],
  chartData: {
    monthlyRevenue: [
      { month: 'Jan', revenue: 45000 },
      { month: 'Feb', revenue: 52000 },
      { month: 'Mar', revenue: 48000 },
      { month: 'Apr', revenue: 56000 },
      { month: 'May', revenue: 51000 },
    ],
  },
  forecast: {
    nextMonth: 54000,
    nextQuarter: 165000,
    confidence: 78.5,
  },
};

const mockPerformanceData: SalesPerformance = {
  summary: {
    topPerformer: 'John Smith',
    topPerformerRevenue: 89000,
    teamPerformance: 87.5,
    targetAchievement: 92.3,
  },
  teamSummary: {
    totalSalesReps: 8,
    averagePerformance: 87.5,
    topPerformer: 'John Smith',
    teamQuotaAttainment: 92.3,
  },
  individualPerformance: [
    { name: 'John Smith', revenue: 89000, quotations: 45, conversions: 32, conversionRate: 71.1, quotaAttainment: 112.3 },
    { name: 'Sarah Johnson', revenue: 67000, quotations: 38, conversions: 28, conversionRate: 73.7, quotaAttainment: 89.3 },
    { name: 'Mike Davis', revenue: 54000, quotations: 32, conversions: 22, conversionRate: 68.8, quotaAttainment: 81.5 },
  ],
  chartData: {
    teamPerformance: [
      { name: 'John Smith', revenue: 89000 },
      { name: 'Sarah Johnson', revenue: 67000 },
      { name: 'Mike Davis', revenue: 54000 },
      { name: 'Emma Wilson', revenue: 45000 },
    ],
    targetVsAchievement: [
      { month: 'Jan', target: 45000, achievement: 48000 },
      { month: 'Feb', target: 47000, achievement: 52000 },
      { month: 'Mar', target: 50000, achievement: 48000 },
      { month: 'Apr', target: 52000, achievement: 56000 },
    ],
  },
  metrics: {
    averageDealSize: 1570,
    salesVelocity: 12.5,
    winRate: 65.4,
    pipelineValue: 234000,
  },
};

const mockCustomerData: CustomerAnalytics = {
  summary: {
    totalCustomers: 156,
    newCustomers: 23,
    retentionRate: 78.5,
    averageLifetimeValue: 4250,
    averagePurchaseFrequency: 2.4,
  },
  topCustomers: [
    { name: 'ABC Corp', revenue: 45000, orders: 12, lastOrder: new Date('2024-03-15'), firstOrder: new Date('2023-06-01') },
    { name: 'XYZ Ltd', revenue: 38000, orders: 8, lastOrder: new Date('2024-03-10'), firstOrder: new Date('2023-08-15') },
  ],
  segments: [
    { name: 'Enterprise', segment: 'large', customers: 45, revenue: 125000, percentage: 28.8, value: 125000 },
    { name: 'SME', segment: 'medium', customers: 67, revenue: 89000, percentage: 43.0, value: 89000 },
    { name: 'Startup', segment: 'small', customers: 44, revenue: 31000, percentage: 28.2, value: 31000 },
  ],
  chartData: {
    acquisitionTrend: [
      { month: 'Jan', newCustomers: 18 },
      { month: 'Feb', newCustomers: 23 },
      { month: 'Mar', newCustomers: 19 },
      { month: 'Apr', newCustomers: 25 },
      { month: 'May', newCustomers: 21 },
    ],
  },
};

const mockBlankQuotationData: BlankQuotationAnalytics = {
  summary: {
    totalBlankQuotations: 23,
    completionRate: 78.3,
    averageCompletionTime: 4.2,
    conversionRate: 65.2,
    averageResponseTime: 2.1,
    totalRevenue: 36000,
    averageQuotationValue: 1565,
    mostEffectivePriceList: 'Standard',
  },
  priceListComparison: [
    { priceList: 'Standard', quotations: 15, conversions: 12, conversionRate: 80.0, averageValue: 1500, totalRevenue: 18000, totalValue: 22500 },
    { priceList: 'Premium', quotations: 8, conversions: 6, conversionRate: 75.0, averageValue: 2000, totalRevenue: 12000, totalValue: 16000 },
  ],
  conversionFunnel: {
    created: 23,
    viewed: 21,
    responded: 19,
    converted: 15,
    abandoned: 4,
  },
  trends: [
    { date: '2024-01-01', quotations: 8, conversions: 6, revenue: 12000 },
    { date: '2024-02-01', quotations: 6, conversions: 4, revenue: 8000 },
    { date: '2024-03-01', quotations: 9, conversions: 7, revenue: 14000 },
  ],
  chartData: {
    creationTrend: [
      { month: 'Jan', count: 8 },
      { month: 'Feb', count: 6 },
      { month: 'Mar', count: 9 },
      { month: 'Apr', count: 7 },
      { month: 'May', count: 5 },
    ],
    statusDistribution: [
      { name: 'completed', value: 18 },
      { name: 'in-progress', value: 3 },
      { name: 'abandoned', value: 2 },
    ],
  },
};

// Define tab structure
const salesTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'quotations', label: 'Quotations' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'performance', label: 'Performance' },
  { id: 'customers', label: 'Customers' },
  { id: 'blank-quotations', label: 'Blank Quotations' },
];

export function SalesAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedBranch, setSelectedBranch] = useState<number | undefined>(undefined);
  const { branches } = useBranchQuery();
  const { hasRole } = useRBAC();

  // RBAC Check - only admin, owner, manager can see all reports
  const canViewAllReports = hasRole([AccessLevel.ADMIN, AccessLevel.OWNER, AccessLevel.MANAGER]);

  const {
    salesOverview,
    quotationAnalytics,
    revenueAnalytics,
    salesPerformance,
    customerAnalytics,
    blankQuotationAnalytics,
    isLoading,
    refetchAll,
  } = useReportsQuery(selectedBranch);

  // Use actual data from reports service with proper defaults
  const salesData = salesOverview.data || {
    summary: { totalRevenue: 0, revenueGrowth: 0, totalQuotations: 0, conversionRate: 0, averageOrderValue: 0, topPerformingProduct: 'N/A' },
    trends: { revenue: [], quotationsByStatus: [], topProducts: [] },
    chartData: defaultChartData
  };
  const quotationData = quotationAnalytics.data || {
    summary: { totalQuotations: 0, blankQuotations: 0, conversionRate: 0, averageValue: 0, averageTimeToConvert: 0, pipelineValue: 0 },
    statusBreakdown: [],
    priceListPerformance: [],
    chartData: defaultChartData
  };
  const revenueData = revenueAnalytics.data || {
    summary: { totalRevenue: 0, revenueGrowth: 0, monthlyRevenue: 0, topProduct: 'N/A', averageOrderValue: 0, revenuePerCustomer: 0, grossMargin: 0, profitMargin: 0 },
    timeSeries: [],
    productBreakdown: [],
    chartData: { monthlyRevenue: defaultChartData.monthlyRevenue },
    forecast: { nextMonth: 0, nextQuarter: 0, confidence: 0 }
  };
  const performanceData = salesPerformance.data || {
    summary: { topPerformer: 'N/A', topPerformerRevenue: 0, teamPerformance: 0, targetAchievement: 0 },
    teamSummary: { totalSalesReps: 0, averagePerformance: 0, topPerformer: 'N/A', teamQuotaAttainment: 0 },
    individualPerformance: [],
    chartData: defaultChartData,
    metrics: { averageDealSize: 0, salesVelocity: 0, winRate: 0, pipelineValue: 0 }
  };
  const customerData = customerAnalytics.data || {
    summary: { totalCustomers: 0, newCustomers: 0, retentionRate: 0, averageLifetimeValue: 0, averagePurchaseFrequency: 0 },
    topCustomers: [],
    segments: [],
    chartData: defaultChartData
  };
  const blankQuotationData = blankQuotationAnalytics.data || {
    summary: { totalBlankQuotations: 0, completionRate: 0, averageCompletionTime: 0, conversionRate: 0, averageResponseTime: 0, totalRevenue: 0, averageQuotationValue: 0, mostEffectivePriceList: 'N/A' },
    priceListComparison: [],
    conversionFunnel: { created: 0, viewed: 0, responded: 0, converted: 0, abandoned: 0 },
    trends: [],
    chartData: defaultChartData
  };

  // Filter tabs based on user permissions
  const availableTabs = canViewAllReports ? salesTabs : salesTabs.filter(tab => tab.id === 'overview');

  const handleRefresh = () => {
    refetchAll();
    showSuccessToast('Reports refreshed successfully', toast);
  };

  const handleBranchChange = (branchId: string) => {
    setSelectedBranch(branchId === 'all' ? undefined : parseInt(branchId));
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Access control message for restricted users
  if (!canViewAllReports && activeTab !== 'overview') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h3 className="mb-2 text-lg font-semibold">Access Restricted</h3>
          <p className="text-muted-foreground">
            You need admin, owner, or manager privileges to view detailed sales reports.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
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
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col gap-4 justify-between items-start sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sales Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive sales performance metrics and insights
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
          {/* Sales Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {salesData?.summary && (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          R{(salesData?.summary?.totalRevenue || 0)?.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {(salesData?.summary?.revenueGrowth || 0) > 0 ? '+' : ''}
                          {(salesData?.summary?.revenueGrowth || 0)?.toFixed(1)}% from last month
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
                        <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{salesData.summary.totalQuotations || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          {(salesData.summary.conversionRate || 0).toFixed(1)}% conversion rate
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                        <Target className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          R{(salesData.summary.averageOrderValue || 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Per converted quotation
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Top Product</CardTitle>
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{salesData.summary.topPerformingProduct || 'N/A'}</div>
                        <p className="text-xs text-muted-foreground">
                          Best performing product
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts */}
                  {salesData.chartData && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Revenue Trend</CardTitle>
                          <CardDescription>Daily revenue over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                            <AreaChart data={salesData.chartData.revenueTimeSeries || defaultChartData.revenueTimeSeries}>
                              <defs>
                                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
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
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value) => {
                                  const date = new Date(value);
                                  return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  });
                                }}
                              />
                              <YAxis tickLine={false} axisLine={false} />
                              <ChartTooltip
                                cursor={false}
                                content={
                                  <ChartTooltipContent
                                    labelFormatter={(value) => {
                                      return new Date(value).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      });
                                    }}
                                    indicator="dot"
                                  />
                                }
                              />
                              <Area
                                dataKey="amount"
                                type="natural"
                                fill="url(#fillRevenue)"
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
                          <CardTitle>Quotation Distribution</CardTitle>
                          <CardDescription>Quotations by status</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 pb-0">
                          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                            <PieChart>
                              <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                              />
                              <Pie
                                data={salesData.chartData.quotationDistribution || defaultChartData.quotationDistribution}
                                dataKey="count"
                                nameKey="status"
                                innerRadius={60}
                                strokeWidth={5}
                                cornerRadius={8}
                                activeIndex={0}
                                activeShape={({
                                  outerRadius = 0,
                                  ...props
                                }: any) => (
                                  <Sector {...props} outerRadius={outerRadius + 10} />
                                )}
                              >
                                {(salesData.chartData.quotationDistribution || defaultChartData.quotationDistribution).map((entry: any, index: number) => (
                                  <Cell key={`quotation-cell-${entry.status || entry.name}-${index}`} fill={getChartColor(index)} />
                                ))}
                              </Pie>
                              <ChartLegend content={<ChartLegendContent />} />
                            </PieChart>
                          </ChartContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Top Products</CardTitle>
                          <CardDescription>Performance by product</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ChartContainer config={chartConfig}>
                            <BarChart data={salesData.chartData.performanceComparison || defaultChartData.performanceComparison}>
                              <CartesianGrid vertical={false} />
                              <XAxis
                                dataKey="name"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => value.slice(0, 10)}
                              />
                              <YAxis tickLine={false} axisLine={false} />
                              <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dashed" />}
                              />
                              <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={4} />
                              <ChartLegend content={<ChartLegendContent />} />
                            </BarChart>
                          </ChartContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Revenue Correlation</CardTitle>
                          <CardDescription>Revenue vs conversion analysis</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ChartContainer config={chartConfig}>
                            <ScatterChart
                              accessibilityLayer
                              data={salesData.chartData.correlationData || defaultChartData.correlationData}
                              margin={{
                                left: 12,
                                right: 12,
                                top: 12,
                                bottom: 12,
                              }}
                            >
                              <CartesianGrid vertical={false} />
                              <XAxis
                                dataKey="x"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => `$${value.toLocaleString()}`}
                              />
                              <YAxis
                                dataKey="y"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                              />
                              <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="line" />}
                              />
                              <ChartLegend content={<ChartLegendContent />} />
                              <Scatter
                                dataKey="y"
                                fill="var(--color-correlationData)"
                                radius={4}
                                name="Value vs Conversion"
                              />
                            </ScatterChart>
                          </ChartContainer>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Quotation Analytics Tab */}
          {activeTab === 'quotations' && (
            <div className="space-y-4">
              {quotationData?.summary && (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
                        <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{quotationData.summary.totalQuotations || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          {quotationData.summary.blankQuotations || 0} blank quotations
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <Target className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{(quotationData.summary.conversionRate || 0).toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                          From quotations to sales
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Average Value</CardTitle>
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          R{(quotationData.summary.averageValue || 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Per quotation
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card className="flex flex-col">
                      <CardHeader className="items-center pb-0">
                        <CardTitle>Quotation Status Distribution</CardTitle>
                        <CardDescription>Breakdown by status</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 pb-0">
                        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                          <PieChart>
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                              data={quotationData.chartData?.statusDistribution || defaultChartData.statusDistribution}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={60}
                              strokeWidth={5}
                              cornerRadius={8}
                              activeIndex={0}
                              activeShape={({
                                outerRadius = 0,
                                ...props
                              }: any) => (
                                <Sector {...props} outerRadius={outerRadius + 10} />
                              )}
                            >
                              {(quotationData.chartData?.statusDistribution || defaultChartData.statusDistribution).map((entry: any, index: number) => (
                                <Cell key={`status-cell-${entry.name}-${index}`} fill={getChartColor(index)} />
                              ))}
                            </Pie>
                            <ChartLegend content={<ChartLegendContent />} />
                          </PieChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Monthly Quotation Trends</CardTitle>
                        <CardDescription>Quotations created over time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                          <AreaChart data={quotationData.chartData?.monthlyTrends || defaultChartData.monthlyTrends}>
                            <defs>
                              <linearGradient id="fillMonthlyTrends" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                  offset="5%"
                                  stopColor="hsl(var(--chart-2))"
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="hsl(var(--chart-2))"
                                  stopOpacity={0.1}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                              dataKey="month"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <YAxis tickLine={false} axisLine={false} />
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Area
                              dataKey="count"
                              type="natural"
                              fill="url(#fillMonthlyTrends)"
                              stroke="hsl(var(--chart-2))"
                              strokeWidth={2}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                          </AreaChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Revenue Analytics Tab */}
          {activeTab === 'revenue' && (
            <div className="space-y-4">
              {revenueData?.summary && (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          R{(revenueData.summary.totalRevenue || 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {(revenueData.summary.revenueGrowth || 0) > 0 ? '+' : ''}
                          {(revenueData.summary.revenueGrowth || 0).toFixed(1)}% growth
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          R{(revenueData.summary.monthlyRevenue || 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          This month
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Top Product</CardTitle>
                        <BarChart3 className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{revenueData.summary.topProduct || 'N/A'}</div>
                        <p className="text-xs text-muted-foreground">
                          Best performing
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                        <Target className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          R{(revenueData.summary.averageOrderValue || 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Per order
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Revenue Trend</CardTitle>
                        <CardDescription>Monthly revenue over time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                          <AreaChart data={revenueData.chartData?.monthlyRevenue || defaultChartData.monthlyRevenue}>
                            <defs>
                              <linearGradient id="fillMonthlyRevenue" x1="0" y1="0" x2="0" y2="1">
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
                              dataKey="month"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <YAxis tickLine={false} axisLine={false} />
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Area
                              dataKey="revenue"
                              type="natural"
                              fill="url(#fillMonthlyRevenue)"
                              stroke="hsl(var(--chart-1))"
                              strokeWidth={2}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                          </AreaChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Product Performance</CardTitle>
                        <CardDescription>Revenue by product</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                          <AreaChart data={revenueData.productBreakdown || defaultChartData.productBreakdown}>
                            <defs>
                              <linearGradient id="fillProductRevenue" x1="0" y1="0" x2="0" y2="1">
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
                              dataKey="product"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tickFormatter={(value) => value.slice(0, 10)}
                            />
                            <YAxis tickLine={false} axisLine={false} />
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Area
                              dataKey="revenue"
                              type="natural"
                              fill="url(#fillProductRevenue)"
                              stroke="hsl(var(--chart-1))"
                              strokeWidth={2}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                          </AreaChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Product Breakdown</CardTitle>
                      <CardDescription>Revenue distribution by product</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(revenueData.productBreakdown || defaultChartData.productBreakdown).map((entry: any, index: number) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className="flex gap-2 items-center">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getChartColor(index) }}
                              />
                              <span className="text-sm font-medium">{entry.product}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">R{(entry.revenue || 0).toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">{entry.percentage || 0}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
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
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{performanceData.summary.topPerformer || 'N/A'}</div>
                        <p className="text-xs text-muted-foreground">
                          R{(performanceData.summary.topPerformerRevenue || 0).toLocaleString()} revenue
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Team Performance</CardTitle>
                        <Users className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{(performanceData.summary.teamPerformance || 0).toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                          Overall team efficiency
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Target Achievement</CardTitle>
                        <Target className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{(performanceData.summary.targetAchievement || 0).toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                          Of monthly targets
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Sales Team Performance</CardTitle>
                        <CardDescription>Individual performance metrics</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                          {isChartDataEmpty(performanceData.chartData?.teamPerformance || defaultChartData.teamPerformance, 'revenue') ? (
                            <RadialBarChart
                              data={[{
                                name: 'No Performance Data',
                                value: 0,
                              }]}
                              startAngle={90}
                              endAngle={450}
                              innerRadius={80}
                              outerRadius={140}
                            >
                              <PolarGrid
                                gridType="circle"
                                radialLines={false}
                                stroke="none"
                                className="first:fill-muted last:fill-background"
                                polarRadius={[86, 74]}
                              />
                              <RadialBar dataKey="value" background cornerRadius={10} fill="hsl(var(--chart-2))" />
                              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                                <Label
                                  content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                      return (
                                        <text
                                          x={viewBox.cx}
                                          y={viewBox.cy}
                                          textAnchor="middle"
                                          dominantBaseline="middle"
                                        >
                                          <tspan
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            className="text-4xl font-bold fill-foreground"
                                          >
                                            0
                                          </tspan>
                                          <tspan
                                            x={viewBox.cx}
                                            y={(viewBox.cy || 0) + 24}
                                            className="fill-muted-foreground"
                                          >
                                            Revenue
                                          </tspan>
                                        </text>
                                      );
                                    }
                                  }}
                                />
                              </PolarRadiusAxis>
                            </RadialBarChart>
                          ) : (
                            <BarChart data={performanceData.chartData?.teamPerformance || defaultChartData.teamPerformance}>
                              <CartesianGrid vertical={false} />
                              <XAxis
                                dataKey="name"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => value.slice(0, 10)}
                              />
                              <YAxis tickLine={false} axisLine={false} />
                              <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dashed" />}
                              />
                              <Bar dataKey="revenue" fill="hsl(var(--chart-2))" radius={4} />
                              <ChartLegend content={<ChartLegendContent />} />
                            </BarChart>
                          )}
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Target vs Achievement</CardTitle>
                        <CardDescription>Monthly target tracking</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                          <AreaChart data={performanceData.chartData?.targetVsAchievement || defaultChartData.targetVsAchievement}>
                            <defs>
                              <linearGradient id="fillTarget" x1="0" y1="0" x2="0" y2="1">
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
                              <linearGradient id="fillAchievement" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                  offset="5%"
                                  stopColor="hsl(var(--chart-4))"
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="hsl(var(--chart-4))"
                                  stopOpacity={0.1}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                              dataKey="month"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <YAxis tickLine={false} axisLine={false} />
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Area
                              dataKey="target"
                              type="natural"
                              fill="url(#fillTarget)"
                              stroke="hsl(var(--chart-3))"
                              strokeWidth={2}
                            />
                            <Area
                              dataKey="achievement"
                              type="natural"
                              fill="url(#fillAchievement)"
                              stroke="hsl(var(--chart-4))"
                              strokeWidth={2}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                          </AreaChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Performance Radar Chart */}
                  <Card>
                    <CardHeader className="items-center pb-4">
                      <CardTitle>Performance Radar - Multi-dimensional</CardTitle>
                      <CardDescription>
                        Comprehensive performance metrics across different dimensions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-0">
                      <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                        {(() => {
                          // Calculate meaningful radar metrics based on actual data
                          const radarData = [
                            {
                              metric: 'Revenue',
                              current: Math.min((performanceData.summary.topPerformerRevenue || 0) / 1000, 100),
                              target: 100
                            },
                            {
                              metric: 'Team Performance',
                              current: performanceData.summary.teamPerformance || 0,
                              target: 100
                            },
                            {
                              metric: 'Target Achievement',
                              current: performanceData.summary.targetAchievement || 0,
                              target: 100
                            },
                            {
                              metric: 'Sales Velocity',
                              current: Math.min((performanceData.metrics?.salesVelocity || 0) * 5, 100), // Scale to percentage
                              target: 100
                            },
                            {
                              metric: 'Win Rate',
                              current: performanceData.metrics?.winRate || 0,
                              target: 100
                            },
                            {
                              metric: 'Pipeline Value',
                              current: Math.min(((performanceData.metrics?.pipelineValue || 0) / 10000), 100), // Scale to percentage
                              target: 100
                            }
                          ];

                          return (
                            <RadarChart
                              data={radarData}
                              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                            >
                              <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="line" />}
                              />
                              <PolarAngleAxis
                                dataKey="metric"
                                tick={({ x, y, textAnchor, value, index, ...props }) => {
                                  const data = radarData[index];
                                  if (!data) return <text {...props} />;

                                  return (
                                    <text
                                      x={x}
                                      y={index === 0 ? y - 10 : y}
                                      textAnchor={textAnchor}
                                      fontSize={11}
                                      fontWeight={500}
                                      {...props}
                                    >
                                      <tspan>{data.current.toFixed(0)}%</tspan>
                                      <tspan
                                        x={x}
                                        dy={"1rem"}
                                        fontSize={10}
                                        className="fill-muted-foreground"
                                      >
                                        {data.metric}
                                      </tspan>
                                    </text>
                                  );
                                }}
                              />
                              <PolarGrid />
                              <Radar
                                dataKey="current"
                                fill="hsl(var(--chart-2))"
                                fillOpacity={0.6}
                                stroke="hsl(var(--chart-2))"
                                strokeWidth={2}
                              />
                              <ChartLegend content={<ChartLegendContent />} />
                            </RadarChart>
                          );
                        })()}
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              {customerData?.summary && (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{customerData.summary.totalCustomers || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          Active customers
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{customerData.summary.newCustomers || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          This month
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Customer Retention</CardTitle>
                        <Target className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{(customerData.summary.retentionRate || 0).toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                          Retention rate
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card className="flex flex-col">
                      <CardHeader className="items-center pb-0">
                        <CardTitle>Customer Segments</CardTitle>
                        <CardDescription>Customer distribution by segment</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 pb-0">
                        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                          {isChartDataEmpty(customerData.segments || defaultChartData.customerSegments) ? (
                            <RadialBarChart
                              data={[{
                                name: 'No Data',
                                value: 0,
                              }]}
                              startAngle={90}
                              endAngle={450}
                              innerRadius={80}
                              outerRadius={140}
                            >
                              <PolarGrid
                                gridType="circle"
                                radialLines={false}
                                stroke="none"
                                className="first:fill-muted last:fill-background"
                                polarRadius={[86, 74]}
                              />
                              <RadialBar dataKey="value" background cornerRadius={10} fill="hsl(var(--chart-1))" />
                              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                                <Label
                                  content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                      return (
                                        <text
                                          x={viewBox.cx}
                                          y={viewBox.cy}
                                          textAnchor="middle"
                                          dominantBaseline="middle"
                                        >
                                          <tspan
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            className="text-4xl font-bold fill-foreground"
                                          >
                                            0
                                          </tspan>
                                          <tspan
                                            x={viewBox.cx}
                                            y={(viewBox.cy || 0) + 24}
                                            className="fill-muted-foreground"
                                          >
                                            Customers
                                          </tspan>
                                        </text>
                                      );
                                    }
                                  }}
                                />
                              </PolarRadiusAxis>
                            </RadialBarChart>
                          ) : (
                            <PieChart>
                              <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                              />
                              <Pie
                                data={customerData.segments || defaultChartData.customerSegments}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                strokeWidth={5}
                                cornerRadius={8}
                                activeIndex={0}
                                activeShape={({
                                  outerRadius = 0,
                                  ...props
                                }: any) => (
                                  <Sector {...props} outerRadius={outerRadius + 10} />
                                )}
                              >
                                {(customerData.segments || defaultChartData.customerSegments).map((entry: any, index: number) => (
                                  <Cell key={`customer-cell-${entry.name}-${index}`} fill={getChartColor(index)} />
                                ))}
                              </Pie>
                              <ChartLegend content={<ChartLegendContent />} />
                            </PieChart>
                          )}
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Customer Acquisition</CardTitle>
                        <CardDescription>New customers over time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                          <AreaChart data={customerData.chartData?.acquisitionTrend || defaultChartData.acquisitionTrend}>
                            <defs>
                              <linearGradient id="fillAcquisition" x1="0" y1="0" x2="0" y2="1">
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
                              dataKey="month"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <YAxis tickLine={false} axisLine={false} />
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Area
                              dataKey="newCustomers"
                              type="natural"
                              fill="url(#fillAcquisition)"
                              stroke="hsl(var(--chart-1))"
                              strokeWidth={2}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                          </AreaChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Blank Quotations Tab */}
          {activeTab === 'blank-quotations' && (
            <div className="space-y-4">
              {blankQuotationData?.summary && (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Blank Quotations</CardTitle>
                        <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{blankQuotationData.summary.totalBlankQuotations || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          Blank quotations created
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                        <Target className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{(blankQuotationData.summary.completionRate || 0).toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                          Blank to complete
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Average Time</CardTitle>
                        <BarChart3 className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{blankQuotationData.summary.averageCompletionTime || 0}h</div>
                        <p className="text-xs text-muted-foreground">
                          To complete
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Blank Quotation Trends</CardTitle>
                        <CardDescription>Creation trends over time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                          <AreaChart data={blankQuotationData.chartData?.creationTrend || defaultChartData.creationTrend}>
                            <defs>
                              <linearGradient id="fillQuotationTrend" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                  offset="5%"
                                  stopColor="hsl(var(--chart-2))"
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="hsl(var(--chart-2))"
                                  stopOpacity={0.1}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                              dataKey="month"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <YAxis tickLine={false} axisLine={false} />
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Area
                              dataKey="count"
                              type="natural"
                              fill="url(#fillQuotationTrend)"
                              stroke="hsl(var(--chart-2))"
                              strokeWidth={2}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                          </AreaChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col">
                      <CardHeader className="items-center pb-0">
                        <CardTitle>Completion Status</CardTitle>
                        <CardDescription>Status distribution</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 pb-0">
                        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                          {isChartDataEmpty(blankQuotationData.chartData?.statusDistribution || defaultChartData.blankQuotationStatus) ? (
                            <RadialBarChart
                              data={[{
                                name: 'No Data',
                                value: 0,
                              }]}
                              startAngle={90}
                              endAngle={450}
                              innerRadius={80}
                              outerRadius={140}
                            >
                              <PolarGrid
                                gridType="circle"
                                radialLines={false}
                                stroke="none"
                                className="first:fill-muted last:fill-background"
                                polarRadius={[86, 74]}
                              />
                              <RadialBar dataKey="value" background cornerRadius={10} fill="hsl(var(--chart-2))" />
                              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                                <Label
                                  content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                      return (
                                        <text
                                          x={viewBox.cx}
                                          y={viewBox.cy}
                                          textAnchor="middle"
                                          dominantBaseline="middle"
                                        >
                                          <tspan
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            className="text-4xl font-bold fill-foreground"
                                          >
                                            0
                                          </tspan>
                                          <tspan
                                            x={viewBox.cx}
                                            y={(viewBox.cy || 0) + 24}
                                            className="fill-muted-foreground"
                                          >
                                            Status
                                          </tspan>
                                        </text>
                                      );
                                    }
                                  }}
                                />
                              </PolarRadiusAxis>
                            </RadialBarChart>
                          ) : (
                            <PieChart>
                              <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                              />
                              <Pie
                                data={blankQuotationData.chartData?.statusDistribution || defaultChartData.blankQuotationStatus}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                strokeWidth={5}
                                cornerRadius={8}
                                activeIndex={0}
                                activeShape={({
                                  outerRadius = 0,
                                  ...props
                                }: any) => (
                                  <Sector {...props} outerRadius={outerRadius + 10} />
                                )}
                              >
                                {(blankQuotationData.chartData?.statusDistribution || defaultChartData.blankQuotationStatus).map((entry: any, index: number) => (
                                  <Cell key={`blank-cell-${entry.name}-${index}`} fill={getChartColor(index)} />
                                ))}
                              </Pie>
                              <ChartLegend content={<ChartLegendContent />} />
                            </PieChart>
                          )}
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Add a comprehensive performance overview using a radial chart */}
                  <Card className="flex flex-col">
                    <CardHeader className="items-center pb-0">
                      <CardTitle>Completion Rate Overview</CardTitle>
                      <CardDescription>Overall blank quotation completion</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                      <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                        <RadialBarChart
                          data={[{
                            name: 'Completion Rate',
                            value: blankQuotationData.summary.completionRate || 0,
                          }]}
                          startAngle={90}
                          endAngle={450}
                          innerRadius={80}
                          outerRadius={140}
                        >
                          <PolarGrid
                            gridType="circle"
                            radialLines={false}
                            stroke="none"
                            className="first:fill-muted last:fill-background"
                            polarRadius={[86, 74]}
                          />
                          <RadialBar dataKey="value" background cornerRadius={10} fill="hsl(var(--chart-2))" />
                          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                            <Label
                              content={({ viewBox }) => {
                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                  return (
                                    <text
                                      x={viewBox.cx}
                                      y={viewBox.cy}
                                      textAnchor="middle"
                                      dominantBaseline="middle"
                                    >
                                      <tspan
                                        x={viewBox.cx}
                                        y={viewBox.cy}
                                        className="text-4xl font-bold fill-foreground"
                                      >
                                        {((blankQuotationData.summary.completionRate || 0)).toFixed(1)}%
                                      </tspan>
                                      <tspan
                                        x={viewBox.cx}
                                        y={(viewBox.cy || 0) + 24}
                                        className="fill-muted-foreground"
                                      >
                                        Complete
                                      </tspan>
                                    </text>
                                  );
                                }
                              }}
                            />
                          </PolarRadiusAxis>
                          <ChartLegend content={<ChartLegendContent />} />
                        </RadialBarChart>
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
