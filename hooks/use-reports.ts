import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { DateRange } from "react-day-picker";
import { useSessionStore } from "@/store/use-session-store";
import { DailyReport, GeneratedReport } from "@/lib/types/reports";
import toast from "react-hot-toast";
import { api } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Match the backend enums exactly
export enum ReportType {
  CLAIM = 'CLAIM',
  QUOTATION = 'QUOTATION',
  LEAD = 'LEAD',
  TASK = 'TASK'
}

export enum ReportPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom'
}

interface GenerateReportParams {
  startDate: Date;
  endDate: Date;
  period: ReportPeriod;
  type: ReportType;
}

interface ErrorResponse {
  message: string;
  details?: string;
  status?: number;
}

export const useReports = () => {
  const { accessToken } = useSessionStore();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [period, setPeriod] = useState<ReportPeriod>(ReportPeriod.DAILY);
  const [reportType, setReportType] = useState<ReportType>(ReportType.LEAD);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch daily report
  const { data: dailyReportData, isLoading: isDailyReportLoading } =
    useQuery<DailyReport>({
      queryKey: ["daily-report"],
      queryFn: async () => {
        const response = await axios.get<{ data: DailyReport }>(
          `${API_URL}/reports/daily-report`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        return response.data.data;
      },
      enabled: !!accessToken,
    });

  // Generate custom report
  const generateReportMutation = useMutation<
    GeneratedReport,
    AxiosError<ErrorResponse>,
    GenerateReportParams
  >({
    mutationFn: async (params: GenerateReportParams) => {
      // Ensure all required fields are present
      if (!params.startDate || !params.endDate || !params.period || !params.type) {
        throw new Error('Missing required fields');
      }

      // Format the dates properly for the API
      const payload = {
        startDate: params.startDate.toISOString(),
        endDate: params.endDate.toISOString(),
        period: params.period,
        type: params.type
      };

      console.log('Sending report request with payload:', payload);

      const response = await axios.post<{ data: GeneratedReport }>(
        `${API_URL}/reports/generate`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log('Report generation response:', response.data);
      return response.data.data;
    },
    onError: (error) => {
      console.error('Report generation error:', {
        error,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        details: error.response?.data?.details
      });

      // Display a more specific error message based on the response
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.details
        || error.message
        || "Failed to generate report";

      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center',
      });
    },
  });

  const handleGenerateReport = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) {
      setError('Please select a date range');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await api.post('/reports/generate', {
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
        period,
        type: reportType,
        visualization: {
          format: 'json',
          charts: {},
          tables: {}
        },
        filters: {}
      });

      setDailyReport(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Your session has expired. Please sign in again.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to generate report');
      }
    } finally {
      setIsGenerating(false);
    }
  }, [dateRange, period, reportType]);

  return {
    // State
    dateRange,
    period,
    reportType,

    // Setters
    setDateRange,
    setPeriod,
    setReportType,

    // Data and loading states
    dailyReport: dailyReport || dailyReportData,
    isDailyReportLoading,
    isGenerating,
    error,

    // Actions
    handleGenerateReport,

    // Mutation state
    generateReportMutation,
  };
};
