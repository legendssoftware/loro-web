import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { status } from "@/data/app-data"

export const StaffModule = () => {
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleStatusChange = (value: string) => {
        setStatusFilter(value)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle form submission here
        setIsModalOpen(false)
    }

    return (
        <div className="w-full h-full flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between gap-2">
                <h2 className="text-md font-body font-normal uppercase">Staff Overview</h2>
                <div className="flex flex-row items-center justify-center gap-2">
                    <Input placeholder="search..." className="w-[300px]" />
                    <Select value={statusFilter} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            {status?.map((status) => (
                                <SelectItem key={status?.value} value={status?.value}>
                                    {status?.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="default" size="sm">
                                <Plus size={16} strokeWidth={1.5} className="text-white" />
                                <p className="text-xs font-normal font-body uppercase text-white">Add</p>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-body font-medium">Add New Staff Member</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Add a new staff member by filling out the form below.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Enter full name..."
                                        className="w-full"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter email address..."
                                        className="w-full"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="position">Position</Label>
                                    <Input
                                        id="position"
                                        placeholder="Enter position..."
                                        className="w-full"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" size="sm">
                                        Add Staff Member
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}