import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import {
  organizationSettingsApi,
  organizationAppearanceApi,
  organizationHoursApi,
  OrganisationSettings,
  OrganisationAppearance,
  OrganisationHours,
} from '@/lib/services/organization-api';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';

// Query keys for different settings types
const ORGANIZATION_SETTINGS_QUERY_KEY = 'organization-settings';
const ORGANIZATION_APPEARANCE_QUERY_KEY = 'organization-appearance';
const ORGANIZATION_HOURS_QUERY_KEY = 'organization-hours';

// Zod schemas for validation
export const appearanceSchema = z.object({
  primaryColor: z.string().min(4, 'Please enter a valid color'),
  secondaryColor: z.string().min(4, 'Please enter a valid color'),
  accentColor: z.string().min(4, 'Please enter a valid color'),
  errorColor: z.string().min(4, 'Please enter a valid color'),
  successColor: z.string().min(4, 'Please enter a valid color'),
  logoUrl: z.string().url('Please enter a valid URL').or(z.string().length(0)),
  logoAltText: z.string(),
  theme: z.enum(['light', 'dark', 'system']),
  customFont: z.string().optional(),
  customCss: z.string().optional(),
});

export const businessHoursSchema = z.object({
  schedule: z.object({
    monday: z.object({ start: z.string(), end: z.string(), closed: z.boolean() }),
    tuesday: z.object({ start: z.string(), end: z.string(), closed: z.boolean() }),
    wednesday: z.object({ start: z.string(), end: z.string(), closed: z.boolean() }),
    thursday: z.object({ start: z.string(), end: z.string(), closed: z.boolean() }),
    friday: z.object({ start: z.string(), end: z.string(), closed: z.boolean() }),
    saturday: z.object({ start: z.string(), end: z.string(), closed: z.boolean() }),
    sunday: z.object({ start: z.string(), end: z.string(), closed: z.boolean() }),
  }),
  timezone: z.string().min(1, 'Please select a timezone'),
  holidayMode: z.boolean(),
  holidayUntil: z.date().optional().nullable(),
});

export const organizationSettingsSchema = z.object({
  contact: z.object({
    email: z.string().email('Please enter a valid email address'),
    phone: z.object({
      code: z.string().min(1, 'Please select a country code'),
      number: z.string().min(5, 'Please enter a valid phone number'),
    }),
    website: z.string().url('Please enter a valid URL').or(z.string().length(0)),
    address: z.object({
      street: z.string().min(1, 'Please enter a street address'),
      suburb: z.string().optional().or(z.literal('')),
      city: z.string().min(1, 'Please enter a city'),
      state: z.string().min(1, 'Please enter a state/province'),
      country: z.string().min(1, 'Please select a country'),
      postalCode: z.string().min(1, 'Please enter a postal code'),
    }),
  }).optional(),
  regional: z.object({
    language: z.string().min(1, 'Please select a language'),
    timezone: z.string().min(1, 'Please select a timezone'),
    currency: z.string().min(1, 'Please select a currency'),
    dateFormat: z.string().min(1, 'Please select a date format'),
    timeFormat: z.string().min(1, 'Please select a time format'),
  }).optional(),
  business: z.object({
    name: z.string().min(2, 'Business name must be at least 2 characters'),
    registrationNumber: z.string().optional().or(z.literal('')),
    taxId: z.string().optional().or(z.literal('')),
    industry: z.string().min(1, 'Please select an industry'),
    size: z.enum(['small', 'medium', 'large', 'enterprise']),
  }).optional(),
  notifications: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    push: z.boolean().default(true),
    whatsapp: z.boolean().default(false),
    taskNotifications: z.boolean().default(true),
    feedbackTokenExpiryDays: z.number().int().min(1).max(30),
  }).optional(),
  geofence: z.object({
    enabled: z.boolean().default(false),
    radius: z.number().min(10).max(10000),
    trackingInterval: z.number().min(5).max(600),
    alertDistance: z.number().min(5).max(1000),
  }).optional(),
});

// Type definitions
export type AppearanceFormData = z.infer<typeof appearanceSchema>;
export type BusinessHoursFormData = z.infer<typeof businessHoursSchema>;
export type OrganizationSettingsFormData = z.infer<typeof organizationSettingsSchema>;

// Default values
const defaultAppearanceValues: AppearanceFormData = {
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  accentColor: '#3b82f6',
  errorColor: '#ef4444',
  successColor: '#10b981',
  logoUrl: '',
  logoAltText: '',
  theme: 'system',
  customFont: '',
  customCss: '',
};

