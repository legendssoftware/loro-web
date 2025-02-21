import { TaskStatus } from '@/lib/enums/task.enums';
import { ClaimStatus, ClaimCategory, MerchandiseStatus } from '@/lib/types/claims';
import { LeadStatus } from '@/lib/types/leads';
import { PricingPlan } from '@/lib/types/pricing';
import {
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Ban,
    Mail,
    Phone,
    UserCheck,
    Users,
    Calendar,
    HelpCircle,
    CircleDollarSign,
    ClipboardCheck,
    FileX,
    UserX,
    ShieldCheck,
    Building2,
    Plane,
    Hotel,
    Car,
    Wallet,
    Home,
    UtensilsCrossed,
    Bus,
    PartyPopper,
    FileQuestion,
    Megaphone,
    CircleEllipsis,
    CheckCheck,
    TimerOff,
    PlayCircle,
    ShoppingBag,
    Search,
    User,
    Building,
    Store,
} from 'lucide-react';

export const status = [
    { value: 'Active', label: 'Active', icon: CheckCircle2 },
    { value: 'Inactive', label: 'Inactive', icon: XCircle },
] as const;

export const taskTypes = [
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'call', label: 'Call', icon: Phone },
    { value: 'visit', label: 'Visit', icon: UserCheck },
    { value: 'meeting', label: 'Meeting', icon: Users },
    { value: 'other', label: 'Other', icon: HelpCircle },
];

export const generalStatuses = [
    { value: 'Pending', label: 'Pending', icon: Clock },
    { value: 'Missed', label: 'Missed', icon: AlertCircle },
    { value: 'Completed', label: 'Completed', icon: CheckCircle2 },
    { value: 'Cancelled', label: 'Cancelled', icon: Ban },
] as const;

export const claimStatuses = [
    { label: 'Paid', value: ClaimStatus.PAID, icon: CircleDollarSign },
    { label: 'Pending', value: ClaimStatus.PENDING, icon: Clock },
    { label: 'Approved', value: ClaimStatus.APPROVED, icon: ClipboardCheck },
    { label: 'Declined', value: ClaimStatus.DECLINED, icon: FileX },
];

export const claimCategories = [
    { label: 'General', value: ClaimCategory.GENERAL, icon: FileQuestion },
    { label: 'Promotion', value: ClaimCategory.PROMOTION, icon: Megaphone },
    { label: 'Event', value: ClaimCategory.EVENT, icon: Calendar },
    { label: 'Announcement', value: ClaimCategory.ANNOUNCEMENT, icon: Megaphone },
    { label: 'Hotel', value: ClaimCategory.HOTEL, icon: Hotel },
    { label: 'Travel', value: ClaimCategory.TRAVEL, icon: Plane },
    { label: 'Transport', value: ClaimCategory.TRANSPORT, icon: Car },
    {
        label: 'Other Expenses',
        value: ClaimCategory.OTHER_EXPENSES,
        icon: Wallet,
    },
    { label: 'Accommodation', value: ClaimCategory.ACCOMMODATION, icon: Home },
    { label: 'Meals', value: ClaimCategory.MEALS, icon: UtensilsCrossed },
    { label: 'Transportation', value: ClaimCategory.TRANSPORTATION, icon: Bus },
    {
        label: 'Entertainment',
        value: ClaimCategory.ENTERTAINMENT,
        icon: PartyPopper,
    },
    { label: 'Other', value: ClaimCategory.OTHER, icon: HelpCircle },
];

export const taskStatuses = [
    { label: 'Pending', value: TaskStatus.PENDING, icon: Clock },
    { label: 'In Progress', value: TaskStatus.IN_PROGRESS, icon: PlayCircle },
    { label: 'Completed', value: TaskStatus.COMPLETED, icon: CheckCheck },
    { label: 'Cancelled', value: TaskStatus.CANCELLED, icon: Ban },
    { label: 'Overdue', value: TaskStatus.OVERDUE, icon: TimerOff },
];

export const roles = [
    { label: 'User', value: 'USER', icon: User },
    { label: 'Admin', value: 'ADMIN', icon: ShieldCheck },
    { label: 'Manager', value: 'MANAGER', icon: Building2 },
];

export const leadStatuses = [
    { label: 'Pending', value: LeadStatus.PENDING, icon: Clock },
    { label: 'Approved', value: LeadStatus.APPROVED, icon: CheckCircle2 },
    { label: 'Review', value: LeadStatus.REVIEW, icon: CircleEllipsis },
    { label: 'Declined', value: LeadStatus.DECLINED, icon: UserX },
];

export const merchandiseStatuses = [
    { label: 'Pending', value: MerchandiseStatus.PENDING, icon: ShoppingBag },
    { label: 'Reviewed', value: MerchandiseStatus.REVIEW, icon: Search },
];

