import { TaskStatus } from "@/lib/enums/task.enums";
import { ClaimStatus, ClaimCategory, MerchandiseStatus } from "@/lib/types/claims";
import { LeadStatus } from "@/lib/types/leads";

export const status = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
] as const;

export const taskTypes = [
  { value: "email", label: "Email" },
  { value: "call", label: "Call" },
  { value: "visit", label: "Visit" },
  { value: "meeting", label: "Meeting" },
  { value: "other", label: "Other" },
];

export const generalStatuses = [
  { value: "Pending", label: "Pending" },
  { value: "Missed", label: "Missed" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
] as const;

export const claimStatuses = [
  { label: "Paid", value: ClaimStatus.PAID },
  { label: "Pending", value: ClaimStatus.PENDING },
  { label: "Approved", value: ClaimStatus.APPROVED },
  { label: "Declined", value: ClaimStatus.DECLINED },
];

export const claimCategories = [
  { label: "General", value: ClaimCategory.GENERAL },
  { label: "Promotion", value: ClaimCategory.PROMOTION },
  { label: "Event", value: ClaimCategory.EVENT },
  { label: "Announcement", value: ClaimCategory.ANNOUNCEMENT },
  { label: "Hotel", value: ClaimCategory.HOTEL },
  { label: "Travel", value: ClaimCategory.TRAVEL },
  { label: "Transport", value: ClaimCategory.TRANSPORT },
  { label: "Other Expenses", value: ClaimCategory.OTHER_EXPENSES },
  { label: "Accommodation", value: ClaimCategory.ACCOMMODATION },
  { label: "Meals", value: ClaimCategory.MEALS },
  { label: "Transportation", value: ClaimCategory.TRANSPORTATION },
  { label: "Entertainment", value: ClaimCategory.ENTERTAINMENT },
  { label: "Other", value: ClaimCategory.OTHER },
];

export const taskStatuses = [
  { label: "Pending", value: TaskStatus.PENDING },
  { label: "In Progress", value: TaskStatus.IN_PROGRESS },
  { label: "Completed", value: TaskStatus.COMPLETED },
  { label: "Cancelled", value: TaskStatus.CANCELLED },
  { label: "Overdue", value: TaskStatus.OVERDUE },
];

export const roles = [
  { label: "User", value: "USER" },
  { label: "Admin", value: "ADMIN" },
  { label: "Manager", value: "MANAGER" },
];

export const leadStatuses = [
  { label: "Pending", value: LeadStatus.PENDING },
  { label: "Approved", value: LeadStatus.APPROVED },
  { label: "Review", value: LeadStatus.REVIEW },
  { label: "Declined", value: LeadStatus.DECLINED },
];


export const merchandiseStatuses = [
  { label: "Pending", value: MerchandiseStatus.PENDING },
  { label: "Reviewed", value: MerchandiseStatus.REVIEW },
];
