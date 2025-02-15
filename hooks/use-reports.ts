import { useState, useCallback, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { ReportPeriod, ReportType, ReportResponse } from '@/lib/types/reports';
import { api } from '@/lib/api';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/store/use-session-store';
import axios from 'axios';

interface UseReportsReturn {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  period: ReportPeriod;
  setPeriod: (period: ReportPeriod) => void;
  reportType: ReportType;
  setReportType: (type: ReportType) => void;
  data: ReportResponse | null;
  isGenerating: boolean;
  error: Error | null;
  handleGenerateReport: () => Promise<void>;
  fetchDailyReport: () => Promise<void>;
}

export const useReports = (): UseReportsReturn => {
  const router = useRouter();
  const { accessToken, clearSession } = useSessionStore();
  const [dateRange, setDateRange] = useState<DateRange>(() => ({
    from: startOfDay(subDays(new Date(), 7)),
    to: endOfDay(new Date())
  }));
  const [period, setPeriod] = useState<ReportPeriod>('daily');
  const [reportType, setReportType] = useState<ReportType>('quotation');
  const [data, setData] = useState<ReportResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleAuthError = useCallback(() => {
    clearSession();
    router.push('/auth/signin');
  }, [clearSession, router]);

  const fetchDailyReport = useCallback(async () => {
    if (!accessToken) {
      handleAuthError();
      return;
    }

    try {
      const response = await api.get<ReportResponse>('/reports/daily-report', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setData(response.data);
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        handleAuthError();
      } else {
        setError(err instanceof Error ? err : new Error('Failed to fetch daily report'));
      }
      setData(null);
    }
  }, [accessToken, handleAuthError]);

  const handleGenerateReport = async () => {
    if (!accessToken) {
      handleAuthError();
      return;
    }

    if (!dateRange?.from || !dateRange?.to) {
      setError(new Error('Please select a date range'));
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await api.post<ReportResponse>('/reports/generate', {
        startDate: startOfDay(dateRange.from).toISOString(),
        endDate: endOfDay(dateRange.to).toISOString(),
        period: period,
        type: reportType,
        visualization: {
          format: 'json',
          charts: {
            quotations: {
              type: 'area',
              metrics: ['total', 'accepted', 'pending']
            },
            tasks: {
              type: 'bar',
              metrics: ['completed', 'pending']
            },
            revenue: {
              type: 'bar',
              metrics: ['value']
            },
            trends: {
              type: 'line',
              metrics: ['daily', 'weekly', 'monthly']
            }
          },
          tables: {
            summary: true,
            details: true
          }
        },
        comparison: {
          type: 'month_over_month'
        },
        filters: {
          departments: [],
          teams: [],
          regions: [],
          products: [],
          categories: [],
          statuses: []
        },
        metrics: [
          'revenue',
          'quotations',
          'tasks',
          'leads',
          'claims',
          'attendance'
        ]
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      setData(response.data);
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          handleAuthError();
        } else {
          setError(new Error(err.response?.data?.message || 'Failed to generate report'));
        }
      } else {
        setError(err instanceof Error ? err : new Error('Failed to generate report'));
      }
      setData(null);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchDailyReport();
    }
  }, [accessToken, fetchDailyReport]);

  return {
    dateRange,
    setDateRange,
    period,
    setPeriod,
    reportType,
    setReportType,
    data,
    isGenerating,
    error,
    handleGenerateReport,
    fetchDailyReport
  };
};
