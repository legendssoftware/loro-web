'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Building2 } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSessionStore } from "@/store/use-session-store"

interface SideDrawerProps {
    isOpen: boolean
    onClose: () => void
}

const navigationItems = [
    {
        title: "HOME",
        icon: <LayoutDashboard size={18} strokeWidth={1.5} />,
        href: "/"
    },
    {
        title: "OFFICE",
        icon: <Building2 size={18} strokeWidth={1.5} />,
        href: "/my-office"
    },
]

export function SideDrawer({ isOpen, onClose }: SideDrawerProps) {
    const pathname = usePathname()
    const { profileData } = useSessionStore()

    const LicenseInfo = () => {
        if (!profileData?.licenseInfo) {
            return null
        }

        const { plan, status } = profileData?.licenseInfo

        return (
            <div className="px-2 py-4 border-t border-border/10">
                <div className="flex flex-col gap-2 p-3 rounded bg-accent/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 flex-row">
                            <div className="flex flex-col gap-0.5">
                                <p className="text-[10px] font-body text-muted-foreground uppercase">
                                    My PLAN
                                </p>
                                <p className="text-[11px] font-body font-medium text-card-foreground uppercase">
                                    {plan}
                                </p>
                            </div>
                        </div>
                        <div className={cn("w-3 h-3 rounded-full", status.toLowerCase() === "active" ? "bg-emerald-500" : "bg-red-500")} />
                    </div>
                </div>
            </div >
        )
    }

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
                side="left"
                className={cn(
                    "flex flex-col w-[200px] h-[98vh] my-[1vh] mx-4 rounded-3xl",
                    "border shadow-lg p-0 gap-0",
                )}>
                <SheetHeader className="p-6 flex items-center justify-between border-b border-border/10">
                    <SheetTitle asChild>
                        <span className="text-xl font-bold font-body uppercase text-card-foreground">
                            LORO CRM
                        </span>
                    </SheetTitle>
                </SheetHeader>
                <div className="flex-1 px-4 py-2">
                    <div className="flex flex-col space-y-1">
                        {navigationItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    onClick={onClose}
                                >
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "w-full justify-start gap-3 font-body text-[10px] text-card-foreground font-normal h-12 rounded-xl",
                                            "hover:bg-accent hover:text-accent-foreground",
                                            "dark:hover:bg-accent/50 dark:hover:text-accent-foreground",
                                            isActive && "bg-background",
                                            isActive && "dark:bg-background"
                                        )}
                                    >
                                        {item.icon}
                                        {item.title}
                                    </Button>
                                </Link>
                            )
                        })}
                    </div>
                </div>
                {profileData?.licenseInfo && <LicenseInfo />}
                <div className="p-6 mt-auto border-t border-border/10">
                    <p className="text-[10px] font-body uppercase text-center text-card-foreground font-normal">
                        LORO CRM
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    )
} 