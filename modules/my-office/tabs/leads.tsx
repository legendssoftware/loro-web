import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { generalStatuses } from "@/data/app-data"

export const LeadsModule = () => {
    const [statusFilter, setStatusFilter] = useState<string>("all")

    const handleStatusChange = (value: string) => {
        setStatusFilter(value)
    }

    return (
        <div className="w-full h-full flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between gap-2">
                <h2 className="text-md font-body font-normal uppercase">Leads Overview</h2>
                <div className="flex flex-row items-center justify-center gap-2">
                    <Input placeholder="search..." className="w-[300px]" />
                    <Select value={statusFilter} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            {generalStatuses?.map((status) => (
                                <SelectItem key={status?.value} value={status?.value}>
                                    {status?.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}