import { LeadStatus } from "../types/leads";

export const LEAD_STATUSES = [
  { value: LeadStatus.APPROVED, label: "Approved" },
  { value: LeadStatus.REVIEW, label: "Under Review" },
  { value: LeadStatus.DECLINED, label: "Declined" },
  { value: LeadStatus.PENDING, label: "Pending" },
];
