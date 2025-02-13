import { useState } from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { User, AccessLevel } from "@/helpers/users"
import { StaffCard } from "./staff-card"
import { status } from "@/data/app-data"

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
}

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 20,
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24,
        }
    },
}

interface StaffListProps {
    staffData: User[]
    onCreateClick: () => void
    onUserAction: (user: User, action: 'edit' | 'deactivate') => void
}

export const StaffList = ({ staffData, onCreateClick, onUserAction }: StaffListProps) => {
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [roleFilter, setRoleFilter] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")

    const filteredStaff = staffData?.filter((user: User) => {
        const matchesStatus = statusFilter.toLowerCase() === "all" || user.status.toLowerCase() === statusFilter.toLowerCase()
        const matchesRole = roleFilter.toLowerCase() === "all" || user.accessLevel.toLowerCase() === roleFilter.toLowerCase()
        const searchTerms = searchQuery.toLowerCase().split(' ')
        const matchesSearch = searchQuery === "" || searchTerms.every(term =>
            user.name.toLowerCase().includes(term) ||
            user.surname.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user.username.toLowerCase().includes(term) ||
            user.phone.toLowerCase().includes(term)
        )
        return matchesStatus && matchesRole && matchesSearch
    })

    return (
        <div className="flex flex-col w-full h-full gap-4">
            <div className="flex flex-row items-center justify-end gap-2">
                <div className="flex flex-row items-center justify-center gap-2">
                    <Input
                        placeholder="search..."
                        className="w-[300px] shadow-none bg-card"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] shadow-none bg-card outline-none">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="font-body text-[10px] uppercase">
                                All Statuses
                            </SelectItem>
                            {status?.map((status) => (
                                <SelectItem key={status?.value} value={status?.value} className="font-body text-[10px] uppercase">
                                    {status?.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[180px] shadow-none bg-card outline-none">
                            <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="font-body text-[10px] uppercase">
                                All Roles
                            </SelectItem>
                            <SelectItem value={AccessLevel.USER} className="font-body text-[10px] uppercase">User</SelectItem>
                            <SelectItem value={AccessLevel.ADMIN} className="font-body text-[10px] uppercase">Admin</SelectItem>
                            <SelectItem value={AccessLevel.MANAGER} className="font-body text-[10px] uppercase">Manager</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="default" size="sm" onClick={onCreateClick}>
                        <Plus size={16} strokeWidth={1.5} className="text-white" />
                        <p className="text-xs font-normal text-white uppercase font-body">Add</p>
                    </Button>
                </div>
            </div>
            <motion.div
                className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-4"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {filteredStaff?.map((user: User) => (
                    <motion.div
                        key={user.uid}
                        variants={itemVariants}
                        layout
                    >
                        <StaffCard user={user} onAction={onUserAction} />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    )
} 