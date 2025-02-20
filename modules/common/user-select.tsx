import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useSessionStore } from "@/store/use-session-store"
import { RequestConfig } from "@/lib/types/tasks"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface User {
    uid: number
    name: string
    surname: string
}

interface UserSelectProps {
    value: { uid: number }[];
    onChange: (value: { uid: number }[]) => void;
}

interface PaginatedUsersResponse {
    data: User[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    message: string;
}

export const UserSelect = ({ value, onChange }: UserSelectProps) => {
    const { accessToken } = useSessionStore()
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const config: RequestConfig = {
        headers: {
            token: `${accessToken}`,
        },
    }

    const {
        data: response,
        isLoading,
    } = useQuery<PaginatedUsersResponse>({
        queryKey: ['users', currentPage],
        queryFn: async () => {
            const { data } = await axios.get<PaginatedUsersResponse>(`${API_URL}/user`, {
                params: {
                    page: currentPage,
                    limit: itemsPerPage,
                },
                headers: {
                    'Authorization': `Bearer ${config?.headers?.token}`,
                    'Content-Type': 'application/json'
                }
            })
            return data
        },
        enabled: !!accessToken,
    })

    const handleNextPage = () => {
        if (currentPage < (response?.meta?.totalPages || 1)) {
            setCurrentPage(prev => prev + 1)
        }
    }

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1)
        }
    }

    // Ensure value is always an array
    const selectedUsers = Array.isArray(value) ? value : [];
    const selectedUserIds = selectedUsers.map(u => u.uid.toString()).join(",");

    const users = response?.data || []
    const totalPages = response?.meta?.totalPages || 1

    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-full h-10" />
            </div>
        )
    }

    return (
        <div>
            <Label htmlFor="assignees" className="text-xs font-normal uppercase font-body text-card-foreground">
                Assignees
            </Label>
            <Select
                value={selectedUserIds || "none"}
                onValueChange={(val) => {
                    if (val === "none") {
                        onChange([]);
                        return;
                    }
                    const uids = val.split(",").filter(Boolean).map(id => ({ uid: parseInt(id, 10) }));
                    onChange(uids);
                }}
            >
                <SelectTrigger className="text-xs font-body">
                    <SelectValue placeholder="Select assignees" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none" className="font-body text-[10px] uppercase">
                        None
                    </SelectItem>
                    {users.map((user) => (
                        <SelectItem
                            key={user?.uid}
                            value={String(user?.uid)}
                            className="font-body text-[10px] uppercase"
                        >
                            {`${user?.name} ${user?.surname}`}
                        </SelectItem>
                    ))}
                    {users.length > 0 && (
                        <div className="flex items-center justify-center gap-2 p-2 border-t">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className="w-6 h-6"
                            >
                                <ChevronLeft className="w-3 h-3" />
                            </Button>
                            <span className="text-[10px] font-normal font-body">
                                {currentPage} / {totalPages}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="w-6 h-6"
                            >
                                <ChevronRight className="w-3 h-3" />
                            </Button>
                        </div>
                    )}
                </SelectContent>
            </Select>
        </div>
    )
} 