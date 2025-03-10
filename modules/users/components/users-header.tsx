'use client';

import { Button } from '@/components/ui/button';
import { UserFilterParams } from '@/lib/types/user';
import { UsersFilter } from './users-filter';
import { UserPlus } from 'lucide-react';

interface UsersHeaderProps {
    onApplyFilters: (filters: UserFilterParams) => void;
    onClearFilters: () => void;
    onAddUser: () => void;
}

export function UsersHeader({
    onApplyFilters,
    onClearFilters,
    onAddUser,
}: UsersHeaderProps) {
    return (
        <div className="flex items-center justify-end px-2">
            <UsersFilter
                onApplyFilters={onApplyFilters}
                onClearFilters={onClearFilters}
            />
            <Button onClick={onAddUser} size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                <span className="text-[10px] font-normal uppercase font-body">
                    Add User
                </span>
            </Button>
        </div>
    );
}
