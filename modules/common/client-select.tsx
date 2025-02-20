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

interface Client {
    uid: number
    name: string
}

interface ClientSelectProps {
    value: {
        uid: number;
        name?: string;
        email?: string;
        address?: string;
        phone?: string;
        contactPerson?: string;
    };
    onChange: (value: { uid: number } | null) => void;
    disabled?: boolean;
}

interface PaginatedClientsResponse {
    data: Client[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    message: string;
}

export const ClientSelect = ({
    value,
    onChange,
    disabled = false
}: ClientSelectProps) => {
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
    } = useQuery<PaginatedClientsResponse>({
        queryKey: ['clients', currentPage],
        queryFn: async () => {
            const { data } = await axios.get<PaginatedClientsResponse>(`${API_URL}/clients`, {
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

    const clients = response?.data || []
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
        <div className="grid gap-1.5">
            <Label htmlFor="client" className="text-xs font-normal uppercase font-body text-card-foreground">
                Client
            </Label>
            <Select
                value={value?.uid?.toString()}
                onValueChange={(val) => onChange(val === "none" ? null : { uid: parseInt(val, 10) })}
                disabled={disabled}>
                <SelectTrigger className="text-xs font-body">
                    <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none" className="font-body text-[10px] uppercase">
                        None
                    </SelectItem>
                    {clients.map((client) => (
                        <SelectItem
                            key={client.uid}
                            value={client.uid.toString()}
                            className="font-body text-[10px] uppercase"
                        >
                            {client.name}
                        </SelectItem>
                    ))}
                    {clients.length > 0 && (
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