'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DatePickerWithRangeProps {
    date: DateRange | undefined;
    setDate: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({ date, setDate }: DatePickerWithRangeProps) {
    return (
        <div className='grid gap-2'>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id='date'
                        variant='outline'
                        className={cn(
                            'w-[300px] justify-start text-left font-normal bg-card',
                            !date && 'text-muted-foreground'
                        )}
                    >
                        <CalendarIcon className='w-4 h-4 mr-2' />
                        {date?.from ? (
                            date.to ? (
                                <span className='text-[10px] uppercase font-normal font-body'>
                                    {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                                </span>
                            ) : (
                                <span className='text-[10px] uppercase font-normal font-body'>
                                    {format(date.from, 'LLL dd, y')}
                                </span>
                            )
                        ) : (
                            <span className='text-[10px] uppercase font-normal font-body'>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='end'>
                    <Calendar
                        initialFocus
                        mode='range'
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
