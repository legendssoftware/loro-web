'use client';

import { memo, useCallback } from 'react';

interface TabItem {
    id: string;
    label: string;
}

interface ClaimsTabGroupProps {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

function ClaimsTabGroupComponent({ tabs, activeTab, onTabChange }: ClaimsTabGroupProps) {
    const handleTabChange = useCallback(
        (tabId: string) => {
            if (activeTab !== tabId) {
                onTabChange(tabId);
            }
        },
        [activeTab, onTabChange],
    );

    return (
        <div className='flex items-center px-10 overflow-x-auto border-b border-border/10'>
            {tabs?.map(tab => (
                <div key={tab.id} className='relative flex items-center justify-center gap-1 mr-8 cursor-pointer w-28'>
                    <div
                        className={`mb-3 font-body px-0 font-normal ${
                            activeTab === tab.id
                                ? 'text-primary dark:text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => handleTabChange(tab.id)}
                    >
                        <span className='text-sm font-normal uppercase font-body'>{tab.label}</span>
                    </div>
                    {activeTab === tab.id && (
                        <div className='absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-primary' />
                    )}
                </div>
            ))}
        </div>
    );
}

export const ClaimsTabGroup = memo(ClaimsTabGroupComponent);
