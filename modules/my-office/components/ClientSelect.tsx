import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Client {
    uid: number
    name: string
}

interface ClientSelectProps {
    value: number | undefined
    onChange: (value: number | undefined) => void
}

export const ClientSelect = ({ value, onChange }: ClientSelectProps) => {
    // Mock data for now - in real implementation would use React Query
    const clients: Client[] = [
        { uid: 2, name: "Acme" },
    ]

    return (
        <div>
            <Label htmlFor="client" className="text-xs font-body text-card-foreground uppercase font-normal">
                Client
            </Label>
            <Select
                value={value?.toString()}
                onValueChange={value => onChange(value === 'none' ? undefined : Number(value))}>
                <SelectTrigger className="font-body text-xs">
                    <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none" className="font-body text-[10px] uppercase">
                        None
                    </SelectItem>
                    {clients?.map((client) => (
                        <SelectItem
                            key={client?.uid}
                            value={String(client.uid)}
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