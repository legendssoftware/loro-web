'use client';

import { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Settings, Mail, Phone, Globe, MapPin, Building2, Tag, CreditCard, Calendar, DollarSign, User, Languages, Briefcase, Factory, Shield, Zap, Users, TrendingUp, Navigation, AlertTriangle } from 'lucide-react';
import { AccessLevel } from '@/types/auth';
import { ClientService } from '../../clients/services/client-service';
import { toast } from 'react-hot-toast';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';

// Enums for form options
enum ClientContactPreference {
    EMAIL = 'email',
    PHONE = 'phone',
    SMS = 'sms',
    WHATSAPP = 'whatsapp',
    IN_PERSON = 'in-person',
    MAIL = 'mail',
    VIDEO_CALL = 'video-call'
}

enum PriceTier {
    STANDARD = 'standard',
    DISCOUNT = 'discount',
    PREMIUM = 'premium',
    WHOLESALE = 'wholesale',
    ENTERPRISE = 'enterprise',
    CUSTOM = 'custom',
    VIP = 'vip'
}

enum AcquisitionChannel {
    REFERRAL = 'referral',
    DIRECT = 'direct',
    SOCIAL_MEDIA = 'social_media',
    ONLINE_AD = 'online_ad',
    ORGANIC_SEARCH = 'organic_search',
    EMAIL_CAMPAIGN = 'email_campaign',
    TRADE_SHOW = 'trade_show',
    COLD_CALL = 'cold_call',
    PARTNER = 'partner',
    OTHER = 'other'
}

enum ClientRiskLevel {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

enum PaymentMethod {
    BANK_TRANSFER = 'bank_transfer',
    CREDIT_CARD = 'credit_card',
    DEBIT_CARD = 'debit_card',
    CASH = 'cash',
    CHECK = 'check',
    MOBILE_PAYMENT = 'mobile_payment',
    PAYPAL = 'paypal',
    INVOICE = 'invoice'
}

enum GeofenceType {
    NONE = 'none',
    NOTIFY = 'notify',
    ALERT = 'alert',
    RESTRICTED = 'restricted'
}

// Extended client profile data type with all UpdateClientDto fields
interface ExtendedClientProfile {
    uid: string;
    accessLevel: string;
    name: string;
    organisationRef?: string;
    licenseInfo?: any;
    email: string;
    username: string;
    surname: string;
    phone: string;
    photoURL: string;
    userref: string;
    branch?: {
        name: string;
        uid: string;
    };
    // Extended client-specific fields from UpdateClientDto
    contactPerson?: string;
    category?: string;
    industry?: string;
    companySize?: number;
    alternativePhone?: string;
    website?: string;
    logo?: string;
    preferredLanguage?: string;
    preferredContactMethod?: ClientContactPreference;
    address?: {
        street?: string;
        suburb?: string;
        city?: string;
        state?: string;
        country?: string;
        postalCode?: string;
    };
    priceTier?: PriceTier;
    paymentTerms?: string;
    creditLimit?: number;
    outstandingBalance?: number;
    lifetimeValue?: number;
    tags?: string[];
    visibleCategories?: string[];
    organisation?: {
        name?: string;
        email?: string;
        phone?: string;
    };
    description?: string;
    birthday?: string;
    anniversaryDate?: string;
    discountPercentage?: number;
    annualRevenue?: number;
    satisfactionScore?: number;
    npsScore?: number;
    lastVisitDate?: string;
    nextContactDate?: string;
    customFields?: Record<string, any>;
    socialProfiles?: {
        linkedin?: string;
        twitter?: string;
        facebook?: string;
        instagram?: string;
    };
    // Additional fields from UpdateClientDto
    type?: string;
    status?: string;
    ref?: string;
    assignedSalesRep?: { uid: number };
    acquisitionChannel?: AcquisitionChannel;
    acquisitionDate?: string;
    riskLevel?: ClientRiskLevel;
    preferredPaymentMethod?: PaymentMethod;
    latitude?: number;
    longitude?: number;
    geofenceType?: GeofenceType;
    geofenceRadius?: number;
    enableGeofence?: boolean;
    gpsCoordinates?: string;
}

interface EditFormData {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    alternativePhone: string;
    website: string;
    logo: string;
    description: string;
    category: string;
    industry: string;
    companySize: string;
    preferredLanguage: string;
    preferredContactMethod: string;
    address: {
        street: string;
        suburb: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
    tags: string;
    visibleCategories: string;
    birthday: string;
    anniversaryDate: string;
    discountPercentage: string;
    annualRevenue: string;
    satisfactionScore: string;
    npsScore: string;
    lastVisitDate: string;
    nextContactDate: string;
    creditLimit: string;
    outstandingBalance: string;
    lifetimeValue: string;
    paymentTerms: string;
    priceTier: string;
    acquisitionChannel: string;
    acquisitionDate: string;
    riskLevel: string;
    preferredPaymentMethod: string;
    type: string;
    status: string;
    ref: string;
    socialProfiles: {
        linkedin: string;
        twitter: string;
        facebook: string;
        instagram: string;
    };
    latitude: string;
    longitude: string;
    geofenceType: string;
    geofenceRadius: string;
    enableGeofence: string;
    gpsCoordinates: string;
}

export function ClientSettings() {
    const { profileData, accessToken } = useAuthStore();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cast profileData to extended type for client-specific fields
    const clientProfile = profileData as ExtendedClientProfile;

    // Determine if user is a client
    const isClient = useMemo(() => {
        // Check profileData first
        if (profileData?.accessLevel === AccessLevel.CLIENT) {
            return true;
        }

        // If not found in profileData, check JWT token
        if (accessToken) {
            try {
                const base64Url = accessToken.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map(
                            (c) =>
                                '%' +
                                ('00' + c.charCodeAt(0).toString(16)).slice(-2),
                        )
                        .join(''),
                );
                const payload = JSON.parse(jsonPayload);
                return payload.role === 'client' || payload.accessLevel === AccessLevel.CLIENT;
            } catch (e) {
                console.error('Failed to extract role from token:', e);
            }
        }

        return false;
    }, [profileData, accessToken]);

