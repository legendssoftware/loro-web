import { memo } from 'react'
import { ExistingTask } from '@/lib/types/tasks'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { Priority } from '@/lib/enums/task.enums'
import { Avatar, AvatarImage } from '@/components/ui/avatar'

interface TaskCardProps {
    task: ExistingTask
    onClick: (task: ExistingTask) => void
}

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 20,
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24,
        }
    },
}

export const TaskCard = memo(({ task, onClick }: TaskCardProps) => {
    return (
        <motion.div
            variants={itemVariants}
            layout
        >
            <Card
                className="transition-colors shadow-none cursor-pointer bg-card hover:border-primary/40 border-border"
                onClick={() => onClick(task)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onClick(task)}
                aria-label={`Task: ${task.description}`}>
                <CardContent className="flex flex-col justify-between h-full gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <Badge
                            variant="secondary"
                            className={cn(
                                "font-body text-[10px] uppercase",
                                task?.priority === Priority.HIGH && "bg-red-100 text-red-600",
                                task?.priority === Priority.MEDIUM && "bg-yellow-100 text-yellow-600",
                                task?.priority === Priority.LOW && "bg-green-100 text-green-600"
                            )}>
                            {task?.priority}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={cn(
                                "font-body text-[10px] uppercase",
                                task?.status === "PENDING" && "bg-yellow-100 text-yellow-600 border-yellow-200",
                                task?.status === "IN_PROGRESS" && "bg-blue-100 text-blue-600 border-blue-200",
                                task?.status === "COMPLETED" && "bg-green-100 text-green-600 border-green-200"
                            )}>
                            {task?.status && task?.status?.replace("_", " ")}
                        </Badge>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-sm font-normal leading-tight uppercase font-body text-card-foreground">
                            {task?.title?.length > 20 ? task?.title?.slice(0, 20) + "..." : task?.title}
                        </h3>
                        <p className="text-xs font-normal uppercase font-body text-muted-foreground">
                            {task?.clients?.length > 1
                                ? `${task?.clients?.length} Clients - ${task?.targetCategory}`
                                : task?.clients?.[0]?.name}
                        </p>
                    </div>
                    <div className="flex flex-row items-center justify-between space-y-4">
                        <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[10px] font-body text-muted-foreground uppercase">
                                    {task?.deadline ? format(new Date(task?.deadline), "MMM dd, yyyy") : "No deadline"}
                                </span>
                            </div>
                        </div>
                        <div>
                            {
                                task?.assignees?.map((assignee) => (
                                    <Avatar
                                        key={assignee?.uid}
                                        className="w-8 h-8 ring-2 ring-primary">
                                        {assignee?.photoURL && (
                                            <AvatarImage
                                                src={assignee?.photoURL}
                                                alt={`${assignee?.name}`}
                                            />
                                        )}
                                    </Avatar>
                                ))
                            }
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
})

TaskCard.displayName = 'TaskCard' 