import { memo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarClock } from 'lucide-react';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export type PeriodFilterValue = 'today' | 'yesterday' | 'last_week' | 'last_month' | 'all';

interface PeriodFilterProps {
    value: PeriodFilterValue;
    onValueChange: (value: PeriodFilterValue) => void;
}

export const getDateRangeFromPeriod = (period: PeriodFilterValue): { from: Date; to: Date } => {
    const now = new Date();
    const today = endOfDay(now);

    switch (period) {
        case 'today':
            return {
                from: startOfDay(now),
                to: today,
            };
        case 'yesterday':
            const yesterday = subDays(now, 1);
            return {
                from: startOfDay(yesterday),
                to: endOfDay(yesterday),
            };
        case 'last_week':
            return {
                from: startOfDay(subDays(now, 7)),
                to: today,
            };
        case 'last_month':
            return {
                from: startOfDay(subDays(now, 30)),
                to: today,
            };
        default:
            return {
                from: startOfDay(subDays(now, 365)),
                to: today,
            };
    }
};

const PeriodFilterComponent = ({ value, onValueChange }: PeriodFilterProps) => {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className='w-[180px] shadow-none bg-card outline-none'>
                <SelectValue placeholder='Filter by period' />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value='all' className='text-[10px] font-normal uppercase font-body'>
                    <div className='flex flex-row items-center gap-2'>
                        <CalendarClock size={17} strokeWidth={1.5} />
                        <span>All Time</span>
                    </div>
                </SelectItem>
                <SelectItem value='today' className='text-[10px] font-normal uppercase font-body'>
                    <div className='flex flex-row items-center gap-2'>
                        <CalendarClock size={17} strokeWidth={1.5} />
                        <span>Today</span>
                    </div>
                </SelectItem>
                <SelectItem value='yesterday' className='text-[10px] font-normal uppercase font-body'>
                    <div className='flex flex-row items-center gap-2'>
                        <CalendarClock size={17} strokeWidth={1.5} />
                        <span>Yesterday</span>
                    </div>
                </SelectItem>
                <SelectItem value='last_week' className='text-[10px] font-normal uppercase font-body'>
                    <div className='flex flex-row items-center gap-2'>
                        <CalendarClock size={17} strokeWidth={1.5} />
                        <span>Last 7 Days</span>
                    </div>
                </SelectItem>
                <SelectItem value='last_month' className='text-[10px] font-normal uppercase font-body'>
                    <div className='flex flex-row items-center gap-2'>
                        <CalendarClock size={17} strokeWidth={1.5} />
                        <span>Last 30 Days</span>
                    </div>
                </SelectItem>
            </SelectContent>
        </Select>
    );
};

export const PeriodFilter = memo(PeriodFilterComponent);
