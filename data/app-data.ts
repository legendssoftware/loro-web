import { TaskStatus } from "@/lib/enums/task.enums";
import {
  ClaimStatus,
  ClaimCategory,
  MerchandiseStatus,
} from "@/lib/types/claims";
import { LeadStatus } from "@/lib/types/leads";
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
} from "lucide-react";

export const status = [
  { value: "Active", label: "Active", icon: CheckCircle2 },
  { value: "Inactive", label: "Inactive", icon: XCircle },
] as const;

export const taskTypes = [
  { value: "email", label: "Email", icon: Mail },
  { value: "call", label: "Call", icon: Phone },
  { value: "visit", label: "Visit", icon: UserCheck },
  { value: "meeting", label: "Meeting", icon: Users },
  { value: "other", label: "Other", icon: HelpCircle },
];

export const generalStatuses = [
  { value: "Pending", label: "Pending", icon: Clock },
  { value: "Missed", label: "Missed", icon: AlertCircle },
  { value: "Completed", label: "Completed", icon: CheckCircle2 },
  { value: "Cancelled", label: "Cancelled", icon: Ban },
] as const;

export const claimStatuses = [
  { label: "Paid", value: ClaimStatus.PAID, icon: CircleDollarSign },
  { label: "Pending", value: ClaimStatus.PENDING, icon: Clock },
  { label: "Approved", value: ClaimStatus.APPROVED, icon: ClipboardCheck },
  { label: "Declined", value: ClaimStatus.DECLINED, icon: FileX },
];

export const claimCategories = [
  { label: "General", value: ClaimCategory.GENERAL, icon: FileQuestion },
  { label: "Promotion", value: ClaimCategory.PROMOTION, icon: Megaphone },
  { label: "Event", value: ClaimCategory.EVENT, icon: Calendar },
  { label: "Announcement", value: ClaimCategory.ANNOUNCEMENT, icon: Megaphone },
  { label: "Hotel", value: ClaimCategory.HOTEL, icon: Hotel },
  { label: "Travel", value: ClaimCategory.TRAVEL, icon: Plane },
  { label: "Transport", value: ClaimCategory.TRANSPORT, icon: Car },
  {
    label: "Other Expenses",
    value: ClaimCategory.OTHER_EXPENSES,
    icon: Wallet,
  },
  { label: "Accommodation", value: ClaimCategory.ACCOMMODATION, icon: Home },
  { label: "Meals", value: ClaimCategory.MEALS, icon: UtensilsCrossed },
  { label: "Transportation", value: ClaimCategory.TRANSPORTATION, icon: Bus },
  {
    label: "Entertainment",
    value: ClaimCategory.ENTERTAINMENT,
    icon: PartyPopper,
  },
  { label: "Other", value: ClaimCategory.OTHER, icon: HelpCircle },
];

export const taskStatuses = [
  { label: "Pending", value: TaskStatus.PENDING, icon: Clock },
  { label: "In Progress", value: TaskStatus.IN_PROGRESS, icon: PlayCircle },
  { label: "Completed", value: TaskStatus.COMPLETED, icon: CheckCheck },
  { label: "Cancelled", value: TaskStatus.CANCELLED, icon: Ban },
  { label: "Overdue", value: TaskStatus.OVERDUE, icon: TimerOff },
];

export const roles = [
  { label: "User", value: "USER", icon: User },
  { label: "Admin", value: "ADMIN", icon: ShieldCheck },
  { label: "Manager", value: "MANAGER", icon: Building2 },
];

export const leadStatuses = [
  { label: "Pending", value: LeadStatus.PENDING, icon: Clock },
  { label: "Approved", value: LeadStatus.APPROVED, icon: CheckCircle2 },
  { label: "Review", value: LeadStatus.REVIEW, icon: CircleEllipsis },
  { label: "Declined", value: LeadStatus.DECLINED, icon: UserX },
];

export const merchandiseStatuses = [
  { label: "Pending", value: MerchandiseStatus.PENDING, icon: ShoppingBag },
  { label: "Reviewed", value: MerchandiseStatus.REVIEW, icon: Search },
];

export enum QuotationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  DECLINED = "DECLINED",
}

export const quotationStatuses = [
  { label: "Pending", value: QuotationStatus.PENDING, icon: Clock },
  { label: "Approved", value: QuotationStatus.APPROVED, icon: CheckCircle2 },
  { label: "Declined", value: QuotationStatus.DECLINED, icon: FileX },
];
