import { TaskPriority, TaskType } from './types/task';

export const TaskTypeOptions = [
    { value: TaskType.IN_PERSON_MEETING, label: 'In Person Meeting' },
    { value: TaskType.VIRTUAL_MEETING, label: 'Virtual Meeting' },
    { value: TaskType.CALL, label: 'Call' },
    { value: TaskType.EMAIL, label: 'Email' },
    { value: TaskType.WHATSAPP, label: 'WhatsApp' },
    { value: TaskType.SMS, label: 'SMS' },
    { value: TaskType.FOLLOW_UP, label: 'Follow Up' },
    { value: TaskType.PROPOSAL, label: 'Proposal' },
    { value: TaskType.REPORT, label: 'Report' },
    { value: TaskType.QUOTATION, label: 'Quotation' },
    { value: TaskType.VISIT, label: 'Visit' },
    { value: TaskType.OTHER, label: 'Other' },
];

export const PriorityOptions = [
    { value: TaskPriority.LOW, label: 'Low' },
    { value: TaskPriority.MEDIUM, label: 'Medium' },
    { value: TaskPriority.HIGH, label: 'High' },
    { value: TaskPriority.URGENT, label: 'Urgent' },
];
