export interface OrganisationSettings {
    uid: number;
    contact?: {
        email: string;
        phone: {
            code: string;
            number: string;
        };
        website: string;
        address: string;
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
        taxId: string;
        industry?: string;
        size?: 'small' | 'medium' | 'large' | 'enterprise';
    };
    branding?: {
        logo?: string;
        logoAltText?: string;
        favicon?: string;
        primaryColor?: string;
        secondaryColor?: string;
        accentColor?: string;
    };
    notifications?: {
        email: boolean;
        sms: boolean;
        push: boolean;
        whatsapp: boolean;
    };
    preferences?: {
        defaultView: string;
        itemsPerPage: number;
        theme: 'light' | 'dark' | 'system';
        menuCollapsed: boolean;
    };
    organisationUid: number;
}

export interface OrganisationAppearance {
    uid: number;
    branding: {
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
        errorColor: string;
        successColor: string;
        logo?: string;
        logoAltText?: string;
        favicon?: string;
        theme: 'default' | 'modern' | 'classic';
        mode: 'system' | 'light' | 'dark';
        fontFamily: 'inter' | 'roboto' | 'poppins';
        fontSize: number;
    };
    customCss?: Record<string, any>;
    organisationUid: number;
}

export interface OrganisationHours {
    uid: number;
    openTime: string;
    closeTime: string;
    weeklySchedule: {
        monday: boolean;
        tuesday: boolean;
        wednesday: boolean;
        thursday: boolean;
        friday: boolean;
        saturday: boolean;
        sunday: boolean;
    };
    specialHours?: {
        date: string;
        openTime: string;
        closeTime: string;
    }[];
    organisationUid: number;
}

export interface UploadResponse {
    url: string;
    message: string;
}