    // Form data state
    const [formData, setFormData] = useState<EditFormData>({
        name: clientProfile?.name || '',
        contactPerson: clientProfile?.contactPerson || '',
        email: clientProfile?.email || '',
        phone: clientProfile?.phone || '',
        alternativePhone: clientProfile?.alternativePhone || '',
        website: clientProfile?.website || '',
        logo: clientProfile?.logo || '',
        description: clientProfile?.description || '',
        category: clientProfile?.category || '',
        industry: clientProfile?.industry || '',
        companySize: clientProfile?.companySize?.toString() || '',
        preferredLanguage: clientProfile?.preferredLanguage || '',
        preferredContactMethod: clientProfile?.preferredContactMethod || '',
        address: {
            street: clientProfile?.address?.street || '',
            suburb: clientProfile?.address?.suburb || '',
            city: clientProfile?.address?.city || '',
            state: clientProfile?.address?.state || '',
            country: clientProfile?.address?.country || '',
            postalCode: clientProfile?.address?.postalCode || '',
        },
        tags: clientProfile?.tags?.join(', ') || '',
        visibleCategories: clientProfile?.visibleCategories?.join(', ') || '',
        birthday: clientProfile?.birthday || '',
        anniversaryDate: clientProfile?.anniversaryDate || '',
        discountPercentage: clientProfile?.discountPercentage?.toString() || '',
        annualRevenue: clientProfile?.annualRevenue?.toString() || '',
        satisfactionScore: clientProfile?.satisfactionScore?.toString() || '',
        npsScore: clientProfile?.npsScore?.toString() || '',
        lastVisitDate: clientProfile?.lastVisitDate || '',
        nextContactDate: clientProfile?.nextContactDate || '',
        creditLimit: clientProfile?.creditLimit?.toString() || '',
        outstandingBalance: clientProfile?.outstandingBalance?.toString() || '',
        lifetimeValue: clientProfile?.lifetimeValue?.toString() || '',
        paymentTerms: clientProfile?.paymentTerms || '',
        priceTier: clientProfile?.priceTier || '',
        acquisitionChannel: clientProfile?.acquisitionChannel || '',
        acquisitionDate: clientProfile?.acquisitionDate || '',
        riskLevel: clientProfile?.riskLevel || '',
        preferredPaymentMethod: clientProfile?.preferredPaymentMethod || '',
        type: clientProfile?.type || '',
        status: clientProfile?.status || '',
        ref: clientProfile?.ref || '',
        socialProfiles: {
            linkedin: clientProfile?.socialProfiles?.linkedin || '',
            twitter: clientProfile?.socialProfiles?.twitter || '',
            facebook: clientProfile?.socialProfiles?.facebook || '',
            instagram: clientProfile?.socialProfiles?.instagram || '',
        },
        latitude: clientProfile?.latitude?.toString() || '',
        longitude: clientProfile?.longitude?.toString() || '',
        geofenceType: clientProfile?.geofenceType || '',
        geofenceRadius: clientProfile?.geofenceRadius?.toString() || '',
        enableGeofence: clientProfile?.enableGeofence?.toString() || '',
        gpsCoordinates: clientProfile?.gpsCoordinates || '',
    });

