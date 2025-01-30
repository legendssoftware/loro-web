import { memo } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { EditTaskForm } from "./edit-task-form"
import type { ExistingTask } from "@/lib/types/tasks"

interface TaskDetailModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    selectedTask: ExistingTask | null
    onUpdate: () => Promise<void>
    onDelete: (uid: number) => Promise<void>
    isUpdating: boolean
    isDeleting: boolean
}

const TaskDetailModalComponent = ({
    isOpen,
    onOpenChange,
    selectedTask,
    onUpdate,
    onDelete,
    isUpdating,
    isDeleting
}: TaskDetailModalProps) => {
    if (!selectedTask) return null

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className={cn("font-body text-[10px] font-normal uppercase",
                                    selectedTask?.status === "COMPLETED" && "bg-green-100 text-green-600 border-green-200",
                                    selectedTask?.status !== "COMPLETED" && "bg-yellow-100 text-yellow-600 border-yellow-200")}>
                                {selectedTask?.status}
                            </Badge>
                            <span className="text-xl font-body text-card-foreground uppercase font-normal">
                                {selectedTask?.description && selectedTask?.description?.slice(0, 20)}
                            </span>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <EditTaskForm
                    task={selectedTask}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    isUpdating={isUpdating}
                    isDeleting={isDeleting}
                />
            </DialogContent>
        </Dialog>
    )
}

export const TaskDetailModal = memo(TaskDetailModalComponent) 