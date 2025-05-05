'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggler() {
    const { setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative w-10 h-10"
                >
                    <Sun
                        className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        id="tour-step-theme-toggler"
                    />
                    <Moon
                        className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        id="tour-step-theme-toggler"
                    />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                sideOffset={4}
                className="min-w-[150px] z-[20000]"
            >
                <DropdownMenuItem onClick={() => setTheme('light')}>
                    <p className="text-[10px] font-body uppercase cursor-pointer">
                        Light
                    </p>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <p className="text-[10px] font-body uppercase cursor-pointer">
                        Dark
                    </p>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                    <p className="text-[10px] font-body uppercase cursor-pointer">
                        System
                    </p>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
