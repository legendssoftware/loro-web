'use client';

import { Columns } from 'lucide-react';

interface KanbanProps {
    title: string;
    subtitle: string;
}

export function Kanban({ title, subtitle }: KanbanProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <Columns className="w-16 h-16 mb-4 text-primary/30" />
            <h2 className="text-lg font-thin uppercase font-body">{title}</h2>
            <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                {subtitle}
            </p>
            <p className="mt-2 text-xs uppercase text-muted-foreground font-body">
                Kanban view functionality will be available soon
            </p>
        </div>
    );
}
