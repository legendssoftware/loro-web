'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center animate-in fade-in-50">
            <h3 className="mb-2 text-lg font-medium font-body">{title}</h3>
            {description && (
                <p className="max-w-md mb-4 text-sm font-thin text-muted-foreground font-body">
                    {description}
                </p>
            )}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}