    // Update form data when modal opens
    const handleEditModalOpen = (open: boolean) => {
        setIsEditModalOpen(open);
        if (open) {
            // Reset form data with current profile data
            setFormData({
                name: clientProfile?.name || '',
                contactPerson: clientProfile?.contactPerson || '',
                email: clientProfile?.email || '',
                phone: clientProfile?.phone || '',
                alternativePhone: clientProfile?.alternativePhone || '',
                website: clientProfile?.website || '',
                logo: clientProfile?.logo || '',
                description: clientProfile?.description || '',
                category: clientProfile?.category || '',
                industry: clientProfile?.industry || '',
                companySize: clientProfile?.companySize?.toString() || '',
                preferredLanguage: clientProfile?.preferredLanguage || '',
                preferredContactMethod: clientProfile?.preferredContactMethod || '',
                address: {
                    street: clientProfile?.address?.street || '',
                    suburb: clientProfile?.address?.suburb || '',
                    city: clientProfile?.address?.city || '',
                    state: clientProfile?.address?.state || '',
                    country: clientProfile?.address?.country || '',
                    postalCode: clientProfile?.address?.postalCode || '',
                },
                tags: clientProfile?.tags?.join(', ') || '',
                visibleCategories: clientProfile?.visibleCategories?.join(', ') || '',
                birthday: clientProfile?.birthday || '',
                anniversaryDate: clientProfile?.anniversaryDate || '',
                discountPercentage: clientProfile?.discountPercentage?.toString() || '',
                annualRevenue: clientProfile?.annualRevenue?.toString() || '',
                satisfactionScore: clientProfile?.satisfactionScore?.toString() || '',
                npsScore: clientProfile?.npsScore?.toString() || '',
                lastVisitDate: clientProfile?.lastVisitDate || '',
                nextContactDate: clientProfile?.nextContactDate || '',
                creditLimit: clientProfile?.creditLimit?.toString() || '',
                outstandingBalance: clientProfile?.outstandingBalance?.toString() || '',
                lifetimeValue: clientProfile?.lifetimeValue?.toString() || '',
                paymentTerms: clientProfile?.paymentTerms || '',
                priceTier: clientProfile?.priceTier || '',
                acquisitionChannel: clientProfile?.acquisitionChannel || '',
                acquisitionDate: clientProfile?.acquisitionDate || '',
                riskLevel: clientProfile?.riskLevel || '',
                preferredPaymentMethod: clientProfile?.preferredPaymentMethod || '',
                type: clientProfile?.type || '',
                status: clientProfile?.status || '',
                ref: clientProfile?.ref || '',
                socialProfiles: {
                    linkedin: clientProfile?.socialProfiles?.linkedin || '',
                    twitter: clientProfile?.socialProfiles?.twitter || '',
                    facebook: clientProfile?.socialProfiles?.facebook || '',
                    instagram: clientProfile?.socialProfiles?.instagram || '',
                },
                latitude: clientProfile?.latitude?.toString() || '',
                longitude: clientProfile?.longitude?.toString() || '',
                geofenceType: clientProfile?.geofenceType || '',
                geofenceRadius: clientProfile?.geofenceRadius?.toString() || '',
                enableGeofence: clientProfile?.enableGeofence?.toString() || '',
                gpsCoordinates: clientProfile?.gpsCoordinates || '',
            });
        }
    };

