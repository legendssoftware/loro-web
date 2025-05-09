import { axiosInstance } from './api-client';

/**
 * Organization reference getter
 * In a real app, this would come from auth context or similar
 */
export function getOrganizationRef(): string {
  // This is a placeholder - in a real app, you'd get this from your auth context or similar
  return localStorage.getItem('organizationRef') || 'org-default';
}

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
    registrationNumber: string;
    taxId: string;
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
  schedule: {
    monday: { start: string; end: string; closed: boolean };
    tuesday: { start: string; end: string; closed: boolean };
    wednesday: { start: string; end: string; closed: boolean };
    thursday: { start: string; end: string; closed: boolean };
    friday: { start: string; end: string; closed: boolean };
    saturday: { start: string; end: string; closed: boolean };
    sunday: { start: string; end: string; closed: boolean };
  };
  timezone: string;
  holidayMode: boolean;
  holidayUntil?: string;
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
      const response = await axiosInstance.get(`/organisations/${ref}/settings`);
      return response.data.settings;
    } catch (error) {
      console.error('Error fetching organization settings:', error);
      throw error;
    }
  },

  /**
   * Update organization settings
   */
  async updateSettings(settings: Partial<OrganisationSettings>): Promise<OrganisationSettings> {
    try {
      const ref = getOrganizationRef();
      const response = await axiosInstance.patch(`/organisations/${ref}/settings`, settings);
      return response.data.settings;
    } catch (error) {
      console.error('Error updating organization settings:', error);
      throw error;
    }
  }
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
      const response = await axiosInstance.get(`/organisations/${ref}/appearance`);
      return response.data;
    } catch (error) {
      console.error('Error fetching organization appearance:', error);
      throw error;
    }
  },

  /**
   * Update organization appearance settings
   */
  async updateAppearance(appearance: Partial<OrganisationAppearance>): Promise<OrganisationAppearance> {
    try {
      const ref = getOrganizationRef();
      const response = await axiosInstance.patch(`/organisations/${ref}/appearance`, appearance);
      return response.data;
    } catch (error) {
      console.error('Error updating organization appearance:', error);
      throw error;
    }
  }
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
      const response = await axiosInstance.get(`/organisations/${ref}/hours`);
      return response.data;
    } catch (error) {
      console.error('Error fetching organization hours:', error);
      throw error;
    }
  },

  /**
   * Update organization hours settings
   */
  async updateHours(hours: Partial<OrganisationHours>): Promise<OrganisationHours> {
    try {
      const ref = getOrganizationRef();
      const response = await axiosInstance.patch(`/organisations/${ref}/hours`, hours);
      return response.data;
    } catch (error) {
      console.error('Error updating organization hours:', error);
      throw error;
    }
  }
};
