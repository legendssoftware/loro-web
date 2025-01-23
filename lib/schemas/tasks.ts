import * as z from 'zod'

export const taskFormSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    comment: z.string().optional(),
    notes: z.string().optional(),
    status: z.string(),
    taskType: z.string(),
    deadline: z.date().optional(),
    priority: z.string(),
    progress: z.number(),
    repetitionType: z.string(),
    repetitionEndDate: z.date().optional(),
    attachments: z.any().nullable(),
    subtasks: z.array(z.object({
        title: z.string(),
        description: z.string()
    })),
    assignees: z.array(z.number()),
    client: z.number().optional()
}) 