    // Handle form input changes
    const handleInputChange = (field: string, value: string) => {
        if (field.startsWith('address.')) {
            const addressField = field.replace('address.', '');
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else if (field.startsWith('socialProfiles.')) {
            const socialField = field.replace('socialProfiles.', '');
            setFormData(prev => ({
                ...prev,
                socialProfiles: {
                    ...prev.socialProfiles,
                    [socialField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Prepare the update data
            const updateData = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                visibleCategories: formData.visibleCategories.split(',').map(cat => cat.trim()).filter(cat => cat),
                discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : undefined,
                annualRevenue: formData.annualRevenue ? parseFloat(formData.annualRevenue) : undefined,
                satisfactionScore: formData.satisfactionScore ? parseFloat(formData.satisfactionScore) : undefined,
                npsScore: formData.npsScore ? parseInt(formData.npsScore) : undefined,
                creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined,
                outstandingBalance: formData.outstandingBalance ? parseFloat(formData.outstandingBalance) : undefined,
                lifetimeValue: formData.lifetimeValue ? parseFloat(formData.lifetimeValue) : undefined,
                companySize: formData.companySize ? parseInt(formData.companySize) : undefined,
                latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
                longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
                geofenceRadius: formData.geofenceRadius ? parseFloat(formData.geofenceRadius) : undefined,
                enableGeofence: formData.enableGeofence ? formData.enableGeofence === 'true' : undefined,
                // Convert date strings to Date objects if needed
                birthday: formData.birthday ? new Date(formData.birthday) : undefined,
                anniversaryDate: formData.anniversaryDate ? new Date(formData.anniversaryDate) : undefined,
                lastVisitDate: formData.lastVisitDate ? new Date(formData.lastVisitDate) : undefined,
                nextContactDate: formData.nextContactDate ? new Date(formData.nextContactDate) : undefined,
                acquisitionDate: formData.acquisitionDate ? new Date(formData.acquisitionDate) : undefined,
            };

            // Call the client profile update API
            const result = await ClientService.updateClientProfile(updateData);

            if (!result.success) {
                showErrorToast(result.message, toast);
                return;
            }

            showSuccessToast(result.message, toast);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            showErrorToast('Failed to update profile. Please try again.', toast);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!profileData) {
        return (
            <div className="flex justify-center items-center h-full">
                <p className="text-muted-foreground">No client data available</p>
            </div>
        );
    }

    return (
        <div className="mx-auto space-y-6 max-w-7xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-xl font-normal uppercase font-body">
                        Client Settings
                    </h1>
                    <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                        Manage your client profile and preferences
                    </p>
                </div>
                <Dialog open={isEditModalOpen} onOpenChange={handleEditModalOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-purple-600 border-purple-600 hover:bg-purple-600 hover:text-white"
                        >
                            <Edit className="mr-2 w-4 h-4" />
                            Edit Profile
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Client Profile</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Tabs defaultValue="basic" className="w-full">
                                <TabsList className="grid grid-cols-4 w-full">
                                    <TabsTrigger value="basic">Basic</TabsTrigger>
                                    <TabsTrigger value="contact">Contact</TabsTrigger>
                                    <TabsTrigger value="business">Business</TabsTrigger>
                                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                                </TabsList>

                                <TabsContent value="basic" className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Company Name *</Label>
                                        <Input
                                            id="name"
                                            placeholder="Enter company name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="contactPerson">Contact Person</Label>
                                            <Input
                                                id="contactPerson"
                                                placeholder="Enter contact person name"
                                                value={formData.contactPerson}
                                                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category</Label>
                                            <Input
                                                id="category"
                                                placeholder="Enter client category"
                                                value={formData.category}
                                                onChange={(e) => handleInputChange('category', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="industry">Industry</Label>
                                            <Input
                                                id="industry"
                                                placeholder="Enter industry"
                                                value={formData.industry}
                                                onChange={(e) => handleInputChange('industry', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="companySize">Company Size</Label>
                                            <Input
                                                id="companySize"
                                                type="number"
                                                placeholder="Enter number of employees"
                                                value={formData.companySize}
                                                onChange={(e) => handleInputChange('companySize', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="type">Client Type</Label>
                                            <Input
                                                id="type"
                                                placeholder="Enter client type"
                                                value={formData.type}
                                                onChange={(e) => handleInputChange('type', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="status">Status</Label>
                                            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="suspended">Suspended</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="ref">Reference Code</Label>
                                            <Input
                                                id="ref"
                                                placeholder="Enter reference code"
                                                value={formData.ref}
                                                onChange={(e) => handleInputChange('ref', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="logo">Logo URL</Label>
                                            <Input
                                                id="logo"
                                                placeholder="Enter logo URL"
                                                value={formData.logo}
                                                onChange={(e) => handleInputChange('logo', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Enter company description"
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="contact" className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="Enter email address"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone *</Label>
                                            <Input
                                                id="phone"
                                                placeholder="Enter phone number"
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="alternativePhone">Alternative Phone</Label>
                                            <Input
                                                id="alternativePhone"
                                                placeholder="Enter alternative phone number"
                                                value={formData.alternativePhone}
                                                onChange={(e) => handleInputChange('alternativePhone', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="website">Website</Label>
                                            <Input
                                                id="website"
                                                placeholder="Enter website URL"
                                                value={formData.website}
                                                onChange={(e) => handleInputChange('website', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="street">Street Address</Label>
                                        <Input
                                            id="street"
                                            placeholder="Enter street address"
                                            value={formData.address.street}
                                            onChange={(e) => handleInputChange('address.street', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="suburb">Suburb</Label>
                                        <Input
                                            id="suburb"
                                            placeholder="Enter suburb"
                                            value={formData.address.suburb}
                                            onChange={(e) => handleInputChange('address.suburb', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input
                                                id="city"
                                                placeholder="Enter city"
                                                value={formData.address.city}
                                                onChange={(e) => handleInputChange('address.city', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="state">State</Label>
                                            <Input
                                                id="state"
                                                placeholder="Enter state"
                                                value={formData.address.state}
                                                onChange={(e) => handleInputChange('address.state', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="country">Country</Label>
                                            <Input
                                                id="country"
                                                placeholder="Enter country"
                                                value={formData.address.country}
                                                onChange={(e) => handleInputChange('address.country', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="postalCode">Postal Code</Label>
                                            <Input
                                                id="postalCode"
                                                placeholder="Enter postal code"
                                                value={formData.address.postalCode}
                                                onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="latitude">Latitude</Label>
                                            <Input
                                                id="latitude"
                                                type="number"
                                                step="any"
                                                placeholder="Enter latitude"
                                                value={formData.latitude}
                                                onChange={(e) => handleInputChange('latitude', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="longitude">Longitude</Label>
                                            <Input
                                                id="longitude"
                                                type="number"
                                                step="any"
                                                placeholder="Enter longitude"
                                                value={formData.longitude}
                                                onChange={(e) => handleInputChange('longitude', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gpsCoordinates">GPS Coordinates</Label>
                                        <Input
                                            id="gpsCoordinates"
                                            placeholder="Enter GPS coordinates"
                                            value={formData.gpsCoordinates}
                                            onChange={(e) => handleInputChange('gpsCoordinates', e.target.value)}
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="business" className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="annualRevenue">
                                                Annual Revenue
                                                {isClient && <span className="ml-2 text-xs text-muted-foreground">(Read Only)</span>}
                                            </Label>
                                            <Input
                                                id="annualRevenue"
                                                type="number"
                                                placeholder="Enter annual revenue"
                                                value={formData.annualRevenue}
                                                onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
                                                disabled={isClient}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lifetimeValue">
                                                Lifetime Value
                                                {isClient && <span className="ml-2 text-xs text-muted-foreground">(Read Only)</span>}
                                            </Label>
                                            <Input
                                                id="lifetimeValue"
                                                type="number"
                                                placeholder="Enter lifetime value"
                                                value={formData.lifetimeValue}
                                                onChange={(e) => handleInputChange('lifetimeValue', e.target.value)}
                                                disabled={isClient}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="creditLimit">
                                                Credit Limit
                                                {isClient && <span className="ml-2 text-xs text-muted-foreground">(Read Only)</span>}
                                            </Label>
                                            <Input
                                                id="creditLimit"
                                                type="number"
                                                placeholder="Enter credit limit"
                                                value={formData.creditLimit}
                                                onChange={(e) => handleInputChange('creditLimit', e.target.value)}
                                                disabled={isClient}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="outstandingBalance">
                                                Outstanding Balance
                                                {isClient && <span className="ml-2 text-xs text-muted-foreground">(Read Only)</span>}
                                            </Label>
                                            <Input
                                                id="outstandingBalance"
                                                type="number"
                                                placeholder="Enter outstanding balance"
                                                value={formData.outstandingBalance}
                                                onChange={(e) => handleInputChange('outstandingBalance', e.target.value)}
                                                disabled={isClient}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="priceTier">
                                            Price Tier
                                            {isClient && <span className="ml-2 text-xs text-muted-foreground">(Read Only)</span>}
                                        </Label>
                                        <Select
                                            value={formData.priceTier}
                                            onValueChange={(value) => handleInputChange('priceTier', value)}
                                            disabled={isClient}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select price tier" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="standard">Standard</SelectItem>
                                                <SelectItem value="discount">Discount</SelectItem>
                                                <SelectItem value="premium">Premium</SelectItem>
                                                <SelectItem value="wholesale">Wholesale</SelectItem>
                                                <SelectItem value="enterprise">Enterprise</SelectItem>
                                                <SelectItem value="custom">Custom</SelectItem>
                                                <SelectItem value="vip">VIP</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentTerms">
                                            Payment Terms
                                            {isClient && <span className="ml-2 text-xs text-muted-foreground">(Read Only)</span>}
                                        </Label>
                                        <Input
                                            id="paymentTerms"
                                            placeholder="Enter payment terms (e.g., Net 30)"
                                            value={formData.paymentTerms}
                                            onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                                            disabled={isClient}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="preferredPaymentMethod">
                                            Preferred Payment Method
                                            {isClient && <span className="ml-2 text-xs text-muted-foreground">(Read Only)</span>}
                                        </Label>
                                        <Select
                                            value={formData.preferredPaymentMethod}
                                            onValueChange={(value) => handleInputChange('preferredPaymentMethod', value)}
                                            disabled={isClient}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select payment method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                <SelectItem value="credit_card">Credit Card</SelectItem>
                                                <SelectItem value="debit_card">Debit Card</SelectItem>
                                                <SelectItem value="cash">Cash</SelectItem>
                                                <SelectItem value="check">Check</SelectItem>
                                                <SelectItem value="mobile_payment">Mobile Payment</SelectItem>
                                                <SelectItem value="paypal">PayPal</SelectItem>
                                                <SelectItem value="invoice">Invoice</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="discountPercentage">
                                            Discount Percentage
                                            {isClient && <span className="ml-2 text-xs text-muted-foreground">(Read Only)</span>}
                                        </Label>
                                        <Input
                                            id="discountPercentage"
                                            type="number"
                                            min="0"
                                            max="100"
                                            placeholder="Enter discount percentage"
                                            value={formData.discountPercentage}
                                            onChange={(e) => handleInputChange('discountPercentage', e.target.value)}
                                            disabled={isClient}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="acquisitionChannel">
                                            Acquisition Channel
                                            {isClient && <span className="ml-2 text-xs text-muted-foreground">(Read Only)</span>}
                                        </Label>
                                        <Select
                                            value={formData.acquisitionChannel}
                                            onValueChange={(value) => handleInputChange('acquisitionChannel', value)}
                                            disabled={isClient}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select acquisition channel" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="referral">Referral</SelectItem>
                                                <SelectItem value="direct">Direct</SelectItem>
                                                <SelectItem value="social_media">Social Media</SelectItem>
                                                <SelectItem value="online_ad">Online Ad</SelectItem>
                                                <SelectItem value="organic_search">Organic Search</SelectItem>
                                                <SelectItem value="email_campaign">Email Campaign</SelectItem>
                                                <SelectItem value="trade_show">Trade Show</SelectItem>
                                                <SelectItem value="cold_call">Cold Call</SelectItem>
                                                <SelectItem value="partner">Partner</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="riskLevel">
                                            Risk Level
                                            {isClient && <span className="ml-2 text-xs text-muted-foreground">(Read Only)</span>}
                                        </Label>
                                        <Select
                                            value={formData.riskLevel}
                                            onValueChange={(value) => handleInputChange('riskLevel', value)}
                                            disabled={isClient}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select risk level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="critical">Critical</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="acquisitionDate">
                                                Acquisition Date
                                                {isClient && <span className="ml-2 text-xs text-muted-foreground">(Read Only)</span>}
                                            </Label>
                                            <Input
                                                id="acquisitionDate"
                                                type="date"
                                                value={formData.acquisitionDate}
                                                onChange={(e) => handleInputChange('acquisitionDate', e.target.value)}
                                                disabled={isClient}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="birthday">
                                                Birthday
                                                {isClient && <span className="ml-2 text-xs text-muted-foreground">(Read Only)</span>}
                                            </Label>
                                            <Input
                                                id="birthday"
                                                type="date"
                                                value={formData.birthday}
                                                onChange={(e) => handleInputChange('birthday', e.target.value)}
                                                disabled={isClient}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="anniversaryDate">
                                                Anniversary Date
                                                {isClient && <span className="ml-2 text-xs text-muted-foreground">(Read Only)</span>}
                                            </Label>
                                            <Input
                                                id="anniversaryDate"
                                                type="date"
                                                value={formData.anniversaryDate}
                                                onChange={(e) => handleInputChange('anniversaryDate', e.target.value)}
                                                disabled={isClient}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastVisitDate">
                                                Last Visit Date
                                                {isClient && <span className="ml-2 text-xs text-muted-foreground">(Read Only)</span>}
                                            </Label>
                                            <Input
                                                id="lastVisitDate"
                                                type="date"
                                                value={formData.lastVisitDate}
                                                onChange={(e) => handleInputChange('lastVisitDate', e.target.value)}
                                                disabled={isClient}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nextContactDate">
                                            Next Contact Date
                                            {isClient && <span className="ml-2 text-xs text-muted-foreground">(Read Only)</span>}
                                        </Label>
                                        <Input
                                            id="nextContactDate"
                                            type="date"
                                            value={formData.nextContactDate}
                                            onChange={(e) => handleInputChange('nextContactDate', e.target.value)}
                                            disabled={isClient}
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="preferences" className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="preferredLanguage">Preferred Language</Label>
                                            <Select value={formData.preferredLanguage} onValueChange={(value) => handleInputChange('preferredLanguage', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select preferred language" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="English">English</SelectItem>
                                                    <SelectItem value="Afrikaans">Afrikaans</SelectItem>
                                                    <SelectItem value="Zulu">Zulu</SelectItem>
                                                    <SelectItem value="Xhosa">Xhosa</SelectItem>
                                                    <SelectItem value="Sotho">Sotho</SelectItem>
                                                    <SelectItem value="Tswana">Tswana</SelectItem>
                                                    <SelectItem value="Venda">Venda</SelectItem>
                                                    <SelectItem value="Tsonga">Tsonga</SelectItem>
                                                    <SelectItem value="Swati">Swati</SelectItem>
                                                    <SelectItem value="Ndebele">Ndebele</SelectItem>
                                                    <SelectItem value="Pedi">Pedi</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
                                            <Select value={formData.preferredContactMethod} onValueChange={(value) => handleInputChange('preferredContactMethod', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select preferred contact method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="email">Email</SelectItem>
                                                    <SelectItem value="phone">Phone</SelectItem>
                                                    <SelectItem value="sms">SMS</SelectItem>
                                                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                                    <SelectItem value="in-person">In Person</SelectItem>
                                                    <SelectItem value="mail">Mail</SelectItem>
                                                    <SelectItem value="video-call">Video Call</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="satisfactionScore">Satisfaction Score (0-10)</Label>
                                            <Input
                                                id="satisfactionScore"
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="0.1"
                                                placeholder="Enter satisfaction score"
                                                value={formData.satisfactionScore}
                                                onChange={(e) => handleInputChange('satisfactionScore', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="npsScore">NPS Score (-10 to 10)</Label>
                                            <Input
                                                id="npsScore"
                                                type="number"
                                                min="-10"
                                                max="10"
                                                placeholder="Enter NPS score"
                                                value={formData.npsScore}
                                                onChange={(e) => handleInputChange('npsScore', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                                        <Input
                                            id="tags"
                                            placeholder="Enter tags separated by commas"
                                            value={formData.tags}
                                            onChange={(e) => handleInputChange('tags', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="visibleCategories">Visible Categories (comma-separated)</Label>
                                        <Input
                                            id="visibleCategories"
                                            placeholder="Enter visible categories separated by commas"
                                            value={formData.visibleCategories}
                                            onChange={(e) => handleInputChange('visibleCategories', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-sm font-medium">Social Profiles</Label>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Globe className="w-4 h-4" />
                                                <Input
                                                    placeholder="LinkedIn URL"
                                                    value={formData.socialProfiles.linkedin}
                                                    onChange={(e) => handleInputChange('socialProfiles.linkedin', e.target.value)}
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Globe className="w-4 h-4" />
                                                <Input
                                                    placeholder="Twitter URL"
                                                    value={formData.socialProfiles.twitter}
                                                    onChange={(e) => handleInputChange('socialProfiles.twitter', e.target.value)}
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Globe className="w-4 h-4" />
                                                <Input
                                                    placeholder="Facebook URL"
                                                    value={formData.socialProfiles.facebook}
                                                    onChange={(e) => handleInputChange('socialProfiles.facebook', e.target.value)}
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Globe className="w-4 h-4" />
                                                <Input
                                                    placeholder="Instagram URL"
                                                    value={formData.socialProfiles.instagram}
                                                    onChange={(e) => handleInputChange('socialProfiles.instagram', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-sm font-medium">
                                            Geofencing Settings
                                            {isClient && <span className="ml-2 text-xs text-muted-foreground">(Read Only)</span>}
                                        </Label>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="enableGeofence"
                                                    checked={formData.enableGeofence === 'true'}
                                                    onCheckedChange={(checked: boolean) => handleInputChange('enableGeofence', checked ? 'true' : 'false')}
                                                    disabled={isClient}
                                                />
                                                <Label htmlFor="enableGeofence">Enable Geofencing</Label>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="geofenceType">Geofence Type</Label>
                                                <Select
                                                    value={formData.geofenceType}
                                                    onValueChange={(value) => handleInputChange('geofenceType', value)}
                                                    disabled={isClient}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select geofence type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        <SelectItem value="notify">Notify</SelectItem>
                                                        <SelectItem value="alert">Alert</SelectItem>
                                                        <SelectItem value="restricted">Restricted</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="geofenceRadius">Geofence Radius (meters)</Label>
                                                <Input
                                                    id="geofenceRadius"
                                                    type="number"
                                                    min="100"
                                                    max="5000"
                                                    placeholder="Enter radius in meters"
                                                    value={formData.geofenceRadius}
                                                    onChange={(e) => handleInputChange('geofenceRadius', e.target.value)}
                                                    disabled={isClient}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="flex justify-end pt-4 space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditModalOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="text-white bg-purple-600 hover:bg-purple-700"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Building2 className="w-5 h-5 text-purple-600" />
                            <span>Basic Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium">Company Name</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.name || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Contact Person</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.contactPerson || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Category</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.category || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Industry</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.industry || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Company Size</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.companySize || 'Not provided'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Phone className="w-5 h-5 text-purple-600" />
                            <span>Contact Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium">Email</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.email || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Phone</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.phone || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Alternative Phone</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.alternativePhone || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Website</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.website || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Preferred Language</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.preferredLanguage || 'Not provided'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Address Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <MapPin className="w-5 h-5 text-purple-600" />
                            <span>Address Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {clientProfile.address ? (
                            <>
                                <div>
                                    <Label className="text-sm font-medium">Street</Label>
                                    <p className="text-sm text-muted-foreground">{clientProfile.address.street || 'Not provided'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Suburb</Label>
                                    <p className="text-sm text-muted-foreground">{clientProfile.address.suburb || 'Not provided'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">City</Label>
                                    <p className="text-sm text-muted-foreground">{clientProfile.address.city || 'Not provided'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">State</Label>
                                    <p className="text-sm text-muted-foreground">{clientProfile.address.state || 'Not provided'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Country</Label>
                                    <p className="text-sm text-muted-foreground">{clientProfile.address.country || 'Not provided'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Postal Code</Label>
                                    <p className="text-sm text-muted-foreground">{clientProfile.address.postalCode || 'Not provided'}</p>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">No address information provided</p>
                        )}
                    </CardContent>
                </Card>

                {/* Business Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <CreditCard className="w-5 h-5 text-purple-600" />
                            <span>Business Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium">Price Tier</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.priceTier || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Payment Terms</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.paymentTerms || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Credit Limit</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.creditLimit || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Outstanding Balance</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.outstandingBalance || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Lifetime Value</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.lifetimeValue || 'Not provided'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Financial Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                            <span>Financial Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium">Annual Revenue</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.annualRevenue || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Discount Percentage</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.discountPercentage ? `${clientProfile.discountPercentage}%` : 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Preferred Payment Method</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.preferredPaymentMethod || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Risk Level</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.riskLevel || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Acquisition Channel</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.acquisitionChannel || 'Not provided'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Metrics & Scores */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Zap className="w-5 h-5 text-purple-600" />
                            <span>Metrics & Scores</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium">Satisfaction Score</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.satisfactionScore || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">NPS Score</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.npsScore || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Preferred Contact Method</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.preferredContactMethod || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Client Type</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.type || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Status</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.status || 'Not provided'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Social Profiles */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Globe className="w-5 h-5 text-purple-600" />
                            <span>Social Profiles</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {clientProfile.socialProfiles ? (
                            <>
                                <div>
                                    <Label className="text-sm font-medium">LinkedIn</Label>
                                    <p className="text-sm break-all text-muted-foreground">{clientProfile.socialProfiles.linkedin || 'Not provided'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Twitter</Label>
                                    <p className="text-sm break-all text-muted-foreground">{clientProfile.socialProfiles.twitter || 'Not provided'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Facebook</Label>
                                    <p className="text-sm break-all text-muted-foreground">{clientProfile.socialProfiles.facebook || 'Not provided'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Instagram</Label>
                                    <p className="text-sm break-all text-muted-foreground">{clientProfile.socialProfiles.instagram || 'Not provided'}</p>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">No social profiles provided</p>
                        )}
                    </CardContent>
                </Card>

                {/* Geofencing */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Navigation className="w-5 h-5 text-purple-600" />
                            <span>Geofencing</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium">Enabled</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.enableGeofence ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Type</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.geofenceType || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Radius</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.geofenceRadius ? `${clientProfile.geofenceRadius}m` : 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">GPS Coordinates</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.gpsCoordinates || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Latitude</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.latitude || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Longitude</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.longitude || 'Not provided'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Important Dates */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-purple-600" />
                            <span>Important Dates</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium">Birthday</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.birthday || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Anniversary Date</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.anniversaryDate || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Acquisition Date</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.acquisitionDate || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Last Visit Date</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.lastVisitDate || 'Not provided'}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Next Contact Date</Label>
                            <p className="text-sm text-muted-foreground">{clientProfile.nextContactDate || 'Not provided'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Tags */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Tag className="w-5 h-5 text-purple-600" />
                            <span>Tags</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {clientProfile.tags && clientProfile.tags.length > 0 ? (
                                clientProfile.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary">
                                        {tag}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No tags assigned</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Visible Categories */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Factory className="w-5 h-5 text-purple-600" />
                            <span>Visible Categories</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {clientProfile.visibleCategories && clientProfile.visibleCategories.length > 0 ? (
                                clientProfile.visibleCategories.map((category, index) => (
                                    <Badge key={index} variant="outline">
                                        {category}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No categories assigned</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Organization */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Users className="w-5 h-5 text-purple-600" />
                            <span>Organization</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {clientProfile.organisation ? (
                            <>
                                <div>
                                    <Label className="text-sm font-medium">Organization Name</Label>
                                    <p className="text-sm text-muted-foreground">{clientProfile.organisation.name || 'Not provided'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Organization Email</Label>
                                    <p className="text-sm text-muted-foreground">{clientProfile.organisation.email || 'Not provided'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Organization Phone</Label>
                                    <p className="text-sm text-muted-foreground">{clientProfile.organisation.phone || 'Not provided'}</p>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">No organization information</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Description */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Briefcase className="w-5 h-5 text-purple-600" />
                        <span>Description</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {clientProfile.description || 'No description provided'}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
