import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface CategorySelectProps {
    value: string | undefined;
    onChange: (value: string | undefined) => void;
    categories?: string[];
    allowCustom?: boolean;
}

export const CategorySelect = ({
    value,
    onChange,
    categories = ['premium', 'standard', 'basic'],
    allowCustom = true
}: CategorySelectProps) => {
    const [isCustom, setIsCustom] = useState(false);

    const handleChange = (selectedValue: string) => {
        if (selectedValue === 'custom') {
            setIsCustom(true);
            onChange(undefined);
        } else {
            setIsCustom(false);
            onChange(selectedValue);
        }
    };

    return (
        <div className="grid gap-1.5">
            <Label htmlFor="category" className="text-xs font-body text-card-foreground uppercase font-normal">
                Target Category
            </Label>
            {!isCustom ? (
                <Select
                    value={value || ''}
                    onValueChange={handleChange}>
                    <SelectTrigger className="font-body text-xs">
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem
                                key={category}
                                value={category}
                                className="font-body text-[10px] uppercase"
                            >
                                {category}
                            </SelectItem>
                        ))}
                        {allowCustom && (
                            <SelectItem
                                value="custom"
                                className="font-body text-[10px] uppercase"
                            >
                                Custom Category
                            </SelectItem>
                        )}
                    </SelectContent>
                </Select>
            ) : (
                <div className="flex gap-2">
                    <Input
                        placeholder="Enter custom category"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="font-body text-xs"
                    />
                    <button
                        onClick={() => {
                            setIsCustom(false);
                            onChange(undefined);
                        }}
                        className="px-2 py-1 text-xs font-body bg-secondary text-secondary-foreground rounded"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}; 