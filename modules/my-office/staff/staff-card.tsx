import { EllipsisVertical } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "@/helpers/users"

interface StaffCardProps {
    user: User
    onAction: (user: User, action: 'edit' | 'deactivate') => void
}

export const StaffCard = ({ user, onAction }: StaffCardProps) => {
    return (
        <Card className="p-4">
            <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8 ring-2 ring-primary">
                            {user?.photoURL && (
                                <AvatarImage
                                    src={user.photoURL}
                                    alt={`${user.name} ${user.surname}`}
                                />
                            )}
                            <AvatarFallback className="bg-black text-white text-[10px] font-body uppercase">
                                {`${user.name?.[0]}${user.surname?.[0]}`}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col justify-start gap-2">
                            <h3 className="font-body text-[12px] font-normal uppercase">
                                {user.name?.[0]} {user.surname}
                            </h3>
                            <div>
                                <p className="text-[10px] text-card-foreground font-body font-normal">{user?.email}</p>
                                <p className="text-[10px] text-card-foreground font-body font-normal">{user?.phone}</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-[10px] px-4 py-1 bg-secondary rounded font-body uppercase">
                                    {user.accessLevel}
                                </span>
                                <span className="text-[10px] px-4 py-1 bg-secondary rounded font-body uppercase">
                                    {user.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <EllipsisVertical className="cursor-pointer" strokeWidth={1.5} size={20} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => onAction(user, 'edit')}>
                                <p className="text-[9px] font-normal font-body uppercase">Edit</p>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAction(user, 'deactivate')}>
                                <p className="text-[9px] text-red-500 font-normal font-body uppercase">Deactivate</p>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </Card>
    )
} 