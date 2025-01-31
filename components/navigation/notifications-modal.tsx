'use client'

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Bell, ShoppingCart, ClipboardCheck, FileText, Clock, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery } from "@tanstack/react-query"
import { fetchUserNotifications } from "@/helpers/notifications"
import { useSessionStore } from "@/store/use-session-store"
import { RequestConfig } from "@/lib/types/tasks"

const getNotificationIcon = (type: string) => {
    switch (type?.toLowerCase()) {
        case 'order':
            return <ShoppingCart className="h-4 w-4" />
        case 'claim':
            return <ClipboardCheck className="h-4 w-4" />
        case 'journal':
            return <FileText className="h-4 w-4" />
        case 'task':
            return <ClipboardCheck className="h-4 w-4" />
        default:
            return <Clock className="h-4 w-4" />
    }
}

interface NotificationsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function NotificationsModal({ open, onOpenChange }: NotificationsModalProps) {
    const { accessToken, profileData } = useSessionStore()

    const config: RequestConfig = {
        headers: {
            token: `${accessToken}`,
        },
    }

    const { data: notificationsData, isLoading } = useQuery({
        queryKey: ['notifications', profileData?.uid],
        queryFn: () => fetchUserNotifications(Number(profileData?.uid), config),
        enabled: !!accessToken && !!profileData?.uid,
    })

    const unreadCount = notificationsData?.notification?.filter(n => n.status === 'PENDING')?.length || 0

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center font-body uppercase">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] p-0 rounded-xl">
                <div className="p-4 flex items-center justify-between border-b">
                    <DialogTitle className="text-xl font-body uppercase font-normal">
                        Notifications
                    </DialogTitle>
                </div>
                <ScrollArea className="h-[400px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : !notificationsData?.notification || notificationsData.notification.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[350px] gap-2">
                            <Bell className="text-card-foreground" size={32} strokeWidth={1} />
                            <p className="text-xs font-normal font-body uppercase text-card-foreground">All Clear! No Notifications</p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-2">
                            {notificationsData?.notification?.map((notification) => (
                                <div
                                    key={notification.uid}
                                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                                >
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-primary">{getNotificationIcon(notification.type)}</span>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-xs font-normal font-body uppercase">
                                            {notification.title}
                                        </p>
                                        <p className="text-[9px] text-muted-foreground font-normal font-body uppercase">
                                            {notification.recordAge}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
} 