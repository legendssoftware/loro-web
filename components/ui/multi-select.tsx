'use client';

import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export interface MultiSelectOption {
    value: string | number;
    label: string;
}

interface MultiSelectProps {
    options: MultiSelectOption[];
    selectedValues: (string | number)[];
    onSelectionChange: (values: (string | number)[]) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    maxDisplay?: number;
}

export function MultiSelect({
    options,
    selectedValues,
    onSelectionChange,
    placeholder = 'Select items...',
    disabled = false,
    className,
    maxDisplay = 3,
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (value: string | number) => {
        if (selectedValues.includes(value)) {
            onSelectionChange(selectedValues.filter((v) => v !== value));
        } else {
            onSelectionChange([...selectedValues, value]);
        }
    };

    const handleRemove = (value: string | number) => {
        onSelectionChange(selectedValues.filter((v) => v !== value));
    };

    const getSelectedLabels = () => {
        return options
            .filter((option) => selectedValues.includes(option.value))
            .map((option) => option.label);
    };

    const selectedLabels = getSelectedLabels();
    const displayText = selectedLabels.length === 0 
        ? placeholder 
        : selectedLabels.length <= maxDisplay
        ? selectedLabels.join(', ')
        : `${selectedLabels.slice(0, maxDisplay).join(', ')} (+${selectedLabels.length - maxDisplay} more)`;

    return (
        <div className={cn('relative', className)}>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isOpen}
                        className={cn(
                            'w-full justify-between font-light bg-card border-border h-10',
                            disabled && 'cursor-not-allowed opacity-50'
                        )}
                        disabled={disabled}
                    >
                        <span className={cn(
                            'truncate text-left text-[10px] font-body uppercase',
                            selectedValues.length === 0 && 'text-muted-foreground'
                        )}>
                            {displayText}
                        </span>
                        <ChevronDown className="ml-2 w-4 h-4 opacity-50 shrink-0" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                    className={cn(
                        'overflow-y-auto w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px]',
                        // Use the same high z-index as Select components
                        'z-[11000]'
                    )}
                >
                    <DropdownMenuLabel className="text-[10px] font-body font-normal uppercase">
                        {placeholder}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {options.length === 0 ? (
                        <div className="px-2 py-1.5 text-[10px] text-muted-foreground font-body">
                            No options available
                        </div>
                    ) : (
                        options.map((option) => (
                            <DropdownMenuCheckboxItem
                                key={option.value}
                                checked={selectedValues.includes(option.value)}
                                onCheckedChange={() => handleSelect(option.value)}
                                className="text-[10px] font-body uppercase font-normal"
                            >
                                {option.label}
                            </DropdownMenuCheckboxItem>
                        ))
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Selected items display */}
            {selectedValues.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {selectedLabels.slice(0, maxDisplay).map((label, index) => {
                        const value = selectedValues[index];
                        return (
                            <Badge
                                key={value}
                                variant="secondary"
                                className="text-[9px] font-body px-2 py-1"
                            >
                                {label}
                                <button
                                    type="button"
                                    className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleRemove(value);
                                        }
                                    }}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onClick={() => handleRemove(value)}
                                >
                                    <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                                </button>
                            </Badge>
                        );
                    })}
                    {selectedLabels.length > maxDisplay && (
                        <Badge variant="outline" className="text-[9px] font-body px-2 py-1">
                            +{selectedLabels.length - maxDisplay} more
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
} 