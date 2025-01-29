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

interface User {
    uid: number
    name: string
    surname: string
}

interface UserSelectProps {
    value: { uid: number }[];
    onChange: (value: { uid: number }[]) => void;
}

export const UserSelect = ({ value, onChange }: UserSelectProps) => {
    const { accessToken } = useSessionStore()

    const config: RequestConfig = {
        headers: {
            token: `${accessToken}`,
        },
    }

    const { data: usersData } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await axios.get<{ users: User[], message: string }>(`${API_URL}/user`, {
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
        <div>
            <Label htmlFor="assignees" className="text-xs font-body text-card-foreground uppercase font-normal">
                Assignees
            </Label>
            <Select
                value={value.map(v => v.uid.toString()).join(",")}
                onValueChange={(val) => {
                    const uids = val.split(",").filter(Boolean).map(id => ({ uid: parseInt(id, 10) }))
                    onChange(uids)
                }}
            >
                <SelectTrigger className="font-body text-xs">
                    <SelectValue placeholder="Select assignees" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none" className="font-body text-[10px] uppercase">
                        None
                    </SelectItem>
                    {usersData?.users?.map((user) => (
                        <SelectItem
                            key={user?.uid}
                            value={String(user.uid)}
                            className="font-body text-[10px] uppercase"
                        >
                            {`${user.name} ${user.surname}`}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
} 