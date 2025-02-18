import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { NewTaskForm } from "./new-task-form"
import type { CreateTaskDTO } from "@/helpers/tasks"

interface NewTaskModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: CreateTaskDTO) => Promise<void>
    isSubmitting: boolean
}

const NewTaskModalComponent = ({
    isOpen,
    onOpenChange,
    onSubmit,
    isSubmitting
}: NewTaskModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="default" size="sm">
                    <Plus size={16} strokeWidth={1.5} className="text-white" />
                    <p className="text-[10px] font-normal font-body uppercase text-white">Add</p>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>
                        <span className="text-xl uppercase font-body text-card-foreground">New Task</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs uppercase font-body text-card-foreground">
                        Create a new task by filling out the form below.
                    </DialogDescription>
                </DialogHeader>
                <NewTaskForm
                    onSubmit={onSubmit}
                    isSubmitting={isSubmitting}
                />
            </DialogContent>
        </Dialog>
    )
}

export const NewTaskModal = memo(NewTaskModalComponent) 