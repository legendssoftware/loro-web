import { axiosInstance } from './api-client';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';

/**
 * Organization reference getter with improved error handling
 */
export function getOrganizationRef(): string {
    // First, try to get from session storage (auth store)
    const sessionAuthData = sessionStorage.getItem('auth-storage');
    if (sessionAuthData) {
        try {
            const parsed = JSON.parse(sessionAuthData);
            // Check multiple possible paths for the organization reference
            const orgRef = parsed?.state?.profileData?.organisationRef ||
                          parsed?.state?.profileData?.organisation?.ref ||
                          parsed?.profileData?.organisationRef ||
                          parsed?.profileData?.organisation?.ref;
            if (orgRef) {
                return String(orgRef);
            }
        } catch (error) {
            console.warn('Failed to parse session auth storage for organization ref:', error);
        }
    }

    // Fallback to localStorage auth data
    const localAuthData = localStorage.getItem('auth-storage');
    if (localAuthData) {
        try {
            const parsed = JSON.parse(localAuthData);
            const orgRef = parsed?.state?.profileData?.organisationRef ||
                          parsed?.state?.profileData?.organisation?.ref ||
                          parsed?.profileData?.organisationRef ||
                          parsed?.profileData?.organisation?.ref;
            if (orgRef) {
                return String(orgRef);
            }
        } catch (error) {
            console.warn('Failed to parse local auth storage for organization ref:', error);
        }
    }

    // Try legacy storage keys
    const storageRef = localStorage.getItem('organizationRef');
    const storageOrgRef = localStorage.getItem('orgRef');

    if (storageRef) return storageRef;
    if (storageOrgRef) return storageOrgRef;

    // As a last resort, try to extract from current URL if on organization context
    const urlParams = new URLSearchParams(window.location.search);
    const urlOrgRef = urlParams.get('orgRef') || urlParams.get('organizationRef');
    if (urlOrgRef) {
        return urlOrgRef;
    }

    // Throw error with helpful message
    console.error('Organization reference not found in any storage location');
    throw new Error(
        'Organization reference not found. Please ensure you are properly authenticated and try again.',
    );
}

/**
 * Improved error handler for API calls
 */
const handleApiError = (error: any, operation: string) => {
    // Handle case where organization reference is missing
    if (error?.message?.includes('Organization reference not found')) {
        console.error(`Organization reference missing for ${operation}`);
        return new Error(
            'Please log in again to refresh your organization access.',
        );
    }

    const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        `Failed to ${operation}. Please try again.`;

    console.error(`Error ${operation}:`, error);

    // Check for specific HTTP status codes
    if (error?.response?.status === 404) {
        try {
            const ref = getOrganizationRef();
            console.error(
                `Resource not found for organization: ${ref}. URL: ${error?.config?.url}`,
            );
            return new Error(
                `The requested ${operation.split(' ')[0]} was not found for your organization. This might be because it hasn't been set up yet.`,
            );
        } catch (refError) {
            return new Error(
                'Please log in again to refresh your organization access.',
            );
        }
    }

    if (error?.response?.status === 403) {
        return new Error(
            `You don't have permission to ${operation}. Please contact your administrator.`,
        );
    }

    if (error?.response?.status === 401) {
        return new Error('Your session has expired. Please log in again.');
    }

    return new Error(errorMessage);
};

/**
 * Organization Settings Interface
 */
export interface OrganisationSettings {
    id?: string;
    ref?: string;
    contact?: {
        email: string;
        phone: {
            code: string;
            number: string;
        };
        website: string;
        address: {
            street: string;
            suburb?: string;
            city: string;
            state: string;
            country: string;
            postalCode: string;
        };
    };
    regional?: {
        language: string;
        timezone: string;
        currency: string;
        dateFormat: string;
        timeFormat: string;
    };
    business?: {
        name: string;
        registrationNumber?: string;
        taxId?: string;
        industry: string;
        size: 'small' | 'medium' | 'large' | 'enterprise';
    };
    // Add other property groups as needed
    notifications?: {
        email: boolean;
        sms: boolean;
        push: boolean;
        whatsapp: boolean;
        taskNotifications: boolean;
        feedbackTokenExpiryDays: number;
    };
    geofence?: {
        enabled: boolean;
        radius: number;
        trackingInterval: number;
        alertDistance: number;
    };
}

/**
 * Organization Appearance Interface
 */
export interface OrganisationAppearance {
    uid?: number;
    ref?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    errorColor: string;
    successColor: string;
    logoUrl?: string;
    logoAltText: string;
    theme?: 'light' | 'dark' | 'system';
    customFont?: string;
    customCss?: string;
    createdAt?: Date;
    updatedAt?: Date;
    organisationUid?: number;
}

/**
 * Organization Hours Interface
 */
export interface OrganisationHours {
    id?: string;
    ref?: string;
    uid?: number;
    openTime?: string; // Default opening time
    closeTime?: string; // Default closing time
    schedule?: {
        monday: { start: string; end: string; closed: boolean };
        tuesday: { start: string; end: string; closed: boolean };
        wednesday: { start: string; end: string; closed: boolean };
        thursday: { start: string; end: string; closed: boolean };
        friday: { start: string; end: string; closed: boolean };
        saturday: { start: string; end: string; closed: boolean };
        sunday: { start: string; end: string; closed: boolean };
    };
    weeklySchedule?: {
        monday: boolean;
        tuesday: boolean;
        wednesday: boolean;
        thursday: boolean;
        friday: boolean;
        saturday: boolean;
        sunday: boolean;
    };
    timezone?: string;
    holidayMode?: boolean;
    holidayUntil?: string | Date;
    specialHours?: Array<{
        date: string;
        openTime: string;
        closeTime: string;
        reason?: string;
    }>;
    createdAt?: string;
    updatedAt?: string;
    isDeleted?: boolean;
}

