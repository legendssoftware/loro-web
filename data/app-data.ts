export const generalStatuses = [
    { value: "all", label: "All Statuses" },
    { value: "Pending", label: "Pending" },
    { value: "Missed", label: "Missed" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" },
] as const

export const status = [
    { value: "all", label: "All" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
] as const

export const claimStatuses = [
    { value: "all", label: "All Statuses" },
    { value: "Pending", label: "Pending" },
    { value: "Paid", label: "Paid" },
    { value: "Declined", label: "Declined" },
    { value: "Approved", label: "Approved" },
] as const

export const taskTypes = [
    { value: "email", label: "Email" },
    { value: "call", label: "Call" },
    { value: "visit", label: "Visit" },
    { value: "meeting", label: "Meeting" },
    { value: "other", label: "Other" },
]
