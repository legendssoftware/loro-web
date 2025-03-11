'use client';

import { ClientsFilter } from './clients-filter';
import { ClientFilterParams } from '@/hooks/use-clients-query';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

interface ClientsHeaderProps {
    onApplyFilters: (filters: ClientFilterParams) => void;
    onClearFilters: () => void;
    onAddClient: () => void;
}

export function ClientsHeader({
    onApplyFilters,
    onClearFilters,
    onAddClient,
}: ClientsHeaderProps) {
    return (
        <div className="flex flex-row items-center justify-end gap-0 px-2">
            <ClientsFilter
                onApplyFilters={onApplyFilters}
                onClearFilters={onClearFilters}
            />
            <Button onClick={onAddClient} size="sm">
                <UserPlus className="w-4 h-4 mr-2 text-white" />
                <span className="text-[10px] font-normal uppercase font-body text-white">
                    Add Client
                </span>
            </Button>
        </div>
    );
}