/**
 * Organization Settings API Service
 */
export const organizationSettingsApi = {
    /**
     * Get organization settings
     */
    async getSettings(): Promise<OrganisationSettings> {
        try {
            const ref = getOrganizationRef();
            console.log('Fetching settings for organization:', ref);

            const response = await axiosInstance.get(
                `/organisations/${ref}/settings`,
            );
            // Server returns { settings: {...}, message: "..." }
            return response.data.settings || {};
        } catch (error) {
            throw handleApiError(error, 'fetching organization settings');
        }
    },

    /**
     * Update organization settings
     */
    async updateSettings(
        settings: Partial<OrganisationSettings>,
    ): Promise<OrganisationSettings> {
        try {
            const ref = getOrganizationRef();
            console.log('Updating settings for organization:', ref, settings);

            const response = await axiosInstance.patch(
                `/organisations/${ref}/settings`,
                settings,
            );
            // Server returns { settings: {...}, message: "..." }
            return response.data.settings || {};
        } catch (error) {
            throw handleApiError(error, 'updating organization settings');
        }
    },

    /**
     * Create organization settings
     */
    async createSettings(
        settings: Partial<OrganisationSettings>,
    ): Promise<OrganisationSettings> {
        try {
            const ref = getOrganizationRef();
            console.log('Creating settings for organization:', ref, settings);

            const response = await axiosInstance.post(
                `/organisations/${ref}/settings`,
                settings,
            );
            // Server returns { settings: {...}, message: "..." }
            return response.data.settings || {};
        } catch (error) {
            throw handleApiError(error, 'creating organization settings');
        }
    },
};

/**
 * Organization Appearance API Service
 */
export const organizationAppearanceApi = {
    /**
     * Get organization appearance settings
     */
    async getAppearance(): Promise<OrganisationAppearance> {
        try {
            const ref = getOrganizationRef();
            console.log('Fetching appearance for organization:', ref);

            const response = await axiosInstance.get(
                `/organisations/${ref}/appearance`,
            );
            // Appearance endpoint returns data directly, not wrapped in settings
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'fetching organization appearance');
        }
    },

    /**
     * Update organization appearance settings
     */
    async updateAppearance(
        appearance: Partial<OrganisationAppearance>,
    ): Promise<OrganisationAppearance> {
        try {
            const ref = getOrganizationRef();
            console.log(
                'Updating appearance for organization:',
                ref,
                appearance,
            );

            const response = await axiosInstance.patch(
                `/organisations/${ref}/appearance`,
                appearance,
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'updating organization appearance');
        }
    },

    /**
     * Create organization appearance settings
     */
    async createAppearance(
        appearance: Partial<OrganisationAppearance>,
    ): Promise<OrganisationAppearance> {
        try {
            const ref = getOrganizationRef();
            console.log(
                'Creating appearance for organization:',
                ref,
                appearance,
            );

            const response = await axiosInstance.post(
                `/organisations/${ref}/appearance`,
                appearance,
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'creating organization appearance');
        }
    },
};

/**
 * Organization Hours API Service
 */
export const organizationHoursApi = {
    /**
     * Get organization hours settings
     */
    async getHours(): Promise<OrganisationHours> {
        try {
            const ref = getOrganizationRef();
            console.log('Fetching hours for organization:', ref);

            const response = await axiosInstance.get(
                `/organisations/${ref}/hours`,
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'fetching organization hours');
        }
    },

    /**
     * Update organization hours settings
     */
    async updateHours(
        hours: Partial<OrganisationHours>,
    ): Promise<OrganisationHours> {
        try {
            const ref = getOrganizationRef();
            console.log('Updating hours for organization:', ref, hours);

            const response = await axiosInstance.patch(
                `/organisations/${ref}/hours`,
                hours,
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'updating organization hours');
        }
    },
};

/**
 * Organization Interface
 */
export interface Organisation {
    uid?: number;
    name: string;
    email: string;
    phone: string;
    contactPerson: string;
    website: string;
    logo?: string;
    ref?: string;
    platform?: 'hr' | 'sales' | 'crm' | 'all';
    address: {
        street: string;
        suburb?: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
    createdAt?: Date;
    updatedAt?: Date;
    isDeleted?: boolean;
}

/**
 * Organization API Service
 */
export const organizationApi = {
    /**
     * Get organization details
     */
    async getOrganization(): Promise<Organisation> {
        try {
            const ref = getOrganizationRef();
            console.log('Fetching organization:', ref);

            const response = await axiosInstance.get(`/org/${ref}`);
            return response.data.data;
        } catch (error) {
            throw handleApiError(error, 'fetching organization');
        }
    },

    /**
     * Update organization details
     */
    async updateOrganization(
        organization: Partial<Organisation>,
    ): Promise<{ message: string }> {
        try {
            const ref = getOrganizationRef();
            console.log('Updating organization:', ref, organization);

            const response = await axiosInstance.patch(
                `/org/${ref}`,
                organization,
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'updating organization');
        }
    },
};

/**
 * Utility function to show standardized success toasts
 */
export const showSettingsSuccessToast = (message: string, toast: any) => {
    return showSuccessToast(message, toast);
};

/**
 * Utility function to show standardized error toasts
 */
export const showSettingsErrorToast = (
    error: any,
    toast: any,
    fallbackMessage?: string,
) => {
    const message =
        error?.message ||
        fallbackMessage ||
        'An error occurred. Please try again.';
    return showErrorToast(message, toast);
};
