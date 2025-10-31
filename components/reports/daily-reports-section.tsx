import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    FileText,
    Download,
    Calendar as CalendarIcon,
    ExternalLink,
    Sunrise,
    Sunset,
    Clock,
    Building,
    User,
    AlertTriangle,
    X,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useOrganizationDailyReports, useUserDailyReports, DailyReportPDF } from '@/hooks/use-daily-reports';

interface DailyReportsSectionProps {
    variant: 'organization' | 'personal';
    className?: string;
}

const getReportTypeIcon = (type: string) => {
    switch (type) {
        case 'MORNING':
            return <Sunrise className="w-4 h-4" />;
        case 'EVENING':
            return <Sunset className="w-4 h-4" />;
        default:
            return <FileText className="w-4 h-4" />;
    }
};

const getReportTypeColor = (type: string) => {
    switch (type) {
        case 'MORNING':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
        case 'EVENING':
            return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
        default:
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
};

const ReportCard: React.FunctionComponent<{ report: DailyReportPDF }> = ({ report }) => {
    const handleOpenReport = () => {
        if (report.reportData?.pdfUrl) {
            window.open(report.reportData.pdfUrl, '_blank', 'noopener,noreferrer');
        }
    };

    const handleDownloadReport = () => {
        if (report.reportData?.pdfUrl) {
            const link = document.createElement('a');
            link.href = report.reportData.pdfUrl;
            link.download = `${report.name.replace(/\s+/g, '_')}_${format(new Date(report.generatedAt), 'yyyy-MM-dd')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const hasPdfUrl = report.reportData?.pdfUrl;

    return (
        <Card className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3 items-start flex-1">
                        <div className={cn(
                            "p-2 rounded-lg",
                            getReportTypeColor(report.reportType)
                        )}>
                            {getReportTypeIcon(report.reportType)}
                        </div>
                        <div className="flex-1">
                            <div className="flex gap-2 items-center mb-1">
                                <h4 className="font-medium text-sm">{report.name}</h4>
                                <Badge className={cn("text-xs", getReportTypeColor(report.reportType))}>
                                    {report.reportType}
                                </Badge>
                            </div>
                            {report.description && (
                                <p className="text-xs text-muted-foreground mb-2">{report.description}</p>
                            )}
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                <div className="flex gap-1 items-center">
                                    <Clock className="w-3 h-3" />
                                    <span>{format(new Date(report.generatedAt), 'PPp')}</span>
                                </div>
                                {report.owner && (
                                    <div className="flex gap-1 items-center">
                                        <User className="w-3 h-3" />
                                        <span>{report.owner.name} {report.owner.surname}</span>
                                    </div>
                                )}
                                {report.branch && (
                                    <div className="flex gap-1 items-center">
                                        <Building className="w-3 h-3" />
                                        <span>{report.branch.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={handleOpenReport}
                        disabled={!hasPdfUrl}
                    >
                        <ExternalLink className="w-4 h-4" />
                        Open Report
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={handleDownloadReport}
                        disabled={!hasPdfUrl}
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </Button>
                </div>

                {!hasPdfUrl && (
                    <div className="flex gap-2 items-center p-2 mt-2 text-xs text-orange-800 bg-orange-50 rounded-lg border border-orange-200">
                        <AlertTriangle className="w-3 h-3" />
                        <span>PDF not yet available</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export const DailyReportsSection: React.FunctionComponent<DailyReportsSectionProps> = ({
    variant,
    className = '',
}) => {
    const [reportTypeFilter, setReportTypeFilter] = useState<'MORNING' | 'EVENING' | 'MAIN' | undefined>(undefined);

    // Fetch reports based on variant
    const organizationQuery = useOrganizationDailyReports(
        variant === 'organization' ? {
            reportType: reportTypeFilter,
            limit: 50,
        } : undefined
    );

    const userQuery = useUserDailyReports(
        variant === 'personal' ? {
            reportType: reportTypeFilter,
            limit: 50,
        } : undefined
    );

    const { data, isLoading, error, refetch } = variant === 'organization' ? organizationQuery : userQuery;

    const handleRefresh = () => {
        refetch();
    };

    const clearFilters = () => {
        setReportTypeFilter(undefined);
    };

    const reports = data?.reports || [];

    // Group reports by date
    const groupedReports = reports.reduce((acc, report) => {
        const date = format(new Date(report.generatedAt), 'yyyy-MM-dd');
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(report);
        return acc;
    }, {} as Record<string, DailyReportPDF[]>);

    const sortedDates = Object.keys(groupedReports).sort((a, b) => b.localeCompare(a));

    return (
        <Card className={cn(className)}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex gap-2 items-center">
                            <FileText className="w-5 h-5" />
                            Daily Reports Archive
                        </CardTitle>
                        <CardDescription>
                            {variant === 'organization' 
                                ? 'Download morning and evening attendance reports for your organization'
                                : 'Download your personal morning and evening attendance reports'
                            }
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        className="gap-2"
                    >
                        <Clock className="w-4 h-4" />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Report Type Filters */}
                <div className="flex flex-wrap gap-3 items-center p-4 mb-6 rounded-lg border bg-muted/50">
                    <div className="flex gap-2 items-center">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Report Type:</span>
                    </div>
                    
                    {/* Report Type Filter Buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant={reportTypeFilter === undefined ? "default" : "outline"}
                            size="sm"
                            onClick={() => setReportTypeFilter(undefined)}
                        >
                            All
                        </Button>
                        <Button
                            variant={reportTypeFilter === 'MORNING' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setReportTypeFilter('MORNING')}
                            className="gap-1"
                        >
                            <Sunrise className="w-3 h-3" />
                            Morning
                        </Button>
                        <Button
                            variant={reportTypeFilter === 'EVENING' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setReportTypeFilter('EVENING')}
                            className="gap-1"
                        >
                            <Sunset className="w-3 h-3" />
                            Evening
                        </Button>
                    </div>

                    {reportTypeFilter && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="gap-1 ml-auto"
                        >
                            <X className="w-4 h-4" />
                            Clear
                        </Button>
                    )}
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }, (_, i) => (
                            <Card key={i}>
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        <Skeleton className="w-full h-6" />
                                        <Skeleton className="w-3/4 h-4" />
                                        <div className="flex gap-2">
                                            <Skeleton className="flex-1 h-10" />
                                            <Skeleton className="flex-1 h-10" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="flex flex-col justify-center items-center p-8 text-center">
                        <AlertTriangle className="mb-3 w-12 h-12 text-red-500" />
                        <p className="mb-2 font-medium">Failed to load reports</p>
                        <p className="mb-4 text-sm text-muted-foreground">
                            {error instanceof Error ? error.message : 'An error occurred'}
                        </p>
                        <Button variant="outline" onClick={handleRefresh}>
                            Try Again
                        </Button>
                    </div>
                )}

                {/* Reports List */}
                {!isLoading && !error && (
                    <>
                        {sortedDates.length === 0 ? (
                            <div className="flex flex-col justify-center items-center p-8 text-center">
                                <FileText className="mb-3 w-12 h-12 text-muted-foreground" />
                                <p className="mb-2 font-medium">No reports found</p>
                                <p className="text-sm text-muted-foreground">
                                    No reports available for the selected date range.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {sortedDates.map((date) => (
                                    <div key={date}>
                                        <div className="flex gap-2 items-center mb-3">
                                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                            <h3 className="font-semibold text-sm">
                                                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                                            </h3>
                                            <Badge variant="outline" className="ml-auto">
                                                {groupedReports[date].length} {groupedReports[date].length === 1 ? 'report' : 'reports'}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {groupedReports[date].map((report) => (
                                                <ReportCard key={report.uid} report={report} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination Info */}
                        {data?.pagination && (
                            <div className="flex justify-between items-center pt-6 mt-6 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Showing {reports.length} of {data.pagination.total} reports
                                </p>
                                {data.pagination.totalPages > 1 && (
                                    <p className="text-sm text-muted-foreground">
                                        Page {data.pagination.page} of {data.pagination.totalPages}
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

