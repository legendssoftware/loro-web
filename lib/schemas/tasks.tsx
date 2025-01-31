import * as z from 'zod'
import { Priority, RepetitionType, TaskStatus, TaskType, TargetCategory } from '../enums/task.enums'

export const taskFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    taskType: z.nativeEnum(TaskType),
    priority: z.nativeEnum(Priority),
    deadline: z.date().optional(),
    repetitionType: z.nativeEnum(RepetitionType),
    repetitionEndDate: z.date().optional(),
    attachments: z.array(z.string()).optional().default([]),
    assignees: z.array(z.object({
        uid: z.number()
    })).min(1, "At least one assignee is required"),
    client: z.object({
        uid: z.number(),
        name: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        contactPerson: z.string().optional()
    }),
    targetCategory: z.nativeEnum(TargetCategory),
    subtasks: z.array(z.object({
        title: z.string().min(1, "Subtask title is required"),
        description: z.string().optional(),
        status: z.nativeEnum(TaskStatus).default(TaskStatus.PENDING)
    })).default([]),
    status: z.nativeEnum(TaskStatus).default(TaskStatus.PENDING),
    comment: z.string().optional(),
    notes: z.string().optional(),
    progress: z.number().default(0)
})

export type TaskFormSchema = z.infer<typeof taskFormSchema>
