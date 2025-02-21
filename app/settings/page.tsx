'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Settings, Palette, Clock} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralModule } from '@/modules/settings/general/general';
import { AppearanceModule } from '@/modules/settings/appearance/appearance';
import { HoursModule } from '@/modules/settings/hours/hours';
import { itemVariants, containerVariants } from '@/lib/utils/animations';

export default function SettingsPage() {
    return (
        <motion.div className='flex flex-col gap-3 p-4' initial='hidden' animate='show' variants={containerVariants}>
            <motion.div variants={itemVariants}>
                <Tabs defaultValue='general' className='w-full'>
                    <TabsList className='justify-start w-full h-12 bg-background'>
                        <TabsTrigger
                            className='data-[state=active]:bg-none data-[state=active]:shadow-none ease-in-out duration-300 data-[state=active]:border-b pb-2 data-[state=active]:border-b-primary data-[state=active]:rounded-none gap-2 font-normal font-body uppercase w-[170px]'
                            value='general'
                        >
                            <Settings size={16} strokeWidth={1.5} className='text-=card-foreground' />
                            <p className='text-xs font-normal uppercase font-body'>General</p>
                        </TabsTrigger>
                        <TabsTrigger
                            className='data-[state=active]:bg-none data-[state=active]:shadow-none data-[state=active]:border-b pb-2 data-[state=active]:border-b-primary data-[state=active]:rounded-none gap-2 font-normal font-body uppercase w-[170px]'
                            value='appearance'
                        >
                            <Palette size={16} strokeWidth={1.5} className='text-=card-foreground' />
                            <p className='text-xs font-normal uppercase font-body'>Appearance</p>
                        </TabsTrigger>
                        <TabsTrigger
                            className='data-[state=active]:bg-none data-[state=active]:shadow-none data-[state=active]:border-b pb-2 data-[state=active]:border-b-primary data-[state=active]:rounded-none gap-2 font-normal font-body uppercase w-[170px]'
                            value='hours'
                        >
                            <Clock size={16} strokeWidth={1.5} className='text-=card-foreground' />
                            <p className='text-xs font-normal uppercase font-body'>Hours</p>
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value='general' className='mt-4'>
                        <Card className='flex flex-col gap-2 border-0 shadow-none bg-card/20'>
                            <GeneralModule />
                        </Card>
                    </TabsContent>
                    <TabsContent value='appearance' className='mt-4'>
                        <Card className='flex flex-col gap-2 border-0 shadow-none bg-card/20'>
                            <AppearanceModule />
                        </Card>
                    </TabsContent>
                    <TabsContent value='hours' className='mt-4'>
                        <Card className='flex flex-col gap-2 border-0 shadow-none bg-card/20'>
                            <HoursModule />
                        </Card>
                    </TabsContent>
                </Tabs>
            </motion.div>
        </motion.div>
    );
}
