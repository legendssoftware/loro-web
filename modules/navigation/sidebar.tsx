"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { menuItems } from "@/lib/constants/navigation"
import { ThemeToggler } from "@/modules/navigation/theme.toggler"

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="flex flex-col w-64 border-r bg-card">
            <div className="p-6 border-b">
                <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>

            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems?.map((item) => {
                        const isActive = pathname === item?.href
                        return (
                            <li key={item?.href}>
                                <Link
                                    href={item?.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>
                                    <item.icon className="w-5 h-5" />
                                    {item?.title}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t">
                <ThemeToggler />
            </div>
        </aside>
    )
} 