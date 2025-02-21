import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsForm } from './general/settings-form';
import { AppearanceForm } from './appearance/appearance-form';
import { HoursForm } from './hours/hours-form';

export default function SettingsPage() {
    return (
        <div className='container py-8 mx-auto'>
            <div className='mb-8'>
                <h1 className='text-2xl font-normal uppercase font-body'>Settings</h1>
                <p className='text-sm font-normal uppercase font-body text-muted-foreground'>
                    Manage your organization settings
                </p>
            </div>

            <Tabs defaultValue='general' className='space-y-4'>
                <TabsList className='grid w-full h-auto grid-cols-3 p-1 bg-muted/50'>
                    <TabsTrigger
                        value='general'
                        className='text-[10px] font-normal uppercase font-body data-[state=active]:bg-background'
                    >
                        General
                    </TabsTrigger>
                    <TabsTrigger
                        value='appearance'
                        className='text-[10px] font-normal uppercase font-body data-[state=active]:bg-background'
                    >
                        Appearance
                    </TabsTrigger>
                    <TabsTrigger
                        value='hours'
                        className='text-[10px] font-normal uppercase font-body data-[state=active]:bg-background'
                    >
                        Business Hours
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='general'>
                    <SettingsForm />
                </TabsContent>

                <TabsContent value='appearance'>
                    <AppearanceForm />
                </TabsContent>

                <TabsContent value='hours'>
                    <HoursForm />
                </TabsContent>
            </Tabs>
        </div>
    );
}
