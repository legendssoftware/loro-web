'use client'

import {
    LayoutDashboardIcon,
    MessageCircle,
    Power,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePathname, useRouter } from 'next/navigation'
import { SideDrawer } from "./side-drawer"
import { NotificationsModal } from "./notifications-modal"
import { ChatDialog } from "@/components/chat/chat-dialog"
import { useAppStore } from "@/store/use-app-store"
import { useSessionStore } from "@/store/use-session-store"
import { isAuthRoute } from "@/lib/utils"
import { ThemeToggler } from "@/modules/navigation/theme.toggler"
import { languages } from "@/lib/constants/languages"
import toast from "react-hot-toast"

export function TopNav() {
    const pathname = usePathname()
    const router = useRouter()
    const { signOut, profileData } = useSessionStore()
    const {
        isDrawerOpen,
        isNotificationsOpen,
        isChatOpen,
        currentLang,
        setDrawerOpen,
        setNotificationsOpen,
        setChatOpen,
        setCurrentLang,
    } = useAppStore()

    // Get user initials for avatar fallback
    const userInitials = profileData ? `${profileData.name?.[0]}${profileData.surname?.[0]}`.toUpperCase() : 'UU'

    const handleSignOut = async () => {
        try {
            await signOut()
            const toastId = toast.success('Session Ended', {
                style: {
                    borderRadius: '5px',
                    background: '#333',
                    color: '#fff',
                    fontFamily: 'var(--font-unbounded)',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    fontWeight: '300',
                    padding: '16px',
                },
                duration: 2000,
                position: 'bottom-center',
                icon: '👋',
            })

            await new Promise(resolve => setTimeout(resolve, 2000))
            toast.remove(toastId)
            router.push('/landing-page')
        } catch {
            toast.error('Failed to sign out', {
                style: {
                    borderRadius: '5px',
                    background: '#333',
                    color: '#fff',
                    fontFamily: 'var(--font-unbounded)',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    fontWeight: '300',
                    padding: '16px',
                },
                duration: 2000,
                position: 'bottom-center',
                icon: '❌',
            })
        }
    }

    if (isAuthRoute(pathname)) {
        return null
    }

    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-16 items-center px-2 justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer"
                            onClick={() => setDrawerOpen(true)}>
                            <LayoutDashboardIcon strokeWidth={1.5} size={50} />
                        </Button>
                        <span className="text-xl font-bold font-body uppercase">LORO CRM</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSignOut}
                            className="text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20">
                            <Power className="h-5 w-5" />
                            <span className="sr-only">Sign out</span>
                        </Button>
                        <ThemeToggler />
                        <NotificationsModal
                            open={isNotificationsOpen}
                            onOpenChange={setNotificationsOpen}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setChatOpen(true)}
                            className="relative"
                        >
                            <MessageCircle className="h-5 w-5" />
                            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center font-body uppercase">
                                1
                            </span>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-[10px] font-body uppercase font-normal"
                                >
                                    {currentLang}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {languages?.map((lang) => (
                                    <DropdownMenuItem
                                        className="text-[10px] font-body uppercase font-normal"
                                        key={lang.code}
                                        onClick={() => setCurrentLang(lang.code)}>
                                        {lang.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <div className="relative">
                            <Avatar className="h-8 w-8 ring-2 ring-primary">
                                {profileData?.photoURL && (
                                    <AvatarImage
                                        src={profileData.photoURL}
                                        alt={`${profileData.name} ${profileData.surname}`}
                                    />
                                )}
                                <AvatarFallback className="bg-black text-white text-[10px] font-body uppercase">
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-2 ring-white" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-16" />
            <SideDrawer
                isOpen={isDrawerOpen}
                onClose={() => setDrawerOpen(false)}
            />
            <ChatDialog
                open={isChatOpen}
                onOpenChange={setChatOpen}
            />
        </>
    )
} 