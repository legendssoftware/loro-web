'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertCircle,
    Settings,
    BarChart3,
    Download,
    RefreshCw,
} from 'lucide-react';

// Import our attendance report components
import { AttendanceReportsDashboard } from '@/components/attendance/attendance-reports-dashboard';

// Import hooks and types
import { useAttendanceReports } from '@/hooks/use-attendance-reports';

type ReportView = 'dashboard' | 'automation';

export default function AttendanceReportsPage() {
    const [activeView, setActiveView] = useState<ReportView>('dashboard');

    // Use the attendance reports hook
    const {
        isLoading,
        error,
        lastUpdated,
        currentReport,
        sendMorningReport,
        sendEveningReport,
        requestReport,
        refreshData,
        exportReport,
    } = useAttendanceReports();

    // Auto-load initial data
    useEffect(() => {
        // Load default data on page mount
        refreshData();
    }, [refreshData]);

    // Handle view changes and load appropriate data
    const handleViewChange = (view: ReportView) => {
        setActiveView(view);

        switch (view) {
            case 'dashboard':
                // Dashboard aggregates data from all sources
                refreshData();
                break;
            case 'automation':
                // Automation view doesn't need to fetch additional data
                break;
        }
    };

    const renderHeader = () => {
        return (
            <div className="flex flex-col mb-6 space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Attendance Reports</h1>
                        <p className="text-muted-foreground">
                            Comprehensive attendance analytics and automated reporting system
                        </p>
                    </div>

                    <div className="flex gap-2 items-center">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refreshData}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportReport('csv')}
                            disabled={!currentReport || isLoading}
                        >
                            <Download className="mr-2 w-4 h-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {lastUpdated && (
                    <div className="text-sm text-muted-foreground">
                        Last updated: {new Date(lastUpdated).toLocaleString()}
                    </div>
                )}

                {error && (
                    <Alert className="bg-red-50 border-red-200">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <AlertDescription className="text-red-700">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        );
    };

    const renderAutomationControls = () => {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Report Automation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-3">
                                <h4 className="font-semibold">Morning Reports</h4>
                                <p className="text-sm text-muted-foreground">
                                    Send morning attendance reports to organization stakeholders
                                </p>
                                <Button
                                    onClick={sendMorningReport}
                                    disabled={isLoading}
                                    className="w-full"
                                >
                                    Send Morning Report
                                </Button>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-semibold">Evening Reports</h4>
                                <p className="text-sm text-muted-foreground">
                                    Send evening attendance reports with productivity insights
                                </p>
                                <Button
                                    onClick={sendEveningReport}
                                    disabled={isLoading}
                                    className="w-full"
                                >
                                    Send Evening Report
                                </Button>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <h4 className="mb-3 font-semibold">Personal Report Requests</h4>
                            <p className="mb-3 text-sm text-muted-foreground">
                                Request reports for personal viewing without affecting automated distribution
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => requestReport('morning')}
                                    disabled={isLoading}
                                >
                                    Request Morning Report
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => requestReport('evening')}
                                    disabled={isLoading}
                                >
                                    Request Evening Report
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <AttendanceReportsDashboard />;

            case 'automation':
                return renderAutomationControls();

            default:
                return <AttendanceReportsDashboard />;
        }
    };

    return (
        <div className="container py-6 mx-auto space-y-6">
            {renderHeader()}

            <Tabs value={activeView} onValueChange={(value) => handleViewChange(value as ReportView)}>
                <TabsList>
                    <TabsTrigger value="dashboard" className="flex gap-2 items-center">
                        <BarChart3 className="w-4 h-4" />
                        Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="automation" className="flex gap-2 items-center">
                        <Settings className="w-4 h-4" />
                        Automation
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeView} className="space-y-6">
                    {renderContent()}
                </TabsContent>
            </Tabs>
        </div>
    );
}
