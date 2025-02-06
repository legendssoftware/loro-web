import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { DateRange } from "react-day-picker";
import { useSessionStore } from "@/store/use-session-store";
import { DailyReport, GeneratedReport } from "@/lib/types/reports";
import toast from "react-hot-toast";

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
  MONTHLY = 'monthly'
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
  const [reportType, setReportType] = useState<ReportType>(ReportType.QUOTATION);

  // Fetch daily report
  const { data: dailyReport, isLoading: isDailyReportLoading } =
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

  const handleGenerateReport = async () => {
    // Validate date range
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select a date range");
      return;
    }

    // Validate period
    if (!period) {
      toast.error("Please select a time period");
      return;
    }

    // Validate report type
    if (!reportType) {
      toast.error("Please select a report type");
      return;
    }

    // Validate date range makes sense
    if (dateRange.to < dateRange.from) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      // Create the start and end dates with proper time
      const startDate = new Date(dateRange.from);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(dateRange.to);
      endDate.setHours(23, 59, 59, 999);

      await generateReportMutation.mutateAsync({
        startDate,
        endDate,
        period,
        type: reportType
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

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
    dailyReport,
    isDailyReportLoading,
    isGenerating: generateReportMutation.isPending,

    // Actions
    handleGenerateReport,

    // Mutation state
    generateReportMutation,
  };
};
