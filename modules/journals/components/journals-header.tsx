'use client';

interface JournalsHeaderProps {
    onAddJournal?: () => void;
}

export function JournalsHeader({ onAddJournal }: JournalsHeaderProps) {
    return (
        <div className="flex items-center justify-between w-full p-4">
            <div className="flex-1"></div>
            <div className="flex items-center gap-2">
                {/* Add journal button removed as requested */}
            </div>
        </div>
    );
}
