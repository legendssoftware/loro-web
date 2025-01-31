import { memo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ExistingTask, SubTask } from "@/lib/types/tasks"

interface EditTaskFormProps {
    task: ExistingTask
    onUpdate: () => Promise<void>
    onDelete: (uid: number) => Promise<void>
    isUpdating: boolean
    isDeleting: boolean
}

const EditTaskFormComponent = ({
    task,
    onUpdate,
    onDelete,
    isUpdating,
    isDeleting
}: EditTaskFormProps) => {
    return (
        <div>
            <ScrollArea className="h-[60vh] pr-4">
                <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <h3 className="text-xs font-body font-normal text-muted-foreground uppercase">
                            Clients: {task?.clients?.length} total
                        </h3>
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1 w-1/2">
                                <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">Name</p>
                                <p className="text-xs font-body font-normal text-card-foreground">{task?.clients?.[0]?.name}</p>
                            </div>
                            <div className="flex flex-col gap-1 w-1/2">
                                <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">Email</p>
                                <p className="text-xs font-body font-normal text-card-foreground">{task?.clients?.[0]?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1 w-1/2">
                                <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">address</p>
                                <p className="text-xs font-body font-normal text-card-foreground">{task?.clients?.[0]?.address}</p>
                            </div>
                            <div className="flex flex-col gap-1 w-1/2">
                                <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">Phone</p>
                                <p className="text-xs font-body font-normal text-card-foreground">{task?.clients?.[0]?.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1 w-1/2">
                                <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">Contact Person</p>
                                <p className="text-xs font-body font-normal text-card-foreground">{task?.clients?.[0]?.contactPerson}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xs font-body font-normal text-muted-foreground uppercase">
                            Task Details
                        </h3>
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1 w-1/2">
                                <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">Repetition</p>
                                <p className="text-xs font-body font-normal text-card-foreground">{task?.repetitionType}</p>
                            </div>
                            <div className="flex flex-col gap-1 w-1/2">
                                <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">repeats until</p>
                                <p className="text-xs font-body font-normal text-card-foreground">{task?.deadline ? format(new Date(task?.deadline), "MMM dd, yyyy") : "No deadline"}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1 w-1/2">
                                <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">Progress</p>
                                <p className="text-xs font-body font-normal text-card-foreground">{task?.progress} %</p>
                            </div>
                            <div className="flex flex-col gap-1 w-1/2">
                                <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">Last Updated</p>
                                <p className="text-xs font-body font-normal text-card-foreground">{task?.updatedAt ? format(new Date(task?.updatedAt), "MMM dd, yyyy") : "No deadline"}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1 w-1/2">
                                <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">Created</p>
                                <p className="text-xs font-body font-normal text-card-foreground">{task?.createdAt ? format(new Date(task?.createdAt), "MMM dd, yyyy") : "No deadline"}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xs font-body font-normal text-muted-foreground uppercase">
                            Task Milestones
                        </h3>
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1 w-full">
                                <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">Notes</p>
                                <p className="text-xs font-body font-normal text-card-foreground">{task?.notes}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1 w-full">
                                <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">Description</p>
                                <p className="text-xs font-body font-normal text-card-foreground">{task?.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1 w-full">
                                <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">comments</p>
                                <p className="text-xs font-body font-normal text-card-foreground">{task?.comment}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xs font-body font-normal text-muted-foreground uppercase">
                            Related Sub Tasks
                        </h3>
                        {
                            task?.subtasks?.map((subTask: SubTask) => (
                                <div key={subTask?.uid} className="flex items-center justify-between border rounded px-3 py-4 cursor-pointer hover:bg-accent/40">
                                    <p className="text-xs font-body font-normal text-card-foreground">{subTask?.title}</p>
                                    <Badge variant="outline" className={cn("font-body text-[10px] uppercase", subTask?.status === "COMPLETED" && "bg-green-100 text-green-600 border-green-200", subTask?.status !== "COMPLETED" && "bg-yellow-100 text-yellow-600 border-yellow-200")}>
                                        {subTask?.status}
                                    </Badge>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </ScrollArea>
            <div className="flex justify-between items-center border-t pt-4">
                <div className="flex items-center gap-2 w-full">
                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={onUpdate}
                        disabled={isUpdating}
                        className="w-full font-body text-sm uppercase bg-violet-500 hover:bg-violet-600 text-white"
                    >
                        {isUpdating ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                                <p className="text-white font-normal text-xs">Updating...</p>
                            </div>
                        ) : (
                            <p className="text-white font-normal text-xs">Update Task</p>
                        )}
                    </Button>
                    <Button
                        variant="destructive"
                        size="lg"
                        onClick={() => onDelete(task.uid)}
                        disabled={isDeleting}
                        className="w-full font-body text-sm uppercase"
                    >
                        {isDeleting ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                                <p className="text-white font-normal text-xs">Deleting...</p>
                            </div>
                        ) : (
                            <p className="text-white font-normal text-xs">Delete Task</p>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export const EditTaskForm = memo(EditTaskFormComponent) 