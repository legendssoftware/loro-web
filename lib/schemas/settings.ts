import * as z from 'zod';

// General Settings Schema
export const settingsFormSchema = z.object({
    contact: z.object({
        email: z.string().email('Invalid email address'),
        phone: z.object({
            code: z.string(),
            number: z.string().min(1, 'Phone number is required'),
        }),
        website: z.string().url('Must be a valid URL'),
        address: z.string().min(1, 'Address is required'),
    }),
    regional: z.object({
        language: z.string().min(1, 'Language is required'),
        timezone: z.string().min(1, 'Timezone is required'),
        currency: z.string().min(1, 'Currency is required'),
        dateFormat: z.string().min(1, 'Date format is required'),
        timeFormat: z.string().min(1, 'Time format is required'),
    }),
    business: z.object({
        name: z.string().min(1, 'Business name is required'),
        registrationNumber: z.string().optional(),
        taxId: z.string().min(1, 'Tax ID is required'),
        industry: z.string().optional(),
        size: z.enum(['small', 'medium', 'large', 'enterprise']).optional(),
    }),
    branding: z.object({
        logo: z.string().optional(),
        logoAltText: z.string().optional(),
        favicon: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        accentColor: z.string().optional(),
    }).optional(),
    notifications: z.object({
        email: z.boolean(),
        sms: z.boolean(),
        push: z.boolean(),
        whatsapp: z.boolean(),
    }).optional(),
    preferences: z.object({
        defaultView: z.string(),
        itemsPerPage: z.number(),
        theme: z.enum(['light', 'dark', 'system']),
        menuCollapsed: z.boolean(),
    }).optional(),
});

// Appearance Schema
export const appearanceFormSchema = z.object({
    branding: z.object({
        primaryColor: z.string().min(1, 'Primary color is required'),
        secondaryColor: z.string().min(1, 'Secondary color is required'),
        accentColor: z.string().min(1, 'Accent color is required'),
        errorColor: z.string().min(1, 'Error color is required'),
        successColor: z.string().min(1, 'Success color is required'),
        logo: z.string().optional(),
        logoAltText: z.string().optional(),
        favicon: z.string().optional(),
        theme: z.enum(['default', 'modern', 'classic']).default('default'),
        mode: z.enum(['system', 'light', 'dark']).default('system'),
        fontFamily: z.enum(['inter', 'roboto', 'poppins']).default('inter'),
        fontSize: z.number().min(12).max(24).default(16),
        fontWeight: z.enum(['normal', 'medium', 'bold']).default('normal'),
    }),
    customCss: z.record(z.any()).optional(),
    preferences: z.object({
        defaultView: z.string(),
        itemsPerPage: z.number(),
        theme: z.enum(['light', 'dark', 'system']),
        menuCollapsed: z.boolean(),
    }).optional(),
});

// Hours Schema
export const hoursFormSchema = z.object({
    openTime: z.string().min(1, 'Opening time is required'),
    closeTime: z.string().min(1, 'Closing time is required'),
    weeklySchedule: z.object({
        monday: z.boolean(),
        tuesday: z.boolean(),
        wednesday: z.boolean(),
        thursday: z.boolean(),
        friday: z.boolean(),
        saturday: z.boolean(),
        sunday: z.boolean(),
    }),
    specialHours: z.array(z.object({
        date: z.string(),
        openTime: z.string(),
        closeTime: z.string(),
    })).optional(),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
export type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;
export type HoursFormValues = z.infer<typeof hoursFormSchema>;
