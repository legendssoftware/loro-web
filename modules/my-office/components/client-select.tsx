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

export const ClientSelect = ({
    value,
    onChange,
    disabled = false
}: ClientSelectProps) => {
    const { accessToken } = useSessionStore()

    const config: RequestConfig = {
        headers: {
            token: `${accessToken}`,
        },
    }

    const { data: clientsData } = useQuery({
        queryKey: ['clients'],
        queryFn: async () => {
            const { data } = await axios.get<{ clients: Client[], message: string }>(`${API_URL}/clients`, {
                headers: {
                    'Authorization': `Bearer ${config?.headers?.token}`,
                    'Content-Type': 'application/json'
                }
            })
            return data
        },
        enabled: !!accessToken,
    })

    return (
        <div className="grid gap-1.5">
            <Label htmlFor="client" className="text-xs font-normal uppercase font-body text-card-foreground">
                Client
            </Label>
            <Select
                value={value?.uid?.toString()}
                onValueChange={(val) => onChange({ uid: parseInt(val, 10) })}
                disabled={disabled}>
                <SelectTrigger className="text-xs font-body">
                    <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none" className="font-body text-[10px] uppercase">
                        None
                    </SelectItem>
                    {clientsData?.clients?.map((client) => (
                        <SelectItem
                            key={client.uid}
                            value={client.uid.toString()}
                            className="font-body text-[10px] uppercase"
                        >
                            {client.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
} 