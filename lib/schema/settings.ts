import { z } from 'zod';

// Common validation schemas
export const colorSchema = z.string().min(4, 'Please enter a valid color');

export const urlSchema = z
    .string()
    .url('Please enter a valid URL')
    .or(z.string().length(0));

// Organization Appearance Schema
export const appearanceSchema = z.object({
    primaryColor: colorSchema,
    secondaryColor: colorSchema,
    accentColor: colorSchema,
    errorColor: colorSchema,
    successColor: colorSchema,
    logoUrl: urlSchema,
    logoAltText: z.string().min(1, 'Logo alt text is required'),
    theme: z.enum(['light', 'dark', 'system']),
    customFont: z.string().optional(),
    customCss: z.string().optional(),
});

// Business Hours Schema
export const dayScheduleSchema = z.object({
    start: z.string(),
    end: z.string(),
    closed: z.boolean(),
});

export const hoursSchema = z.object({
    schedule: z.object({
        monday: dayScheduleSchema,
        tuesday: dayScheduleSchema,
        wednesday: dayScheduleSchema,
        thursday: dayScheduleSchema,
        friday: dayScheduleSchema,
        saturday: dayScheduleSchema,
        sunday: dayScheduleSchema,
    }),
    timezone: z.string().min(1, 'Please select a timezone'),
    holidayMode: z.boolean(),
    holidayUntil: z.date().optional().nullable(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
});

// Contact Information Schema
export const contactSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    phone: z.object({
        code: z.string().min(1, 'Please select a country code'),
        number: z.string().min(5, 'Please enter a valid phone number'),
    }),
    website: urlSchema,
    address: z.object({
        street: z.string().min(1, 'Please enter a street address'),
        suburb: z.string().optional().or(z.literal('')),
        city: z.string().min(1, 'Please enter a city'),
        state: z.string().min(1, 'Please enter a state/province'),
        country: z.string().min(1, 'Please select a country'),
        postalCode: z.string().min(1, 'Please enter a postal code'),
    }),
});

// Regional Settings Schema
export const regionalSchema = z.object({
    language: z.string().min(1, 'Please select a language'),
    timezone: z.string().min(1, 'Please select a timezone'),
    currency: z.string().min(1, 'Please select a currency'),
    dateFormat: z.string().min(1, 'Please select a date format'),
    timeFormat: z.string().min(1, 'Please select a time format'),
});

// Business Information Schema
export const businessSchema = z.object({
    name: z.string().min(2, 'Business name must be at least 2 characters'),
    registrationNumber: z.string().optional().or(z.literal('')),
    taxId: z.string().optional().or(z.literal('')),
    industry: z.string().min(1, 'Please select an industry'),
    size: z.enum(['small', 'medium', 'large', 'enterprise'], {
        required_error: 'Please select a business size',
    }),
});

// Notifications Schema
export const notificationsSchema = z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    push: z.boolean().default(true),
    whatsapp: z.boolean().default(false),
    taskNotifications: z.boolean().default(true),
    feedbackTokenExpiryDays: z.number().int().min(1).max(30),
});

// Geofence Settings Schema
export const geofenceSchema = z.object({
    enabled: z.boolean().default(false),
    radius: z.number().min(10).max(10000),
    trackingInterval: z.number().min(5).max(600),
    alertDistance: z.number().min(5).max(1000),
});

// Combined Organization Settings Schema
export const organizationSettingsSchema = z.object({
    contact: contactSchema.optional(),
    regional: regionalSchema.optional(),
    business: businessSchema.optional(),
    notifications: notificationsSchema.optional(),
    geofence: geofenceSchema.optional(),
});

// Export type definitions
export type AppearanceFormData = z.infer<typeof appearanceSchema>;
export type HoursFormData = z.infer<typeof hoursSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type RegionalFormData = z.infer<typeof regionalSchema>;
export type BusinessFormData = z.infer<typeof businessSchema>;
export type NotificationsFormData = z.infer<typeof notificationsSchema>;
export type GeofenceFormData = z.infer<typeof geofenceSchema>;
export type OrganizationSettingsFormData = z.infer<
    typeof organizationSettingsSchema
>;