export enum QuotationStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    DECLINED = 'DECLINED',
}

export const quotationStatuses = [
    { label: 'Pending', value: QuotationStatus.PENDING, icon: Clock },
    { label: 'Approved', value: QuotationStatus.APPROVED, icon: CheckCircle2 },
    { label: 'Declined', value: QuotationStatus.DECLINED, icon: FileX },
];

export const productStatuses = [
    {
        value: 'active',
        label: 'Active',
    },
    {
        value: 'inactive',
        label: 'Inactive',
    },
    {
        value: 'hidden',
        label: 'Hidden',
    },
    {
        value: 'special',
        label: 'Special',
    },
    {
        value: 'new',
        label: 'New',
    },
    {
        value: 'discontinued',
        label: 'Discontinued',
    },
    {
        value: 'bestseller',
        label: 'Best Seller',
    },
    {
        value: 'hotdeals',
        label: 'Hot Deals',
    },
    {
        value: 'outofstock',
        label: 'Out of Stock',
    },
] as const;

export const productCategories = [
    { value: 'FRESH_PRODUCE', label: 'Fresh Produce' },
    { value: 'MEAT_POULTRY', label: 'Meat & Poultry' },
    { value: 'DAIRY_EGGS', label: 'Dairy & Eggs' },
    { value: 'BAKERY', label: 'Bakery' },
    { value: 'FROZEN_FOODS', label: 'Frozen Foods' },
    { value: 'PANTRY_STAPLES', label: 'Pantry Staples' },
    { value: 'BEVERAGES', label: 'Beverages' },
    { value: 'SNACKS', label: 'Snacks & Confectionery' },
    { value: 'CANNED_GOODS', label: 'Canned & Jarred Goods' },
    { value: 'DELI', label: 'Deli & Prepared Foods' },
    { value: 'SEAFOOD', label: 'Seafood' },
    { value: 'CONDIMENTS', label: 'Condiments & Sauces' },
    { value: 'BAKING', label: 'Baking Supplies' },
    { value: 'INTERNATIONAL', label: 'International Foods' },
    { value: 'ORGANIC', label: 'Organic & Natural' },
    { value: 'HOUSEHOLD', label: 'Household Essentials' },
    { value: 'TOOLS', label: 'Tools & Equipment' },
    { value: 'BUILDING_MATERIALS', label: 'Building Materials' },
    { value: 'ELECTRICAL', label: 'Electrical Supplies' },
    { value: 'PLUMBING', label: 'Plumbing Supplies' },
    { value: 'PAINT', label: 'Paint & Supplies' },
    { value: 'HARDWARE', label: 'Hardware & Fasteners' },
    { value: 'LIGHTING', label: 'Lighting & Electrical' },
    { value: 'FLOORING', label: 'Flooring & Tiles' },
    { value: 'DOORS_WINDOWS', label: 'Doors & Windows' },
    { value: 'OUTDOOR', label: 'Outdoor & Garden' },
    { value: 'SAFETY', label: 'Safety & Security' },
    { value: 'HVAC', label: 'HVAC & Climate Control' },
    { value: 'AUTOMOTIVE', label: 'Automotive Tools' },
    { value: 'STORAGE', label: 'Storage & Organization' },
    { value: 'CLEANING', label: 'Cleaning Supplies' },
    { value: 'POWER_TOOLS', label: 'Power Tools' },
    { value: 'OTHER', label: 'Other' },
] as const;

export const pricingPlans: PricingPlan[] = [
    {
        icon: Users,
        name: 'Starter',
        description: 'For small teams',
        price: 'R99',
        features: ['Up to 5 Users', '1 Branch', '5GB Storage', '10K API Calls', '2 Integrations'],
        buttonText: 'Get Started',
    },
    {
        icon: Store,
        name: 'Professional',
        description: 'For growing teams',
        price: 'R199',
        isPopular: true,
        features: ['Up to 20 Users', '3 Branches', '20GB Storage', '500K API Calls', '5 Integrations'],
        buttonText: 'Get Started',
    },
    {
        icon: Building2,
        name: 'Business',
        description: 'For larger organizations',
        price: 'R499',
        features: ['Up to 50 Users', '10 Branches', '100GB Storage', '2M API Calls', '15 Integrations'],
        buttonText: 'Get Started',
    },
    {
        icon: Building,
        name: 'Enterprise',
        description: 'Custom solutions',
        price: 'R999',
        features: ['Unlimited Users', 'Unlimited Branches', '1TB Storage', '10M API Calls', 'Unlimited Integrations'],
        buttonText: 'Contact Sales',
    },
];
