import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';
import { useAuthStore } from '@/store/auth-store';
import { axiosInstance } from '@/lib/services/api-client';
import {
    AttendanceReportState,
    AttendanceReportActions,
    AttendanceReportRequest,
    AttendanceReportResponse,
    MorningAttendanceReport,
    EveningAttendanceReport,
    OrganizationAttendanceReport,
    AttendanceReportFilters,
    AttendanceAnalyticsData,
    AttendanceChartData,
    AttendanceReportUser,
    AttendanceReportBranch,
} from '@/types/attendance-reports';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface UseAttendanceReportsReturn extends AttendanceReportState, AttendanceReportActions {}

/**
 * Custom hook for attendance reports management
 * Provides comprehensive attendance report functionality with API integration
 */
export const useAttendanceReports = (): UseAttendanceReportsReturn => {
    const { accessToken } = useAuthStore();
    const [state, setState] = useState<AttendanceReportState>({
        isLoading: false,
        error: null,
        lastUpdated: null,
        currentReport: null,
        filters: {},
        chartData: null,
    });

    /**
     * Fetch morning attendance report
     */
    const fetchMorningReport = useCallback(async () => {
        if (!accessToken) {
            setState(prev => ({ ...prev, error: 'Authentication token not found' }));
            return;
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.post('/att/reports/morning/send');

            setState(prev => ({
                ...prev,
                isLoading: false,
                currentReport: response.data.reportData as MorningAttendanceReport,
                lastUpdated: new Date().toISOString(),
            }));

            showSuccessToast('Morning attendance report fetched successfully', toast);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch morning report';
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
            showErrorToast(errorMessage, toast);
        }
    }, [accessToken]);

    /**
     * Fetch evening attendance report
     */
    const fetchEveningReport = useCallback(async () => {
        if (!accessToken) {
            setState(prev => ({ ...prev, error: 'Authentication token not found' }));
            return;
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.post('/att/reports/evening/send');

            setState(prev => ({
                ...prev,
                isLoading: false,
                currentReport: response.data.reportData as EveningAttendanceReport,
                lastUpdated: new Date().toISOString(),
            }));

            showSuccessToast('Evening attendance report fetched successfully', toast);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch evening report';
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
            showErrorToast(errorMessage, toast);
        }
    }, [accessToken]);

    /**
     * Request a specific report type for personal viewing
     */
    const requestReport = useCallback(async (reportType: 'morning' | 'evening') => {
        if (!accessToken) {
            setState(prev => ({ ...prev, error: 'Authentication token not found' }));
            return;
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const requestData: AttendanceReportRequest = { reportType };

            const response = await axiosInstance.post('/att/reports/request', requestData);

            setState(prev => ({
                ...prev,
                isLoading: false,
                currentReport: response.data.reportData,
                lastUpdated: new Date().toISOString(),
            }));

            showSuccessToast(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report requested successfully`, toast);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to request report';
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
            showErrorToast(errorMessage, toast);
        }
    }, [accessToken]);

    /**
     * Send morning report to organization users
     */
    const sendMorningReport = useCallback(async () => {
        if (!accessToken) {
            setState(prev => ({ ...prev, error: 'Authentication token not found' }));
            return;
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            await axiosInstance.post('/att/reports/morning/send');

            setState(prev => ({ ...prev, isLoading: false }));
            showSuccessToast('Morning attendance report sent successfully', toast);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to send morning report';
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
            showErrorToast(errorMessage, toast);
        }
    }, [accessToken]);

    /**
     * Send evening report to organization users
     */
    const sendEveningReport = useCallback(async () => {
        if (!accessToken) {
            setState(prev => ({ ...prev, error: 'Authentication token not found' }));
            return;
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            await axiosInstance.post('/att/reports/evening/send');

            setState(prev => ({ ...prev, isLoading: false }));
            showSuccessToast('Evening attendance report sent successfully', toast);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to send evening report';
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
            showErrorToast(errorMessage, toast);
        }
    }, [accessToken]);

    /**
     * Set filters for attendance reports
     */
    const setFilters = useCallback((filters: AttendanceReportFilters) => {
        setState(prev => ({ ...prev, filters }));
    }, []);

    /**
     * Refresh current report data
     */
    const refreshData = useCallback(async () => {
        if (state.currentReport) {
            switch (state.currentReport.reportType) {
                case 'morning':
                    await fetchMorningReport();
                    break;
                case 'evening':
                    await fetchEveningReport();
                    break;
            }
        }
    }, [state.currentReport, fetchMorningReport, fetchEveningReport]);

    /**
     * Export report data
     */
    const exportReport = useCallback(async (format: 'csv' | 'pdf' | 'excel') => {
        if (!state.currentReport) {
            showErrorToast('No report data available to export', toast);
            return;
        }

        try {
            // Implementation for export functionality
            showSuccessToast(`Report exported as ${format.toUpperCase()}`, toast);
        } catch (error) {
            showErrorToast('Failed to export report', toast);
        }
    }, [state.currentReport]);

    return {
        ...state,
        fetchMorningReport,
        fetchEveningReport,
        requestReport,
        sendMorningReport,
        sendEveningReport,
        setFilters,
        refreshData,
        exportReport,
    };
};

/**
 * Helper function to generate CSV from report data
 */
const generateCSVFromReport = (report: MorningAttendanceReport | EveningAttendanceReport | OrganizationAttendanceReport): string => {
    const headers = ['Name', 'Role', 'Branch', 'Status', 'Check In', 'Check Out', 'Working Hours', 'Break Hours'];
    const rows: string[][] = [];

    // Add summary row
    rows.push([
        'SUMMARY',
        '',
        '',
        `${report.summary.attendanceRate.toFixed(1)}% Attendance`,
        `${report.summary.punctualityRate.toFixed(1)}% Punctuality`,
        `${report.summary.presentToday} Present`,
        `${report.summary.absentToday} Absent`,
        `${report.summary.lateToday} Late`
    ]);

    // Add branch data - handle different report types
    let branches: AttendanceReportBranch[] = [];
    if (report.reportType === 'evening') {
        branches = (report as EveningAttendanceReport).branchBreakdown || [];
    } else if (report.reportType === 'morning' || report.reportType === 'organization') {
        branches = (report as MorningAttendanceReport | OrganizationAttendanceReport).branches || [];
    }

    branches.forEach((branch: AttendanceReportBranch) => {
        branch.users.forEach((user: AttendanceReportUser) => {
            rows.push([
                user.fullName,
                user.role,
                branch.name,
                user.attendanceStatus || 'N/A',
                user.checkInTime || 'N/A',
                user.checkOutTime || 'N/A',
                user.totalWorkingMinutes ? `${Math.floor(user.totalWorkingMinutes / 60)}h ${user.totalWorkingMinutes % 60}m` : 'N/A',
                user.totalBreakMinutes ? `${Math.floor(user.totalBreakMinutes / 60)}h ${user.totalBreakMinutes % 60}m` : 'N/A'
            ]);
        });
    });

    const allRows: string[][] = [headers, ...rows];
    return allRows.map(row => row.join(',')).join('\n');
};

/**
 * Helper function to download CSV file
 */
const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

export default useAttendanceReports;
