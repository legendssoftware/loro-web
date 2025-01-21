'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Building2, Settings } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet"
import Link from "next/link"
import { usePathname } from "next/navigation"

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
    {
        title: "SETTINGS",
        icon: <Settings size={18} strokeWidth={1.5} />,
        href: "/settings"
    },
]

export function SideDrawer({ isOpen, onClose }: SideDrawerProps) {
    const pathname = usePathname()

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
                <div className="p-6 mt-auto border-t border-border/10">
                    <p className="text-[10px] font-body uppercase text-center text-card-foreground font-normal">
                        LORO CRM
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    )
} 