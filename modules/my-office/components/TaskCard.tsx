import { memo } from 'react'
import { Task } from '@/lib/types/tasks'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"

interface TaskCardProps {
    task: Task
    onClick: (task: Task) => void
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
                className="bg-card hover:border-primary/40 border-border shadow-none transition-colors cursor-pointer"
                onClick={() => onClick(task)}>
                <CardContent className="p-4 flex flex-col h-full justify-between gap-4">
                    <div className="flex items-center justify-between">
                        <Badge
                            variant="secondary"
                            className={cn(
                                "font-body text-[10px] uppercase",
                                task?.priority === "high" && "bg-red-100 text-red-600",
                                task?.priority === "medium" && "bg-yellow-100 text-yellow-600",
                                task?.priority === "low" && "bg-green-100 text-green-600"
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
                            {task?.status}
                        </Badge>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-body text-sm font-normal uppercase leading-tight text-card-foreground">
                            {task?.description?.length > 20 ? task?.description?.slice(0, 20) + "..." : task?.description}
                        </h3>
                        <p className="text-xs font-body font-normal uppercase text-muted-foreground">{task?.client?.name}</p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                                <span className="text-[10px] font-body text-muted-foreground uppercase">
                                    {task?.deadline ? format(new Date(task?.deadline), "MMM dd, yyyy") : "No deadline"}
                                </span>
                            </div>
                            <Avatar className="h-8 w-8 ring-2 ring-primary">
                                {task?.owner?.photoURL && (
                                    <AvatarImage
                                        src={task?.owner?.photoURL}
                                        alt={`${task?.owner?.name}`}
                                    />
                                )}
                                <AvatarFallback className="bg-black text-white text-[10px] font-body uppercase">
                                    {task?.owner?.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
})

TaskCard.displayName = 'TaskCard' 