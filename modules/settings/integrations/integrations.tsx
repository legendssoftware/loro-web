'use client';

import { Card } from '@/components/ui/card';

export function IntegrationsModule() {
    return (
        <Card className='flex flex-col gap-4 p-6'>
            <h2 className='text-lg font-semibold font-body'>Integrations Settings</h2>
            <div className='flex flex-col gap-4'>
                <p className='text-sm text-muted-foreground'>Manage your third-party integrations and connections.</p>
            </div>
        </Card>
    );
}