const defaultBusinessHoursValues: BusinessHoursFormData = {
  schedule: {
    monday: { start: '07:30', end: '16:30', closed: false },
    tuesday: { start: '07:30', end: '16:30', closed: false },
    wednesday: { start: '07:30', end: '16:30', closed: false },
    thursday: { start: '07:30', end: '16:30', closed: false },
    friday: { start: '07:30', end: '16:30', closed: false },
    saturday: { start: '10:00', end: '16:00', closed: true },
    sunday: { start: '10:00', end: '16:00', closed: true },
  },
  timezone: 'UTC',
  holidayMode: false,
  holidayUntil: null,
};

const defaultOrganizationSettingsValues: OrganizationSettingsFormData = {
  contact: {
    email: '',
    phone: { code: '', number: '' },
    website: '',
    address: {
      street: '',
      suburb: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    },
  },
  regional: {
    language: '',
    timezone: '',
    currency: '',
    dateFormat: '',
    timeFormat: '',
  },
  business: {
    name: '',
    registrationNumber: '',
    taxId: '',
    industry: '',
    size: 'small' as const,
  },
  notifications: {
    email: true,
    sms: false,
    push: true,
    whatsapp: false,
    taskNotifications: true,
    feedbackTokenExpiryDays: 7,
  },
  geofence: {
    enabled: false,
    radius: 100,
    trackingInterval: 30,
    alertDistance: 50,
  },
};

/**
 * Hook for managing organization appearance settings
 */
