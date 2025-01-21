'use client'

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Bell, ShoppingCart, ClipboardCheck, FileText, Clock } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

const notifications = [
    {
        id: 1,
        title: "New order received #ORD-1234",
        time: "2 mins ago",
        icon: <ShoppingCart className="h-4 w-4" />
    },
    {
        id: 2,
        title: "Claim #CLAIM-5678 approved",
        time: "5 mins ago",
        icon: <ClipboardCheck className="h-4 w-4" />
    },
    {
        id: 3,
        title: "Journal entry #JRN-2345 posted",
        time: "10 mins ago",
        icon: <FileText className="h-4 w-4" />
    },
    {
        id: 4,
        title: "Task #TASK-3456 completed",
        time: "15 mins ago",
        icon: <ClipboardCheck className="h-4 w-4" />
    },
    {
        id: 5,
        title: "Shift for employee #EMP-7890 has ended",
        time: "20 mins ago",
        icon: <Clock className="h-4 w-4" />
    },
    {
        id: 6,
        title: "Order #ORD-9012 ready for pickup",
        time: "30 mins ago",
        icon: <ShoppingCart className="h-4 w-4" />
    }
]

interface NotificationsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function NotificationsModal({ open, onOpenChange }: NotificationsModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center font-body uppercase">
                        6
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] p-0 rounded-xl">
                <div className="p-4 flex items-center justify-between border-b">
                    <DialogTitle className="text-xl font-body uppercase font-normal">
                        Notifications
                    </DialogTitle>
                </div>
                <ScrollArea className="h-[400px]">
                    <div className="p-4 space-y-2">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                            >
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-primary">{notification.icon}</span>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-xs font-normal font-body uppercase">
                                        {notification.title}
                                    </p>
                                    <p className="text-[9px] text-muted-foreground font-normal font-body uppercase">
                                        {notification.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
} 