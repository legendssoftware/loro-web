'use client';

import { useState, useEffect } from 'react';
import {
    FileText,
    Calendar,
    BarChart2,
    Tag,
    User,
    PackageCheck,
    CreditCard,
} from 'lucide-react';
import { format } from 'date-fns';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClientQuotationReport } from '@/hooks/use-client-quotation-report';
import { Skeleton } from '@/components/ui/skeleton';

// Type definitions for report data
interface StatusDistributionEntry {
    name: string;
    value: number;
    status: string;
}

interface QuotationItem {
    uid: number;
    quotationNumber: string;
    quotationDate: string | Date;
    createdAt: string | Date;
    totalAmount: string | number;
    totalItems: number;
    status: string;
}

interface ProductItem {
    uid: number;
    name: string;
    sku: string;
    price: string | number;
    orderedCount: number;
    imageUrl?: string;
    category?: string;
    description?: string;
}

interface ClientQuotationReportProps {
    clientId: number;
}

export function ClientQuotationReport({
    clientId,
}: ClientQuotationReportProps) {
    const [activeTab, setActiveTab] = useState<string>('overview');

    const { report, isLoading, error, filters, updateFilters, exportAsPdf } =
        useClientQuotationReport(clientId);

    // Log the report data when it's loaded
    useEffect(() => {
        if (report) {
            console.log('Client Quotation Report loaded:', report);
        }
    }, [report]);

    if (isLoading) {
        return <ReportSkeleton />;
    }

    if (error || !report) {
        return (
            <div className="flex flex-col items-center justify-center p-6">
                <h3 className="mb-2 text-lg font-semibold">
                    Unable to load report
                </h3>
                <p className="text-sm text-muted-foreground">
                    {error?.toString() || 'Please try again later'}
                </p>
            </div>
        );
    }

    const handleExportPdf = () => {
        exportAsPdf();
    };

    function getStatusBadgeColor(status: string): string {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-blue-100 text-blue-600 border-blue-200 font-body text-[10px] uppercase font-thin';
            case 'approved':
                return 'bg-green-100 text-green-600 border-green-200 font-body text-[10px] uppercase font-thin';
            case 'rejected':
                return 'bg-red-100 text-red-600 border-red-200 font-body text-[10px] uppercase font-thin';
            case 'completed':
                return 'bg-purple-100 text-purple-600 border-purple-200 font-body text-[10px] uppercase font-thin';
            default:
                return 'bg-gray-100 text-gray-600 border-gray-200 font-body text-[10px] uppercase font-thin';
        }
    }

    const formatCurrency = (value: string | number) => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return numValue.toLocaleString('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            minimumFractionDigits: 2,
        });
    };

    const extractProductCategories = (
        products: ProductItem[] | undefined,
    ): Array<{
        name: string;
        value: number;
        percentage: number;
        products: ProductItem[];
    }> => {
        if (!products || !Array.isArray(products)) return [];

        const categoryMap = products.reduce<
            Record<
                string,
                {
                    name: string;
                    value: number;
                    percentage: number;
                    products: ProductItem[];
                }
            >
        >((acc, product) => {
            const category = product?.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = {
                    name: category,
                    value: 0,
                    percentage: 0,
                    products: [],
                };
            }
            acc[category].value += product.orderedCount || 0;
            acc[category].products.push(product);
            return acc;
        }, {});

        const categoryData = Object.values(categoryMap);
        const total = categoryData.reduce((sum, cat) => sum + cat.value, 0);

        categoryData.forEach((cat) => {
            cat.percentage = total > 0 ? (cat.value / total) * 100 : 0;
        });

        return categoryData.sort((a, b) => b.value - a.value);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-xl font-normal uppercase font-body">
                        Client Quotation Report
                    </h1>
                    <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                        Comprehensive quotation analysis and product insights
                    </p>
                </div>
            </div>

            <div className="flex w-full mb-4 overflow-hidden border-b border-border/10">
                <button
                    className={`px-8 py-3 text-xs font-normal uppercase border-b-2 font-body ${activeTab === 'overview' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`px-8 py-3 text-xs font-normal uppercase border-b-2 font-body ${activeTab === 'quotations' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
                    onClick={() => setActiveTab('quotations')}
                >
                    Quotations
                </button>
                <button
                    className={`px-8 py-3 text-xs font-normal uppercase border-b-2 font-body ${activeTab === 'products' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
                    onClick={() => setActiveTab('products')}
                >
                    Products
                </button>
                <button
                    className={`px-8 py-3 text-xs font-normal uppercase border-b-2 font-body ${activeTab === 'staff' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
                    onClick={() => setActiveTab('staff')}
                >
                    Staff
                </button>
            </div>

            {!report ? (
                <ReportSkeleton />
            ) : (
                <>
                    {activeTab === 'overview' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <Card>
                                    <CardContent className="flex flex-col p-6">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-muted-foreground" />
                                            <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                                                Total Quotations
                                            </p>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-2xl font-normal uppercase font-body">
                                                {report?.summary
                                                    ?.quotationCount || 0}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="flex flex-col p-6">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-muted-foreground" />
                                            <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                                                Total Amount
                                            </p>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-2xl font-normal uppercase font-body">
                                                {formatCurrency(
                                                    report?.summary
                                                        ?.totalAmount || 0,
                                                )}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="flex flex-col p-6">
                                        <div className="flex items-center gap-2">
                                            <PackageCheck className="w-4 h-4 text-muted-foreground" />
                                            <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                                                Conversion Rate
                                            </p>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-2xl font-normal uppercase font-body">
                                                {report?.summary
                                                    ?.conversionRate ||
                                                    report?.metrics?.conversion
                                                        ?.conversionRate ||
                                                    '0.0'}
                                                %
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="flex flex-col p-6">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                                            <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                                                Pending Orders Value
                                            </p>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-2xl font-normal uppercase font-body">
                                                {formatCurrency(
                                                    report?.metrics?.conversion
                                                        ?.pendingValue || 0,
                                                )}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <h3 className="text-sm font-normal uppercase font-body">
                                            Quotation Values
                                        </h3>
                                        <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                            Comparison of quotation amounts
                                        </p>
                                    </CardHeader>
                                    <CardContent className="h-64 p-6 border rounded border-border/80 bg-card">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart
                                                data={
                                                    report.charts
                                                        .quotationValues.data
                                                }
                                                margin={{
                                                    top: 10,
                                                    right: 30,
                                                    left: 0,
                                                    bottom: 20,
                                                }}
                                                barSize={25}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                    opacity={0.1}
                                                />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={{
                                                        stroke: '#e5e7eb',
                                                        strokeWidth: 0.5,
                                                    }}
                                                    tickLine={false}
                                                    tick={(props) => {
                                                        const {
                                                            x,
                                                            y,
                                                            payload,
                                                        } = props;
                                                        return (
                                                            <g
                                                                transform={`translate(${x},${y})`}
                                                            >
                                                                <text
                                                                    dy={16}
                                                                    textAnchor="middle"
                                                                    fill="#888"
                                                                    className="text-[8px] font-body uppercase"
                                                                >
                                                                    {
                                                                        payload.value
                                                                    }
                                                                </text>
                                                            </g>
                                                        );
                                                    }}
                                                    label={{
                                                        value: 'QUOTATIONS',
                                                        position:
                                                            'insideBottom',
                                                        offset: -10,
                                                        className:
                                                            'text-[10px] font-unbounded uppercase font-body',
                                                    }}
                                                />
                                                <YAxis
                                                    axisLine={{
                                                        stroke: '#e5e7eb',
                                                        strokeWidth: 0.5,
                                                    }}
                                                    tickLine={false}
                                                    tick={(props) => {
                                                        const {
                                                            x,
                                                            y,
                                                            payload,
                                                        } = props;
                                                        return (
                                                            <g
                                                                transform={`translate(${x},${y})`}
                                                            >
                                                                <text
                                                                    x={-5}
                                                                    textAnchor="end"
                                                                    fill="#888"
                                                                    className="text-[8px] font-body uppercase"
                                                                >
                                                                    {
                                                                        payload.value
                                                                    }
                                                                </text>
                                                            </g>
                                                        );
                                                    }}
                                                    label={{
                                                        value: 'AMOUNT (R)',
                                                        angle: -90,
                                                        position: 'insideLeft',
                                                        style: {
                                                            textAnchor:
                                                                'middle',
                                                            fontSize: '10px',
                                                            fontFamily:
                                                                'var(--font-unbounded)',
                                                            textTransform:
                                                                'uppercase',
                                                        },
                                                    }}
                                                />
                                                <Tooltip
                                                    cursor={false}
                                                    content={({
                                                        active,
                                                        payload,
                                                    }) => {
                                                        if (
                                                            active &&
                                                            payload &&
                                                            payload.length
                                                        ) {
                                                            const data =
                                                                payload[0]
                                                                    .payload;
                                                            return (
                                                                <div className="p-3 bg-white border rounded shadow-md">
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <FileText className="inline-block w-3 h-3" />
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {data.fullNumber ||
                                                                                `Quotation #${data.name}`}
                                                                        </p>
                                                                    </div>
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                            Amount
                                                                            (R):
                                                                        </p>
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {formatCurrency(
                                                                                data.value,
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                            Items:
                                                                        </p>
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {
                                                                                data.itemCount
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                            Date:
                                                                        </p>
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {format(
                                                                                new Date(
                                                                                    data.date,
                                                                                ),
                                                                                'PP',
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                            Status:
                                                                        </p>
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {data.status.toUpperCase()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Legend
                                                    verticalAlign="top"
                                                    height={36}
                                                    formatter={(value) => (
                                                        <span className="text-[8px] uppercase font-body">
                                                            Quotation Amount
                                                        </span>
                                                    )}
                                                    style={{
                                                        fontSize: '10px',
                                                        fontFamily:
                                                            'var(--font-body)',
                                                        textTransform:
                                                            'uppercase',
                                                    }}
                                                />
                                                <Bar
                                                    dataKey="value"
                                                    name="Amount"
                                                    fill="#3b82f6"
                                                    radius={[4, 4, 4, 4]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <h3 className="text-sm font-normal uppercase font-body">
                                            Status Distribution
                                        </h3>
                                        <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                            Distribution by quotation status
                                        </p>
                                    </CardHeader>
                                    <CardContent className="h-64 p-6 border rounded border-border/80 bg-card">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={
                                                        report.charts
                                                            .statusDistribution
                                                            .data
                                                    }
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    innerRadius={50}
                                                    dataKey="value"
                                                    paddingAngle={1}
                                                    cornerRadius={4}
                                                >
                                                    {report.charts.statusDistribution.data.map(
                                                        (
                                                            entry: StatusDistributionEntry,
                                                        ) => (
                                                            <Cell
                                                                key={
                                                                    entry.status
                                                                }
                                                                fill={
                                                                    report
                                                                        .charts
                                                                        .statusDistribution
                                                                        .config
                                                                        .colors[
                                                                        entry
                                                                            .status
                                                                    ] ||
                                                                    '#9CA3AF'
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </Pie>
                                                <Tooltip
                                                    content={({
                                                        active,
                                                        payload,
                                                    }) => {
                                                        if (
                                                            active &&
                                                            payload &&
                                                            payload.length
                                                        ) {
                                                            const data =
                                                                payload[0]
                                                                    .payload;
                                                            return (
                                                                <div className="p-3 bg-white border rounded shadow-md">
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <Tag className="inline-block w-3 h-3" />
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {
                                                                                data.name
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                            Total
                                                                            Count:{' '}
                                                                        </p>
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {
                                                                                data.value
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    {data.percentage && (
                                                                        <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                            <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                                Percentage:{' '}
                                                                            </p>
                                                                            <p className="text-xs uppercase font-unbounded font-body">
                                                                                {data.percentage?.toFixed(
                                                                                    1,
                                                                                )}
                                                                                %
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Legend
                                                    verticalAlign="bottom"
                                                    height={36}
                                                    formatter={(value) => (
                                                        <span className="text-[8px] uppercase font-body">
                                                            {value}
                                                        </span>
                                                    )}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <h3 className="text-sm font-normal uppercase font-body">
                                            Quotation Timeline
                                        </h3>
                                        <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                            Quotation values over time
                                        </p>
                                    </CardHeader>
                                    <CardContent className="h-64 p-6 border rounded border-border/80 bg-card">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <LineChart
                                                data={
                                                    report.charts.timeline.data
                                                }
                                                margin={{
                                                    top: 10,
                                                    right: 30,
                                                    left: 0,
                                                    bottom: 20,
                                                }}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                    opacity={0.1}
                                                />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={{
                                                        stroke: '#e5e7eb',
                                                        strokeWidth: 0.5,
                                                    }}
                                                    tickLine={false}
                                                    tick={(props) => {
                                                        const {
                                                            x,
                                                            y,
                                                            payload,
                                                        } = props;
                                                        return (
                                                            <g
                                                                transform={`translate(${x},${y})`}
                                                            >
                                                                <text
                                                                    dy={16}
                                                                    textAnchor="middle"
                                                                    fill="#888"
                                                                    className="text-[8px] font-body uppercase"
                                                                >
                                                                    {
                                                                        payload.value
                                                                    }
                                                                </text>
                                                            </g>
                                                        );
                                                    }}
                                                    label={{
                                                        value: 'DATE',
                                                        position:
                                                            'insideBottom',
                                                        offset: -10,
                                                        className:
                                                            'text-[10px] font-unbounded uppercase font-body',
                                                    }}
                                                />
                                                <YAxis
                                                    axisLine={{
                                                        stroke: '#e5e7eb',
                                                        strokeWidth: 0.5,
                                                    }}
                                                    tickLine={false}
                                                    tick={(props) => {
                                                        const {
                                                            x,
                                                            y,
                                                            payload,
                                                        } = props;
                                                        return (
                                                            <g
                                                                transform={`translate(${x},${y})`}
                                                            >
                                                                <text
                                                                    x={-5}
                                                                    textAnchor="end"
                                                                    fill="#888"
                                                                    className="text-[8px] font-body uppercase"
                                                                >
                                                                    {
                                                                        payload.value
                                                                    }
                                                                </text>
                                                            </g>
                                                        );
                                                    }}
                                                    label={{
                                                        value: 'AMOUNT (R)',
                                                        angle: -90,
                                                        position: 'insideLeft',
                                                        style: {
                                                            textAnchor:
                                                                'middle',
                                                            fontSize: '10px',
                                                            fontFamily:
                                                                'var(--font-unbounded)',
                                                            textTransform:
                                                                'uppercase',
                                                        },
                                                    }}
                                                />
                                                <Tooltip
                                                    cursor={false}
                                                    content={({
                                                        active,
                                                        payload,
                                                    }) => {
                                                        if (
                                                            active &&
                                                            payload &&
                                                            payload.length
                                                        ) {
                                                            const data =
                                                                payload[0]
                                                                    .payload;
                                                            return (
                                                                <div className="p-3 bg-white border rounded shadow-md">
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <Calendar className="inline-block w-3 h-3" />
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {
                                                                                data.name
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                            Amount
                                                                            (R):
                                                                        </p>
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {formatCurrency(
                                                                                data.value,
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                            Quotations:
                                                                        </p>
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {
                                                                                data.count
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Legend
                                                    verticalAlign="top"
                                                    height={36}
                                                    formatter={(value) => (
                                                        <span className="text-[8px] uppercase font-body">
                                                            {value}
                                                        </span>
                                                    )}
                                                    style={{
                                                        fontSize: '10px',
                                                        fontFamily:
                                                            'var(--font-body)',
                                                        textTransform:
                                                            'uppercase',
                                                    }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="value"
                                                    name="Amount"
                                                    stroke="#3b82f6"
                                                    strokeWidth={2}
                                                    dot={{
                                                        r: 4,
                                                        fill: '#3b82f6',
                                                        stroke: '#3b82f6',
                                                        strokeWidth: 1,
                                                    }}
                                                    activeDot={{
                                                        r: 6,
                                                        fill: '#3b82f6',
                                                        stroke: '#fff',
                                                        strokeWidth: 2,
                                                    }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <h3 className="text-sm font-normal uppercase font-body">
                                            Conversion Status
                                        </h3>
                                        <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                            Quotation to order conversion rates
                                        </p>
                                    </CardHeader>
                                    <CardContent className="h-64 p-6 border rounded border-border/80 bg-card">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={
                                                        report?.charts
                                                            ?.conversionStatus
                                                            ?.data || []
                                                    }
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    innerRadius={50}
                                                    dataKey="value"
                                                    paddingAngle={1}
                                                    cornerRadius={4}
                                                >
                                                    {report?.charts?.conversionStatus?.data?.map(
                                                        (entry: any) => (
                                                            <Cell
                                                                key={
                                                                    entry?.name ||
                                                                    'unknown'
                                                                }
                                                                fill={
                                                                    entry?.color ||
                                                                    report
                                                                        ?.charts
                                                                        ?.conversionStatus
                                                                        ?.config
                                                                        ?.colors?.[
                                                                        entry
                                                                            ?.name
                                                                    ] ||
                                                                    '#9CA3AF'
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </Pie>
                                                <Tooltip
                                                    content={({
                                                        active,
                                                        payload,
                                                    }) => {
                                                        if (
                                                            active &&
                                                            payload &&
                                                            payload.length
                                                        ) {
                                                            const data =
                                                                payload[0]
                                                                    ?.payload;
                                                            return (
                                                                <div className="p-3 bg-white border rounded shadow-md">
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <CreditCard className="inline-block w-3 h-3" />
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {
                                                                                data?.name
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                            Count:
                                                                        </p>
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {
                                                                                data?.value
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                            Percentage:
                                                                        </p>
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {data?.percentage?.toFixed(
                                                                                1,
                                                                            )}
                                                                            %
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Legend
                                                    verticalAlign="bottom"
                                                    height={36}
                                                    formatter={(value) => (
                                                        <span className="text-[8px] uppercase font-body">
                                                            {value}
                                                        </span>
                                                    )}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {activeTab === 'quotations' && (
                        <div className="space-y-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <h3 className="text-sm font-normal uppercase font-body">
                                        Quotation List
                                    </h3>
                                    <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                        All quotations issued to client
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="px-4 py-2 text-xs font-normal text-left uppercase font-body">
                                                        Number
                                                    </th>
                                                    <th className="px-4 py-2 text-xs font-normal text-left uppercase font-body">
                                                        Date
                                                    </th>
                                                    <th className="px-4 py-2 text-xs font-normal text-left uppercase font-body">
                                                        Amount
                                                    </th>
                                                    <th className="px-4 py-2 text-xs font-normal text-left uppercase font-body">
                                                        Items
                                                    </th>
                                                    <th className="px-4 py-2 text-xs font-normal text-left uppercase font-body">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {report.data.quotations.map(
                                                    (quote: QuotationItem) => (
                                                        <tr
                                                            key={quote.uid}
                                                            className="border-b hover:bg-muted/50"
                                                        >
                                                            <td className="px-4 py-2 text-xs font-body">
                                                                <div className="flex items-center gap-1">
                                                                    <FileText className="w-3 h-3 text-muted-foreground" />
                                                                    {
                                                                        quote.quotationNumber
                                                                    }
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2 text-xs font-body">
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3 text-muted-foreground" />
                                                                    {format(
                                                                        new Date(
                                                                            quote.quotationDate ||
                                                                                quote.createdAt,
                                                                        ),
                                                                        'PP',
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2 text-xs font-body">
                                                                <div className="flex items-center gap-1">
                                                                    <Tag className="w-3 h-3 text-muted-foreground" />
                                                                    {formatCurrency(
                                                                        quote.totalAmount,
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2 text-xs font-body">
                                                                <div className="flex items-center gap-1">
                                                                    <BarChart2 className="w-3 h-3 text-muted-foreground" />
                                                                    {
                                                                        quote.totalItems
                                                                    }
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2 text-xs font-body">
                                                                <Badge
                                                                    className={getStatusBadgeColor(
                                                                        quote.status,
                                                                    )}
                                                                >
                                                                    {
                                                                        quote.status
                                                                    }
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <h3 className="text-sm font-normal uppercase font-body">
                                            Items Per Quotation
                                        </h3>
                                        <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                            Number of items per quotation
                                        </p>
                                    </CardHeader>
                                    <CardContent className="h-64 p-6 border rounded border-border/80 bg-card">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart
                                                data={
                                                    report.charts.itemQuantities
                                                        .data
                                                }
                                                margin={{
                                                    top: 10,
                                                    right: 30,
                                                    left: 0,
                                                    bottom: 20,
                                                }}
                                                barSize={25}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                    opacity={0.1}
                                                />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={{
                                                        stroke: '#e5e7eb',
                                                        strokeWidth: 0.5,
                                                    }}
                                                    tickLine={false}
                                                    tick={(props) => {
                                                        const {
                                                            x,
                                                            y,
                                                            payload,
                                                        } = props;
                                                        return (
                                                            <g
                                                                transform={`translate(${x},${y})`}
                                                            >
                                                                <text
                                                                    dy={16}
                                                                    textAnchor="middle"
                                                                    fill="#888"
                                                                    className="text-[8px] font-body uppercase"
                                                                >
                                                                    {
                                                                        payload.value
                                                                    }
                                                                </text>
                                                            </g>
                                                        );
                                                    }}
                                                    label={{
                                                        value: 'QUOTATIONS',
                                                        position:
                                                            'insideBottom',
                                                        offset: -10,
                                                        className:
                                                            'text-[10px] font-unbounded uppercase font-body',
                                                    }}
                                                />
                                                <YAxis
                                                    axisLine={{
                                                        stroke: '#e5e7eb',
                                                        strokeWidth: 0.5,
                                                    }}
                                                    tickLine={false}
                                                    tick={(props) => {
                                                        const {
                                                            x,
                                                            y,
                                                            payload,
                                                        } = props;
                                                        return (
                                                            <g
                                                                transform={`translate(${x},${y})`}
                                                            >
                                                                <text
                                                                    x={-5}
                                                                    textAnchor="end"
                                                                    fill="#888"
                                                                    className="text-[8px] font-body uppercase"
                                                                >
                                                                    {
                                                                        payload.value
                                                                    }
                                                                </text>
                                                            </g>
                                                        );
                                                    }}
                                                    label={{
                                                        value: 'ITEMS',
                                                        angle: -90,
                                                        position: 'insideLeft',
                                                        style: {
                                                            textAnchor:
                                                                'middle',
                                                            fontSize: '10px',
                                                            fontFamily:
                                                                'var(--font-unbounded)',
                                                            textTransform:
                                                                'uppercase',
                                                        },
                                                    }}
                                                />
                                                <Tooltip
                                                    cursor={false}
                                                    content={({
                                                        active,
                                                        payload,
                                                    }) => {
                                                        if (
                                                            active &&
                                                            payload &&
                                                            payload.length
                                                        ) {
                                                            const data =
                                                                payload[0]
                                                                    .payload;
                                                            return (
                                                                <div className="p-3 bg-white border rounded shadow-md">
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <FileText className="inline-block w-3 h-3" />
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {data.fullNumber ||
                                                                                `Quotation #${data.name}`}
                                                                        </p>
                                                                    </div>
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                            Items:
                                                                        </p>
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {
                                                                                data.quantity
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                            Date:
                                                                        </p>
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {data.date
                                                                                ? format(
                                                                                      new Date(
                                                                                          data.date,
                                                                                      ),
                                                                                      'PP',
                                                                                  )
                                                                                : 'Unknown'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Legend
                                                    verticalAlign="top"
                                                    height={36}
                                                    formatter={(value) => (
                                                        <span className="text-[8px] uppercase font-body">
                                                            Total Items
                                                        </span>
                                                    )}
                                                    style={{
                                                        fontSize: '10px',
                                                        fontFamily:
                                                            'var(--font-body)',
                                                        textTransform:
                                                            'uppercase',
                                                    }}
                                                />
                                                <Bar
                                                    dataKey="quantity"
                                                    name="Total Quantity"
                                                    fill="#3b82f6"
                                                    radius={[4, 4, 4, 4]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <h3 className="text-sm font-normal uppercase font-body">
                                            Monthly Distribution
                                        </h3>
                                        <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                            Quotation distribution by month
                                        </p>
                                    </CardHeader>
                                    <CardContent className="h-64 p-6 border rounded border-border/80 bg-card">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart
                                                data={
                                                    report.charts
                                                        .monthlyDistribution
                                                        .data
                                                }
                                                margin={{
                                                    top: 10,
                                                    right: 30,
                                                    left: 0,
                                                    bottom: 20,
                                                }}
                                                barSize={25}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                    opacity={0.1}
                                                />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={{
                                                        stroke: '#e5e7eb',
                                                        strokeWidth: 0.5,
                                                    }}
                                                    tickLine={false}
                                                    tick={(props) => {
                                                        const {
                                                            x,
                                                            y,
                                                            payload,
                                                        } = props;
                                                        return (
                                                            <g
                                                                transform={`translate(${x},${y})`}
                                                            >
                                                                <text
                                                                    dy={16}
                                                                    textAnchor="middle"
                                                                    fill="#888"
                                                                    className="text-[8px] font-body uppercase"
                                                                >
                                                                    {
                                                                        payload.value
                                                                    }
                                                                </text>
                                                            </g>
                                                        );
                                                    }}
                                                    label={{
                                                        value: 'MONTH',
                                                        position:
                                                            'insideBottom',
                                                        offset: -10,
                                                        className:
                                                            'text-[10px] font-unbounded uppercase font-body',
                                                    }}
                                                />
                                                <YAxis
                                                    axisLine={{
                                                        stroke: '#e5e7eb',
                                                        strokeWidth: 0.5,
                                                    }}
                                                    tickLine={false}
                                                    tick={(props) => {
                                                        const {
                                                            x,
                                                            y,
                                                            payload,
                                                        } = props;
                                                        return (
                                                            <g
                                                                transform={`translate(${x},${y})`}
                                                            >
                                                                <text
                                                                    x={-5}
                                                                    textAnchor="end"
                                                                    fill="#888"
                                                                    className="text-[8px] font-body uppercase"
                                                                >
                                                                    {
                                                                        payload.value
                                                                    }
                                                                </text>
                                                            </g>
                                                        );
                                                    }}
                                                    label={{
                                                        value: 'AMOUNT (R)',
                                                        angle: -90,
                                                        position: 'insideLeft',
                                                        style: {
                                                            textAnchor:
                                                                'middle',
                                                            fontSize: '10px',
                                                            fontFamily:
                                                                'var(--font-unbounded)',
                                                            textTransform:
                                                                'uppercase',
                                                        },
                                                    }}
                                                />
                                                <Tooltip
                                                    cursor={false}
                                                    content={({
                                                        active,
                                                        payload,
                                                    }) => {
                                                        if (
                                                            active &&
                                                            payload &&
                                                            payload.length
                                                        ) {
                                                            const data =
                                                                payload[0]
                                                                    .payload;
                                                            return (
                                                                <div className="p-3 bg-white border rounded shadow-md">
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <Calendar className="inline-block w-3 h-3" />
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {
                                                                                data.name
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                            Amount
                                                                            (R):
                                                                        </p>
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {formatCurrency(
                                                                                data.value,
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                            Count:
                                                                        </p>
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {
                                                                                data.count
                                                                            }{' '}
                                                                            quotations
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Legend
                                                    verticalAlign="top"
                                                    height={36}
                                                    formatter={(value) => (
                                                        <span className="text-[8px] uppercase font-body">
                                                            {value}
                                                        </span>
                                                    )}
                                                    style={{
                                                        fontSize: '10px',
                                                        fontFamily:
                                                            'var(--font-body)',
                                                        textTransform:
                                                            'uppercase',
                                                    }}
                                                />
                                                <Bar
                                                    dataKey="value"
                                                    name="Amount"
                                                    fill="#3b82f6"
                                                    radius={[4, 4, 4, 4]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <h3 className="text-sm font-normal uppercase font-body">
                                            Product Frequency
                                        </h3>
                                        <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                            Most frequently ordered products
                                        </p>
                                    </CardHeader>
                                    <CardContent className="h-64 p-6 border rounded border-border/80 bg-card">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart
                                                data={
                                                    report?.charts?.productFrequency?.data?.slice(
                                                        0,
                                                        10,
                                                    ) || []
                                                }
                                                layout="vertical"
                                                margin={{
                                                    top: 10,
                                                    right: 30,
                                                    left: 0,
                                                    bottom: 20,
                                                }}
                                                barSize={15}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    horizontal={true}
                                                    vertical={false}
                                                    opacity={0.1}
                                                />
                                                <XAxis
                                                    type="number"
                                                    axisLine={{
                                                        stroke: '#e5e7eb',
                                                        strokeWidth: 0.5,
                                                    }}
                                                    tickLine={false}
                                                    tick={(props) => {
                                                        const {
                                                            x,
                                                            y,
                                                            payload,
                                                        } = props;
                                                        return (
                                                            <g
                                                                transform={`translate(${x},${y})`}
                                                            >
                                                                <text
                                                                    dy={16}
                                                                    textAnchor="middle"
                                                                    fill="#888"
                                                                    className="text-[8px] font-body uppercase"
                                                                >
                                                                    {
                                                                        payload?.value
                                                                    }
                                                                </text>
                                                            </g>
                                                        );
                                                    }}
                                                    label={{
                                                        value: 'QUANTITY',
                                                        position:
                                                            'insideBottom',
                                                        offset: -10,
                                                        className:
                                                            'text-[10px] font-unbounded uppercase font-body',
                                                    }}
                                                />
                                                <YAxis
                                                    dataKey="name"
                                                    type="category"
                                                    axisLine={{
                                                        stroke: '#e5e7eb',
                                                        strokeWidth: 0.5,
                                                    }}
                                                    tickLine={false}
                                                    tick={(props) => {
                                                        const {
                                                            x,
                                                            y,
                                                            payload,
                                                        } = props;
                                                        return (
                                                            <g
                                                                transform={`translate(${x},${y})`}
                                                            >
                                                                <text
                                                                    x={-5}
                                                                    textAnchor="end"
                                                                    fill="#888"
                                                                    className="text-[8px] font-body uppercase"
                                                                >
                                                                    {(
                                                                        (payload?.value as string) ||
                                                                        ''
                                                                    ).length >
                                                                    15
                                                                        ? `${((payload?.value as string) || '').substring(0, 12)}...`
                                                                        : payload?.value}
                                                                </text>
                                                            </g>
                                                        );
                                                    }}
                                                    width={120}
                                                    label={{
                                                        value: 'PRODUCTS',
                                                        angle: -90,
                                                        position: 'insideLeft',
                                                        style: {
                                                            textAnchor:
                                                                'middle',
                                                            fontSize: '10px',
                                                            fontFamily:
                                                                'var(--font-unbounded)',
                                                            textTransform:
                                                                'uppercase',
                                                        },
                                                    }}
                                                />
                                                <Tooltip
                                                    cursor={false}
                                                    content={({
                                                        active,
                                                        payload,
                                                    }) => {
                                                        if (
                                                            active &&
                                                            payload &&
                                                            payload.length
                                                        ) {
                                                            const data =
                                                                payload[0]
                                                                    ?.payload;
                                                            return (
                                                                <div className="p-3 bg-white border rounded shadow-md">
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <FileText className="inline-block w-3 h-3" />
                                                                        <p className="text-xs uppercase font-unbounded">
                                                                            {
                                                                                data?.name
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                            SKU:
                                                                        </p>
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {data?.sku ||
                                                                                'N/A'}
                                                                        </p>
                                                                    </div>
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                            Ordered:
                                                                        </p>
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {
                                                                                data?.value
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                            Price:
                                                                        </p>
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {formatCurrency(
                                                                                data?.price ||
                                                                                    0,
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    {data?.category && (
                                                                        <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                            <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                                Category:
                                                                            </p>
                                                                            <p className="text-xs uppercase font-unbounded font-body">
                                                                                {
                                                                                    data?.category
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Legend
                                                    verticalAlign="top"
                                                    height={36}
                                                    formatter={(value) => (
                                                        <span className="text-[8px] uppercase font-body">
                                                            Quantity Ordered
                                                        </span>
                                                    )}
                                                    style={{
                                                        fontSize: '10px',
                                                        fontFamily:
                                                            'var(--font-body)',
                                                        textTransform:
                                                            'uppercase',
                                                    }}
                                                />
                                                <Bar
                                                    dataKey="value"
                                                    name="Quantity Ordered"
                                                    fill="#3b82f6"
                                                    radius={[0, 4, 4, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <h3 className="text-sm font-normal uppercase font-body">
                                            Product Categories
                                        </h3>
                                        <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                            Distribution by product category
                                        </p>
                                    </CardHeader>
                                    <CardContent className="h-64 p-6 border rounded border-border/80 bg-card">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={extractProductCategories(
                                                        report?.metrics
                                                            ?.frequentProducts,
                                                    )}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    innerRadius={50}
                                                    dataKey="value"
                                                    paddingAngle={1}
                                                    cornerRadius={4}
                                                >
                                                    {extractProductCategories(
                                                        report?.metrics
                                                            ?.frequentProducts,
                                                    ).map(
                                                        (
                                                            entry: any,
                                                            index: number,
                                                        ) => {
                                                            // Define a set of fixed colors for categories
                                                            const colors = [
                                                                '#3b82f6', // blue
                                                                '#10b981', // green
                                                                '#f97316', // orange
                                                                '#8b5cf6', // purple
                                                                '#f43f5e', // pink
                                                                '#06b6d4', // cyan
                                                                '#facc15', // yellow
                                                                '#14b8a6', // teal
                                                                '#a855f7', // violet
                                                                '#ec4899', // rose
                                                            ];
                                                            return (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={
                                                                        colors[
                                                                            index %
                                                                                colors.length
                                                                        ]
                                                                    }
                                                                />
                                                            );
                                                        },
                                                    )}
                                                </Pie>
                                                <Tooltip
                                                    content={({
                                                        active,
                                                        payload,
                                                    }) => {
                                                        if (
                                                            active &&
                                                            payload &&
                                                            payload.length
                                                        ) {
                                                            const data =
                                                                payload[0]
                                                                    ?.payload;
                                                            return (
                                                                <div className="p-3 bg-white border rounded shadow-md">
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <Tag className="inline-block w-3 h-3" />
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {
                                                                                data?.name
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                            Count:
                                                                        </p>
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {
                                                                                data?.value
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                            Percentage:
                                                                        </p>
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {data?.percentage?.toFixed(
                                                                                1,
                                                                            )}
                                                                            %
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Legend
                                                    verticalAlign="bottom"
                                                    height={36}
                                                    formatter={(value) => (
                                                        <span className="text-[8px] uppercase font-body">
                                                            {value}
                                                        </span>
                                                    )}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader className="pb-2">
                                    <h3 className="text-sm font-normal uppercase font-body">
                                        Product Details
                                    </h3>
                                    <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                        Detailed breakdown of ordered products
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="px-4 py-2 text-xs font-normal text-left uppercase font-body">
                                                        Product
                                                    </th>
                                                    <th className="px-4 py-2 text-xs font-normal text-left uppercase font-body">
                                                        SKU
                                                    </th>
                                                    <th className="px-4 py-2 text-xs font-normal text-left uppercase font-body">
                                                        Category
                                                    </th>
                                                    <th className="px-4 py-2 text-xs font-normal text-left uppercase font-body">
                                                        Price
                                                    </th>
                                                    <th className="px-4 py-2 text-xs font-normal text-left uppercase font-body">
                                                        Orders
                                                    </th>
                                                    <th className="px-4 py-2 text-xs font-normal text-left uppercase font-body">
                                                        Total Value
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {report?.metrics?.frequentProducts?.map(
                                                    (product: ProductItem) => (
                                                        <tr
                                                            key={product?.uid}
                                                            className="border-b hover:bg-muted/50"
                                                        >
                                                            <td className="px-4 py-2 text-xs font-body">
                                                                <div className="flex items-center gap-2">
                                                                    {product?.imageUrl ? (
                                                                        <div className="flex-shrink-0 w-8 h-8 overflow-hidden rounded">
                                                                            <img
                                                                                src={
                                                                                    product?.imageUrl
                                                                                }
                                                                                alt={
                                                                                    product?.name
                                                                                }
                                                                                className="object-cover w-full h-full"
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <Tag className="w-3 h-3 text-muted-foreground" />
                                                                    )}
                                                                    <div>
                                                                        <p>
                                                                            {
                                                                                product?.name
                                                                            }
                                                                        </p>
                                                                        {product?.description && (
                                                                            <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                                                                                {
                                                                                    product?.description
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2 text-xs font-body">
                                                                <div className="flex items-center gap-1">
                                                                    <FileText className="w-3 h-3 text-muted-foreground" />
                                                                    {
                                                                        product?.sku
                                                                    }
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2 text-xs font-body">
                                                                <div className="flex items-center gap-1">
                                                                    <Tag className="w-3 h-3 text-muted-foreground" />
                                                                    {product?.category ||
                                                                        'Uncategorized'}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2 text-xs font-body">
                                                                <div className="flex items-center gap-1">
                                                                    <Tag className="w-3 h-3 text-muted-foreground" />
                                                                    {formatCurrency(
                                                                        product?.price ||
                                                                            0,
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2 text-xs font-body">
                                                                <div className="flex items-center gap-1">
                                                                    <BarChart2 className="w-3 h-3 text-muted-foreground" />
                                                                    {product?.orderedCount ||
                                                                        0}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2 text-xs font-body">
                                                                <div className="flex items-center gap-1">
                                                                    <Tag className="w-3 h-3 text-muted-foreground" />
                                                                    {formatCurrency(
                                                                        typeof product?.price ===
                                                                            'string'
                                                                            ? parseFloat(
                                                                                  product?.price ||
                                                                                      '0',
                                                                              ) *
                                                                                  (product?.orderedCount ||
                                                                                      0)
                                                                            : (product?.price ||
                                                                                  0) *
                                                                                  (product?.orderedCount ||
                                                                                      0),
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'staff' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <h3 className="text-sm font-normal uppercase font-body">
                                            Creator Distribution
                                        </h3>
                                        <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                            Quotations by staff member
                                        </p>
                                    </CardHeader>
                                    <CardContent className="h-64 p-6 border rounded border-border/80 bg-card">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart
                                                data={
                                                    report?.charts
                                                        ?.creatorDistribution
                                                        ?.data || []
                                                }
                                                margin={{
                                                    top: 10,
                                                    right: 30,
                                                    left: 0,
                                                    bottom: 20,
                                                }}
                                                barSize={25}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                    opacity={0.1}
                                                />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={{
                                                        stroke: '#e5e7eb',
                                                        strokeWidth: 0.5,
                                                    }}
                                                    tickLine={false}
                                                    tick={(props) => {
                                                        const {
                                                            x,
                                                            y,
                                                            payload,
                                                        } = props;
                                                        return (
                                                            <g
                                                                transform={`translate(${x},${y})`}
                                                            >
                                                                <text
                                                                    dy={16}
                                                                    textAnchor="middle"
                                                                    fill="#888"
                                                                    className="text-[8px] font-body uppercase"
                                                                >
                                                                    {
                                                                        payload?.value
                                                                    }
                                                                </text>
                                                            </g>
                                                        );
                                                    }}
                                                    label={{
                                                        value:
                                                            report?.charts
                                                                ?.creatorDistribution
                                                                ?.config
                                                                ?.xAxisLabel ||
                                                            'STAFF MEMBER',
                                                        position:
                                                            'insideBottom',
                                                        offset: -10,
                                                        className:
                                                            'text-[10px] font-unbounded uppercase font-body',
                                                    }}
                                                />
                                                <YAxis
                                                    axisLine={{
                                                        stroke: '#e5e7eb',
                                                        strokeWidth: 0.5,
                                                    }}
                                                    tickLine={false}
                                                    tick={(props) => {
                                                        const {
                                                            x,
                                                            y,
                                                            payload,
                                                        } = props;
                                                        return (
                                                            <g
                                                                transform={`translate(${x},${y})`}
                                                            >
                                                                <text
                                                                    x={-5}
                                                                    textAnchor="end"
                                                                    fill="#888"
                                                                    className="text-[8px] font-body uppercase"
                                                                >
                                                                    {
                                                                        payload?.value
                                                                    }
                                                                </text>
                                                            </g>
                                                        );
                                                    }}
                                                    label={{
                                                        value:
                                                            report?.charts
                                                                ?.creatorDistribution
                                                                ?.config
                                                                ?.yAxisLabel ||
                                                            'QUOTATIONS',
                                                        angle: -90,
                                                        position: 'insideLeft',
                                                        style: {
                                                            textAnchor:
                                                                'middle',
                                                            fontSize: '10px',
                                                            fontFamily:
                                                                'var(--font-unbounded)',
                                                            textTransform:
                                                                'uppercase',
                                                        },
                                                    }}
                                                />
                                                <Tooltip
                                                    cursor={false}
                                                    content={({
                                                        active,
                                                        payload,
                                                    }) => {
                                                        if (
                                                            active &&
                                                            payload &&
                                                            payload.length
                                                        ) {
                                                            const data =
                                                                payload[0]
                                                                    ?.payload;
                                                            return (
                                                                <div className="p-3 bg-white border rounded shadow-md">
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <User className="inline-block w-3 h-3" />
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {
                                                                                data?.name
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                            Value:
                                                                        </p>
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {formatCurrency(
                                                                                data?.value ||
                                                                                    0,
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                            Quotations:
                                                                        </p>
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {data?.value ||
                                                                                0}
                                                                        </p>
                                                                    </div>
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                            Role:
                                                                        </p>
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {data?.role ||
                                                                                'Staff'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Legend
                                                    verticalAlign="top"
                                                    height={36}
                                                    formatter={(value) => (
                                                        <span className="text-[8px] uppercase font-body">
                                                            Quotation Count
                                                        </span>
                                                    )}
                                                    style={{
                                                        fontSize: '10px',
                                                        fontFamily:
                                                            'var(--font-body)',
                                                        textTransform:
                                                            'uppercase',
                                                    }}
                                                />
                                                <Bar
                                                    dataKey="value"
                                                    name="Count"
                                                    fill={
                                                        report?.charts
                                                            ?.creatorDistribution
                                                            ?.config
                                                            ?.barColor ||
                                                        '#a855f7'
                                                    }
                                                    radius={[4, 4, 4, 4]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <h3 className="text-sm font-normal uppercase font-body">
                                            Creator Performance
                                        </h3>
                                        <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                            Quotation value by staff member
                                        </p>
                                    </CardHeader>
                                    <CardContent className="h-64 p-6 border rounded border-border/80 bg-card">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={
                                                        report?.charts?.creatorDistribution?.data?.map(
                                                            (creator: any) => ({
                                                                name: creator.name,
                                                                value: parseFloat(
                                                                    creator.totalAmount ||
                                                                        0,
                                                                ),
                                                                percentage: 100, // Single creator will be 100%
                                                                ...creator,
                                                            }),
                                                        ) || []
                                                    }
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    innerRadius={50}
                                                    dataKey="value"
                                                    paddingAngle={1}
                                                    cornerRadius={4}
                                                >
                                                    {(
                                                        report?.charts?.creatorDistribution?.data?.map(
                                                            (creator: any) => ({
                                                                name: creator.name,
                                                                value: parseFloat(
                                                                    creator.totalAmount ||
                                                                        0,
                                                                ),
                                                                percentage: 100,
                                                                ...creator,
                                                            }),
                                                        ) || []
                                                    ).map(
                                                        (
                                                            entry: any,
                                                            index: number,
                                                        ) => {
                                                            // Define a set of fixed colors
                                                            const colors = [
                                                                '#a855f7', // purple (matching config.barColor)
                                                                '#3b82f6', // blue
                                                                '#10b981', // green
                                                                '#f97316', // orange
                                                                '#f43f5e', // pink
                                                            ];
                                                            return (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={
                                                                        colors[
                                                                            index %
                                                                                colors.length
                                                                        ]
                                                                    }
                                                                />
                                                            );
                                                        },
                                                    )}
                                                </Pie>
                                                <Tooltip
                                                    content={({
                                                        active,
                                                        payload,
                                                    }) => {
                                                        if (
                                                            active &&
                                                            payload &&
                                                            payload.length
                                                        ) {
                                                            const data =
                                                                payload[0]
                                                                    ?.payload;
                                                            return (
                                                                <div className="p-3 bg-white border rounded shadow-md">
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <User className="inline-block w-3 h-3" />
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {
                                                                                data?.name
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                            Value:
                                                                        </p>
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {formatCurrency(
                                                                                data?.value ||
                                                                                    0,
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                            Quotations:
                                                                        </p>
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {data?.value ||
                                                                                0}
                                                                        </p>
                                                                    </div>
                                                                    <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                        <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                            Role:
                                                                        </p>
                                                                        <p className="text-xs uppercase font-unbounded font-body">
                                                                            {data?.role ||
                                                                                'Staff'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Legend
                                                    verticalAlign="bottom"
                                                    height={36}
                                                    formatter={(value) => (
                                                        <span className="text-[8px] uppercase font-body">
                                                            {value}
                                                        </span>
                                                    )}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader className="pb-2">
                                    <h3 className="text-sm font-normal uppercase font-body">
                                        Staff Performance
                                    </h3>
                                    <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                        Detailed breakdown by staff member
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="px-4 py-2 text-xs font-normal text-left uppercase font-body">
                                                        Staff Member
                                                    </th>
                                                    <th className="px-4 py-2 text-xs font-normal text-left uppercase font-body">
                                                        Email
                                                    </th>
                                                    <th className="px-4 py-2 text-xs font-normal text-left uppercase font-body">
                                                        Quotations
                                                    </th>
                                                    <th className="px-4 py-2 text-xs font-normal text-left uppercase font-body">
                                                        Total Value
                                                    </th>
                                                    <th className="px-4 py-2 text-xs font-normal text-left uppercase font-body">
                                                        Avg Per Quote
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {report?.metrics?.byCreator?.map(
                                                    (creator: any) => (
                                                        <tr
                                                            key={creator?.uid}
                                                            className="border-b hover:bg-muted/50"
                                                        >
                                                            <td className="px-4 py-2 text-xs font-body">
                                                                <div className="flex items-center gap-2">
                                                                    {creator?.photoURL ? (
                                                                        <div className="w-6 h-6 overflow-hidden rounded-full">
                                                                            <img
                                                                                src={
                                                                                    creator?.photoURL
                                                                                }
                                                                                alt={
                                                                                    creator?.name
                                                                                }
                                                                                className="object-cover w-full h-full"
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <User className="w-3 h-3 text-muted-foreground" />
                                                                    )}
                                                                    {
                                                                        creator?.name
                                                                    }
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2 text-xs font-body">
                                                                {creator?.email}
                                                            </td>
                                                            <td className="px-4 py-2 text-xs font-body">
                                                                <div className="flex items-center gap-1">
                                                                    <FileText className="w-3 h-3 text-muted-foreground" />
                                                                    {
                                                                        creator?.quotationCount
                                                                    }
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2 text-xs font-body">
                                                                <div className="flex items-center gap-1">
                                                                    <Tag className="w-3 h-3 text-muted-foreground" />
                                                                    {formatCurrency(
                                                                        creator?.totalAmount ||
                                                                            0,
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2 text-xs font-body">
                                                                <div className="flex items-center gap-1">
                                                                    <CreditCard className="w-3 h-3 text-muted-foreground" />
                                                                    {formatCurrency(
                                                                        creator?.averageAmount ||
                                                                            0,
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function ReportSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <Skeleton className="w-48 h-8" />
                    <Skeleton className="w-32 h-4 mt-2" />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Skeleton className="h-9 w-[180px]" />
                    <Skeleton className="h-9 w-[120px]" />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="p-4 pb-2">
                            <Skeleton className="w-32 h-5" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <Skeleton className="w-16 h-8" />
                            <Skeleton className="w-24 h-4 mt-2" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div>
                <Skeleton className="w-64 h-10" />
                <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="w-32 h-6" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="w-full h-80" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="w-32 h-6" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="w-full h-80" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