export function useAppearanceSettings() {
  const queryClient = useQueryClient();

  // Fetch appearance settings
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [ORGANIZATION_APPEARANCE_QUERY_KEY],
    queryFn: () => organizationAppearanceApi.getAppearance(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Transform data for form
  const formData = useMemo(() => {
    if (!data) return defaultAppearanceValues;
    
    return {
      primaryColor: data.primaryColor || defaultAppearanceValues.primaryColor,
      secondaryColor: data.secondaryColor || defaultAppearanceValues.secondaryColor,
      accentColor: data.accentColor || defaultAppearanceValues.accentColor,
      errorColor: data.errorColor || defaultAppearanceValues.errorColor,
      successColor: data.successColor || defaultAppearanceValues.successColor,
      logoUrl: data.logoUrl || defaultAppearanceValues.logoUrl,
      logoAltText: data.logoAltText || defaultAppearanceValues.logoAltText,
      theme: data.theme || defaultAppearanceValues.theme,
      customFont: data.customFont || defaultAppearanceValues.customFont,
      customCss: data.customCss || defaultAppearanceValues.customCss,
    };
  }, [data]);

  // Form setup
  const form = useForm<AppearanceFormData>({
    resolver: zodResolver(appearanceSchema),
    defaultValues: defaultAppearanceValues,
    values: formData, // Use values to sync with query data
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: Partial<AppearanceFormData>) => {
      try {
        return await organizationAppearanceApi.updateAppearance(values);
      } catch (error: any) {
        // If settings don't exist, try creating them
        if (error?.message?.includes('not found')) {
          return await organizationAppearanceApi.createAppearance(values);
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      // Update query cache
      queryClient.setQueryData([ORGANIZATION_APPEARANCE_QUERY_KEY], data);
      showSuccessToast('Appearance settings updated successfully', toast);
    },
    onError: (error) => {
      console.error('Error updating appearance settings:', error);
      showErrorToast('Failed to update appearance settings. Please try again.', toast);
    },
  });

  // Submit handler
  const handleSubmit = useCallback(
    async (values: AppearanceFormData) => {
      updateMutation.mutate(values);
    },
    [updateMutation]
  );

  return {
    form,
    data: formData,
    isLoading,
    isSaving: updateMutation.isPending,
    error: error as Error | null,
    refetch,
    handleSubmit,
    isDirty: form.formState.isDirty,
  };
}

/**
 * Hook for managing organization business hours
 */
export function useBusinessHours() {
  const queryClient = useQueryClient();

  // Fetch business hours
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [ORGANIZATION_HOURS_QUERY_KEY],
    queryFn: async () => {
      try {
        return await organizationHoursApi.getHours();
      } catch (error: any) {
        // Handle organization reference issues gracefully
        if (error?.message?.includes('Organization reference not found') || 
            error?.message?.includes('Please log in again')) {
          console.warn('Organization access issue, user may need to re-login');
          throw error;
        }
        
        // Handle 404 - hours not set up yet
        if (error?.message?.includes('not found')) {
          console.info('Business hours not set up yet, will use defaults');
          return null; // Return null to use defaults
        }
        
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth issues or organization reference problems
      if (error?.message?.includes('Organization reference not found') ||
          error?.message?.includes('Please log in again') ||
          error?.message?.includes('session has expired')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Transform data for form
  const formData = useMemo(() => {
    if (!data) return defaultBusinessHoursValues;
    
    return {
      schedule: data.schedule || defaultBusinessHoursValues.schedule,
      timezone: data.timezone || defaultBusinessHoursValues.timezone,
      holidayMode: data.holidayMode || defaultBusinessHoursValues.holidayMode,
      holidayUntil: data.holidayUntil ? new Date(data.holidayUntil) : null,
    };
  }, [data]);

  // Form setup
  const form = useForm<BusinessHoursFormData>({
    resolver: zodResolver(businessHoursSchema),
    defaultValues: defaultBusinessHoursValues,
    values: formData, // Use values to sync with query data
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: BusinessHoursFormData) => {
      try {
        // Transform form data to API format
        const apiData = {
          ...values,
          openTime: values.schedule?.monday?.start || '07:30',
          closeTime: values.schedule?.monday?.end || '16:30',
          weeklySchedule: {
            monday: !values.schedule?.monday?.closed,
            tuesday: !values.schedule?.tuesday?.closed,
            wednesday: !values.schedule?.wednesday?.closed,
            thursday: !values.schedule?.thursday?.closed,
            friday: !values.schedule?.friday?.closed,
            saturday: !values.schedule?.saturday?.closed,
            sunday: !values.schedule?.sunday?.closed,
          },
          holidayUntil: values.holidayUntil ? values.holidayUntil.toISOString() : undefined,
        };

        return await organizationHoursApi.updateHours(apiData);
      } catch (error: any) {
        console.error('Business hours update error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Update query cache
      queryClient.setQueryData([ORGANIZATION_HOURS_QUERY_KEY], data);
      showSuccessToast('Business hours updated successfully', toast);
    },
    onError: (error: any) => {
      console.error('Error updating business hours:', error);
      showErrorToast('Failed to update business hours. Please try again.', toast);
    },
  });

  // Submit handler
  const handleSubmit = useCallback(
    async (values: BusinessHoursFormData) => {
      updateMutation.mutate(values);
    },
    [updateMutation]
  );

  return {
    form,
    data: formData,
    isLoading,
    isSaving: updateMutation.isPending,
    error: error as Error | null,
    refetch,
    handleSubmit,
    isDirty: form.formState.isDirty,
  };
}

/**
 * Hook for managing general organization settings
 */
export function useOrganizationSettings() {
  const queryClient = useQueryClient();

  // Fetch organization settings
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [ORGANIZATION_SETTINGS_QUERY_KEY],
    queryFn: () => organizationSettingsApi.getSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Transform data for form
  const formData = useMemo(() => {
    if (!data) return defaultOrganizationSettingsValues;
    
    return {
      contact: data.contact || defaultOrganizationSettingsValues.contact,
      regional: data.regional || defaultOrganizationSettingsValues.regional,
      business: data.business || defaultOrganizationSettingsValues.business,
      notifications: data.notifications || defaultOrganizationSettingsValues.notifications,
      geofence: data.geofence || defaultOrganizationSettingsValues.geofence,
    };
  }, [data]);

  // Form setup
  const form = useForm<OrganizationSettingsFormData>({
    resolver: zodResolver(organizationSettingsSchema),
    defaultValues: defaultOrganizationSettingsValues,
    values: formData, // Use values to sync with query data
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: OrganizationSettingsFormData) => {
      try {
        return await organizationSettingsApi.updateSettings(values);
      } catch (error: any) {
        // If settings don't exist, try creating them
        if (error?.message?.includes('not found')) {
          return await organizationSettingsApi.createSettings(values);
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      // Update query cache
      queryClient.setQueryData([ORGANIZATION_SETTINGS_QUERY_KEY], data);
      showSuccessToast('Organization settings updated successfully', toast);
    },
    onError: (error) => {
      console.error('Error updating organization settings:', error);
      showErrorToast('Failed to update organization settings. Please try again.', toast);
    },
  });

  // Submit handler
  const handleSubmit = useCallback(
    async (values: OrganizationSettingsFormData) => {
      updateMutation.mutate(values);
    },
    [updateMutation]
  );

  return {
    form,
    data: formData,
    isLoading,
    isSaving: updateMutation.isPending,
    error: error as Error | null,
    refetch,
    handleSubmit,
    isDirty: form.formState.isDirty,
  };
}

/**
 * Hook to invalidate all organization settings queries
 */
export function useInvalidateOrganizationSettings() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [ORGANIZATION_SETTINGS_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [ORGANIZATION_APPEARANCE_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [ORGANIZATION_HOURS_QUERY_KEY] });
  }, [queryClient]);
} 