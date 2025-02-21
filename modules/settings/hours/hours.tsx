'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface TimeInputProps {
    value: string;
    onChange: (value: string) => void;
}

function TimeInput({ value, onChange }: TimeInputProps) {
    const [selectedHour, setSelectedHour] = useState(value.split(':')[0]);
    const [selectedMinute, setSelectedMinute] = useState(value.split(':')[1]);

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    const handleTimeChange = (hour: string, minute: string) => {
        setSelectedHour(hour);
        setSelectedMinute(minute);
        onChange(`${hour}:${minute}`);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className='w-[100px] h-9 px-3 text-xs font-normal font-body bg-background hover:bg-accent hover:text-accent-foreground rounded-md flex items-center justify-between gap-2'
                >
                    <span className='text-foreground'>{value}</span>
                    <Clock className='w-4 h-4 text-muted-foreground' />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='p-0 border rounded-lg shadow-md w-fit' align="start">
                <div className='flex divide-x rounded-lg bg-background divide-border'>
                    {/* Hours Column */}
                    <div className='w-[120px] h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent'>
                        {hours.map(hour => (
                            <Button
                                key={hour}
                                variant='ghost'
                                className={cn(
                                    'w-full rounded-none h-10 text-xs font-normal font-body hover:bg-accent hover:text-accent-foreground',
                                    selectedHour === hour && 'bg-primary text-primary-foreground'
                                )}
                                onClick={() => handleTimeChange(hour, selectedMinute)}
                            >
                                {hour}
                            </Button>
                        ))}
                    </div>
                    {/* Minutes Column */}
                    <div className='w-[120px] h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent'>
                        {minutes.map(minute => (
                            <Button
                                key={minute}
                                variant='ghost'
                                className={cn(
                                    'w-full rounded-none h-10 text-xs font-normal font-body hover:bg-accent hover:text-accent-foreground',
                                    selectedMinute === minute && 'bg-primary text-primary-foreground'
                                )}
                                onClick={() => handleTimeChange(selectedHour, minute)}
                            >
                                {minute}
                            </Button>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export function HoursModule() {
    const [hours, setHours] = useState({
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' },
        saturday: { start: '10:00', end: '14:00' },
        sunday: { start: '--:--', end: '--:--' },
    });
    const [afterHours, setAfterHours] = useState(false);

    const updateTime = (day: string, type: 'start' | 'end', value: string) => {
        setHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day as keyof typeof prev],
                [type]: value
            }
        }));
    };

    return (
        <div className='flex flex-col gap-8'>
            <div className='flex flex-col gap-6 mx-auto xl:w-11/12'>
                <div>
                    <h2 className='font-normal uppercase text-md font-body'>Working Hours</h2>
                    <p className='text-xs font-normal uppercase font-body text-muted-foreground'>
                        Set your business hours
                    </p>
                </div>

                <div className='flex flex-col gap-6'>
                    {Object.entries(hours).map(([day, times]) => (
                        <div key={day} className='flex items-center justify-between'>
                            <span className='text-xs font-normal uppercase font-body'>{day}</span>
                            <div className='flex items-center gap-4'>
                                <TimeInput
                                    value={times.start}
                                    onChange={(value) => updateTime(day, 'start', value)}
                                />
                                <span className='text-[10px] font-normal uppercase font-body'>to</span>
                                <TimeInput
                                    value={times.end}
                                    onChange={(value) => updateTime(day, 'end', value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className='flex flex-col gap-2 pt-4 border-t'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <h3 className='text-xs font-normal uppercase font-body'>Trade After Hours</h3>
                            <p className='text-xs font-normal uppercase font-body text-muted-foreground'>
                                Allow trading outside of set business hours
                            </p>
                        </div>
                        <Switch
                            checked={afterHours}
                            onCheckedChange={setAfterHours}
                        />
                    </div>
                </div>
                <Button className='w-4/12 self-end text-[10px] font-normal text-white uppercase font-body bg-primary'>
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
