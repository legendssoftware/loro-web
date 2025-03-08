import { Button } from '@/components/ui/button';
import { Plus, Calendar, User, AlertCircle, Tag, Filter } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ClaimStatus, ClaimCategory } from '@/lib/types/claim';
import { Badge } from '@/components/ui/badge';

interface ClaimsHeaderProps {
    onApplyFilters: (filters: any) => void;
    onClearFilters: () => void;
    onAddClaim?: () => void;
}

export function ClaimsHeader({
    onApplyFilters,
    onClearFilters,
    onAddClaim,
}: ClaimsHeaderProps) {
    return (
        <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex gap-2">
                {/* Status Filter Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1 px-3"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            <span className="text-[10px] uppercase font-normal font-body">
                                Status
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuLabel className="text-xs font-medium">
                            Filter by Status
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() =>
                                onApplyFilters({ status: ClaimStatus.PENDING })
                            }
                        >
                            <Badge className="mr-2 text-yellow-800 bg-yellow-100">
                                <span className="text-[9px] font-medium">
                                    PENDING
                                </span>
                            </Badge>
                            <span className="text-[10px] font-normal">
                                Pending
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                onApplyFilters({ status: ClaimStatus.APPROVED })
                            }
                        >
                            <Badge className="mr-2 text-green-800 bg-green-100">
                                <span className="text-[9px] font-medium">
                                    APPROVED
                                </span>
                            </Badge>
                            <span className="text-[10px] font-normal">
                                Approved
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                onApplyFilters({ status: ClaimStatus.REJECTED })
                            }
                        >
                            <Badge className="mr-2 text-red-800 bg-red-100">
                                <span className="text-[9px] font-medium">
                                    REJECTED
                                </span>
                            </Badge>
                            <span className="text-[10px] font-normal">
                                Rejected
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                onApplyFilters({ status: ClaimStatus.PAID })
                            }
                        >
                            <Badge className="mr-2 text-blue-800 bg-blue-100">
                                <span className="text-[9px] font-medium">
                                    PAID
                                </span>
                            </Badge>
                            <span className="text-[10px] font-normal">
                                Paid
                            </span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Category Filter Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1 px-3"
                        >
                            <Tag className="w-3.5 h-3.5" />
                            <span className="text-[10px] uppercase font-normal font-body">
                                Category
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuLabel className="text-xs font-medium">
                            Filter by Category
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() =>
                                onApplyFilters({
                                    category: ClaimCategory.TRAVEL,
                                })
                            }
                        >
                            <span className="text-[10px] font-normal">
                                Travel
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                onApplyFilters({
                                    category: ClaimCategory.ACCOMMODATION,
                                })
                            }
                        >
                            <span className="text-[10px] font-normal">
                                Accommodation
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                onApplyFilters({
                                    category: ClaimCategory.MEALS,
                                })
                            }
                        >
                            <span className="text-[10px] font-normal">
                                Meals
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                onApplyFilters({
                                    category: ClaimCategory.ENTERTAINMENT,
                                })
                            }
                        >
                            <span className="text-[10px] font-normal">
                                Entertainment
                            </span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Date Range Filter Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1 px-3"
                        >
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-[10px] uppercase font-normal font-body">
                                Date
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuLabel className="text-xs font-medium">
                            Filter by Date
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() =>
                                onApplyFilters({ dateRange: 'today' })
                            }
                        >
                            <span className="text-[10px] font-normal">
                                Today
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                onApplyFilters({ dateRange: 'week' })
                            }
                        >
                            <span className="text-[10px] font-normal">
                                This Week
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                onApplyFilters({ dateRange: 'month' })
                            }
                        >
                            <span className="text-[10px] font-normal">
                                This Month
                            </span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Clear Filters Button */}
                <Button
                    size="sm"
                    variant="ghost"
                    className="text-[10px] uppercase font-normal font-body"
                    onClick={onClearFilters}
                >
                    Clear
                </Button>
            </div>

            {/* Add Claim Button */}
            <Button
                size="sm"
                variant="default"
                className="text-[10px] uppercase font-normal font-body px-3"
                onClick={onAddClaim}
            >
                <Plus className="w-3 h-3 mr-1" />
                Add Claim
            </Button>
        </div>
    );
}
