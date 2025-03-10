'use client';

import { useCallback } from 'react';

interface Tab {
    id: string;
    label: string;
}

interface UsersTabGroupProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

export function UsersTabGroup({ tabs, activeTab, onTabChange }: UsersTabGroupProps) {
    const handleTabChange = useCallback(
        (tabId: string) => {
            if (activeTab !== tabId) {
                onTabChange(tabId);
            }
        },
        [activeTab, onTabChange],
    );

    return (
        <div className='flex items-start px-10 overflow-x-auto'>
            {tabs?.map(tab => (
                <div key={tab?.id} className='relative flex items-start justify-center gap-1 mr-8 cursor-pointer w-28'>
                    <div
                        className={`mb-3 font-body px-0 font-normal cursor-pointer ${
                            activeTab === tab.id
                                ? 'text-primary dark:text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => handleTabChange(tab?.id)}
                    >
                        <span className='text-xs font-thin uppercase font-body'>{tab?.label}</span>
                    </div>
                    {activeTab === tab?.id && (
                        <div className='absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-primary' />
                    )}
                </div>
            ))}
        </div>
    );
}
