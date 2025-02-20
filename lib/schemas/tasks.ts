import * as z from 'zod';

const baseTaskSchema = {
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    taskType: z.enum(['MEETING', 'CALL', 'EMAIL', 'OTHER']),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    deadline: z.date().optional(),
    repetitionType: z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY']),
    repetitionEndDate: z.date().optional(),
    attachments: z.array(z.string()).default([]),
    assignees: z
        .array(
            z.object({
                uid: z.number(),
            }),
        )
        .default([]),
    subtasks: z
        .array(
            z.object({
                title: z.string(),
                description: z.string(),
                status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
            }),
        )
        .default([]),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).default('PENDING'),
    comment: z.string().optional(),
    notes: z.string().optional(),
    progress: z.number().min(0).max(100).default(0),
};

export const taskFormSchema = z.discriminatedUnion('hasClient', [
    // Schema for tasks with client
    z.object({
        ...baseTaskSchema,
        hasClient: z.literal(true),
        client: z.object({
            uid: z.number(),
        }),
        targetCategory: z.null(),
    }),
    // Schema for tasks with category
    z.object({
        ...baseTaskSchema,
        hasClient: z.literal(false),
        client: z.null(),
        targetCategory: z.enum(['standard', 'construction', 'hardware', 'contract']),
    }),
]);

export type TaskFormType = z.infer<typeof taskFormSchema>;
