"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { menuItems } from "@/lib/constants/navigation"
import { ThemeToggler } from "@/modules/navigation/theme.toggler"
import { useSessionStore } from "@/store/use-session-store"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { StarIcon, ShieldCheckIcon, ZapIcon } from "lucide-react"

export function Sidebar() {
    const pathname = usePathname()
    const { profileData } = useSessionStore()
    const licenseInfo = profileData?.licenseInfo

    return (
        <aside className="flex flex-col w-64 border-r bg-card">
            <div className="p-6 border-b">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                {profileData?.name && (
                    <p className="text-sm text-muted-foreground mt-2">
                        Welcome back, {profileData.name}
                    </p>
                )}
            </div>

            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems?.map((item) => {
                        const isActive = pathname === item?.href
                        return (
                            <li key={item?.href}>
                                <Link
                                    href={item?.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors${isActive ? ' bg-primary text-primary-foreground' : ' hover:bg-secondary'}`}>
                                    <item.icon className="w-5 h-5" />
                                    {item?.title}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {licenseInfo && (
                <div className="p-4 border-t space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">License Status</span>
                        <Badge variant={licenseInfo.status === 'active' ? 'default' : 'destructive'}>
                            {licenseInfo.status}
                        </Badge>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <StarIcon className="w-4 h-4 text-yellow-500" />
                            <span>Plan: {licenseInfo.plan}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                            <span>ID: {licenseInfo.licenseId}</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <ZapIcon className="w-4 h-4 text-blue-500" />
                                <span>Features</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {licenseInfo.features.map((feature) => (
                                    <Badge
                                        key={feature}
                                        variant="secondary"
                                        className="text-[10px]"
                                    >
                                        {feature}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4 border-t">
                <ThemeToggler />
            </div>
        </aside>
    )
} 