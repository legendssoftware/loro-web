'use client';

import { events, type EventType, workers } from '@/lib/data';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface EventsSidebarProps {
    onEventClick: (event: EventType) => void;
    highlightedMarkerId: string | null;
}

export default function EventsSidebar({
    onEventClick,
    highlightedMarkerId,
}: EventsSidebarProps) {
    // Find highlighted event based on marker ID
    const highlightedEvent = highlightedMarkerId
        ? events.find((event) => {
              const worker = workers.find((w) => w.id === highlightedMarkerId);
              return worker && event.user === worker.name;
          })
        : null;

    return (
        <div className="font-body">
            <div className="px-3 py-2 border-b border-border/10">
                <h2 className="font-thin uppercase text-md">Recent Events</h2>
            </div>
            <div className="p-2">
                {events?.slice(0, 4)?.map((event) => {
                    // Check if this event is highlighted
                    const isHighlighted =
                        highlightedEvent && highlightedEvent.id === event.id;

                    return (
                        <div
                            key={event.id}
                            className={cn(
                                'rounded-md p-3 cursor-pointer transition-all duration-200 mb-2',
                                isHighlighted
                                    ? 'bg-primary/10 text-primary'
                                    : 'hover:bg-accent/20',
                            )}
                            onClick={() => onEventClick(event)}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className={cn(
                                        'w-8 h-8 rounded-md flex items-center justify-center text-white',
                                        event.type === 'check-in'
                                            ? 'bg-blue-500'
                                            : event.type === 'task'
                                              ? 'bg-purple-500'
                                              : event.type === 'journal'
                                                ? 'bg-red-500'
                                                : event.type === 'shift-start'
                                                  ? 'bg-green-500'
                                                  : 'bg-orange-500',
                                    )}
                                >
                                    {event.type === 'check-in' && (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                                            <circle
                                                cx="12"
                                                cy="10"
                                                r="3"
                                            ></circle>
                                        </svg>
                                    )}
                                    {event.type === 'task' && (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <rect
                                                width="18"
                                                height="18"
                                                x="3"
                                                y="3"
                                                rx="2"
                                            ></rect>
                                            <path d="M3 9h18"></path>
                                            <path d="M9 21V9"></path>
                                        </svg>
                                    )}
                                    {event.type === 'journal' && (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                                            <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"></path>
                                            <line
                                                x1="9"
                                                y1="9"
                                                x2="10"
                                                y2="9"
                                            ></line>
                                            <line
                                                x1="9"
                                                y1="13"
                                                x2="15"
                                                y2="13"
                                            ></line>
                                            <line
                                                x1="9"
                                                y1="17"
                                                x2="15"
                                                y2="17"
                                            ></line>
                                        </svg>
                                    )}
                                    {event.type === 'shift-start' && (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="10"
                                            ></circle>
                                            <polyline points="12 6 12 12 16 14"></polyline>
                                        </svg>
                                    )}
                                    {event.type === 'lead' && (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                            <circle
                                                cx="9"
                                                cy="7"
                                                r="4"
                                            ></circle>
                                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <div className="text-[10px] text-muted-foreground uppercase">
                                        {event.type.replace('-', ' ')}
                                    </div>
                                    <div className="text-xs font-thin uppercase">
                                        {event.title}
                                    </div>
                                </div>
                            </div>

                            <div className="text-[10px] text-muted-foreground mb-1 uppercase">
                                {event.time}
                            </div>

                            <div className="flex items-start gap-2 mb-2">
                                <div className="mt-1 text-muted-foreground">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase">
                                        {event.location}
                                    </div>
                                </div>
                            </div>

                            {event.user && (
                                <div className="flex items-center gap-2 pt-1 mt-1 border-t border-border/10">
                                    <div className="w-5 h-5 overflow-hidden rounded-full bg-accent">
                                        <Image
                                            src="/placeholder.svg?height=20&width=20"
                                            alt={event.user}
                                            className="object-cover w-full h-full"
                                            width={20}
                                            height={20}
                                        />
                                    </div>
                                    <div className="text-[10px] uppercase">
                                        {event.user}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
