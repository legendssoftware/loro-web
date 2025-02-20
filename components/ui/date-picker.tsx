import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DatePickerProps {
    value?: Date;
    onChange: (date?: Date) => void;
}

export function DatePicker({ value, onChange }: DatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant='outline' className='w-[180px] justify-start text-left font-normal'>
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {value ? format(value, 'PPP') : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0'>
                <Calendar mode='single' selected={value} onSelect={onChange} initialFocus />
            </PopoverContent>
        </Popover>
    );
}
