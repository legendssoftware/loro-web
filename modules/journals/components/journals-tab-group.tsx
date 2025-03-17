'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface JournalsTab {
    id: string;
    label: string;
}

interface JournalsTabGroupProps {
    tabs: JournalsTab[];
    activeTab: string;
    onTabChange: (value: string) => void;
}

export function JournalsTabGroup({
    tabs,
    activeTab,
    onTabChange,
}: JournalsTabGroupProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex-1 pl-4">
                <Tabs
                    value={activeTab}
                    onValueChange={onTabChange}
                    className="w-full"
                >
                    <TabsList className="p-0 bg-transparent">
                        {tabs.map((tab) => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className={cn(
                                    'data-[state=active]:border-b-2 rounded-none data-[state=active]:border-b-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent',
                                    'text-xs font-thin uppercase px-6 py-3',
                                    'font-body',
                                )}
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>
        </div>
    );
}
