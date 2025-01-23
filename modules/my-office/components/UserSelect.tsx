import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface User {
    uid: number
    name: string
}

interface UserSelectProps {
    value: number[]
    onChange: (value: number[]) => void
}

export const UserSelect = ({ value, onChange }: UserSelectProps) => {
    // In a real implementation, we would use React Query here
    // const { data: users, isLoading } = useQuery({
    //     queryKey: ['users'],
    //     queryFn: fetchUsers
    // })

    // Temporary mock data until API integration
    const users: User[] = [
        { uid: 5, name: "John Doe" },
    ]

    return (
        <div>
            <Label htmlFor="assignees" className="text-xs font-body text-card-foreground uppercase font-normal">
                Assignees
            </Label>
            <Select
                value={value?.map(String)?.join(',')}
                onValueChange={value => onChange([Number(value)])}>
                <SelectTrigger className="font-body text-xs">
                    <SelectValue placeholder="Select assignees" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none" className="font-body text-[10px] uppercase">
                        None
                    </SelectItem>
                    {users?.map((user) => (
                        <SelectItem
                            key={user?.uid}
                            value={String(user.uid)}
                            className="font-body text-[10px] uppercase"
                        >
                            {user.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
} 