'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export function AppearanceModule() {
    const [primaryColor, setPrimaryColor] = useState('#FCA4AA');
    const [secondaryColor, setSecondaryColor] = useState('#2196F3');
    const [accentColor, setAccentColor] = useState('#4CAF50');
    const [errorColor, setErrorColor] = useState('#FF0000');
    const [successColor, setSuccessColor] = useState('#4CAF50');
    const [fontSize, setFontSize] = useState(16);

    return (
        <div className='flex flex-col gap-8'>
            <div className='flex flex-col gap-6 mx-auto xl:w-11/12'>
                <div>
                    <h2 className='font-normal uppercase text-md font-body'>Appearance Settings</h2>
                    <p className='text-xs font-normal uppercase font-body text-muted-foreground'>
                        Customize the look of your applications
                    </p>
                </div>

                {/* Color Settings */}
                <div className='grid grid-cols-3 gap-6'>
                    <div className='flex flex-col gap-2'>
                        <label className='text-xs font-normal uppercase font-body'>Primary Color</label>
                        <div className='flex gap-2'>
                            <Popover>
                                <PopoverTrigger>
                                    <div
                                        className='w-6 h-6 rounded cursor-pointer'
                                        style={{ backgroundColor: primaryColor }}
                                    />
                                </PopoverTrigger>
                                <PopoverContent className='p-0 border-none'>
                                    <HexColorPicker color={primaryColor} onChange={setPrimaryColor} />
                                </PopoverContent>
                            </Popover>
                            <Input
                                value={primaryColor}
                                onChange={e => setPrimaryColor(e.target.value)}
                                className='text-xs uppercase'
                            />
                        </div>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label className='text-xs font-normal uppercase font-body'>Secondary Color</label>
                        <div className='flex gap-2'>
                            <Popover>
                                <PopoverTrigger>
                                    <div
                                        className='w-6 h-6 rounded cursor-pointer'
                                        style={{ backgroundColor: secondaryColor }}
                                    />
                                </PopoverTrigger>
                                <PopoverContent className='p-0 border-none'>
                                    <HexColorPicker color={secondaryColor} onChange={setSecondaryColor} />
                                </PopoverContent>
                            </Popover>
                            <Input
                                value={secondaryColor}
                                onChange={e => setSecondaryColor(e.target.value)}
                                className='text-xs uppercase'
                            />
                        </div>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label className='text-xs font-normal uppercase font-body'>Accent Color</label>
                        <div className='flex gap-2'>
                            <Popover>
                                <PopoverTrigger>
                                    <div
                                        className='w-6 h-6 rounded cursor-pointer'
                                        style={{ backgroundColor: accentColor }}
                                    />
                                </PopoverTrigger>
                                <PopoverContent className='p-0 border-none'>
                                    <HexColorPicker color={accentColor} onChange={setAccentColor} />
                                </PopoverContent>
                            </Popover>
                            <Input
                                value={accentColor}
                                onChange={e => setAccentColor(e.target.value)}
                                className='text-xs uppercase'
                            />
                        </div>
                    </div>
                </div>

                {/* Theme Settings */}
                <div className='grid grid-cols-2 gap-6'>
                    <div className='flex flex-col gap-2'>
                        <label className='text-xs font-normal uppercase font-body'>Theme Preset</label>
                        <Select defaultValue='default'>
                            <SelectTrigger>
                                <SelectValue placeholder='Select theme' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='default' className='text-xs font-normal uppercase font-body'>
                                    Default (shadcn/ui)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label className='text-xs font-normal uppercase font-body'>Preferred Theme Mode</label>
                        <Select defaultValue='system'>
                            <SelectTrigger>
                                <SelectValue placeholder='Select mode' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='system' className='text-xs font-normal uppercase font-body'>
                                    System
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Font Settings */}
                <div className='grid grid-cols-2 gap-6'>
                    <div className='flex flex-col gap-2'>
                        <label className='text-xs font-normal uppercase font-body'>Font Family</label>
                        <Select defaultValue='inter'>
                            <SelectTrigger>
                                <SelectValue placeholder='Select font' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='inter' className='text-xs font-normal uppercase font-body'>
                                    Inter
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label className='text-xs font-normal uppercase font-body'>Font Size</label>
                        <div className='flex flex-col gap-4'>
                            <div className='flex items-center gap-4'>
                                <Slider
                                    defaultValue={[fontSize]}
                                    max={24}
                                    min={12}
                                    step={1}
                                    className='flex-1'
                                    onValueChange={value => setFontSize(value[0])}
                                />
                                <span className='text-xs font-normal uppercase font-body'>{fontSize}px</span>
                            </div>
                            <p
                                style={{ fontSize: `${fontSize}px` }}
                                className='text-xs font-normal uppercase font-body'
                            >
                                Trying awesome loro
                            </p>
                        </div>
                    </div>
                </div>

                {/* Additional Font Settings */}
                <div className='grid grid-cols-3 gap-6'>
                    <div className='flex flex-col gap-2'>
                        <label className='text-xs font-normal uppercase font-body'>Font Weight</label>
                        <Select defaultValue='regular'>
                            <SelectTrigger>
                                <SelectValue placeholder='Select weight' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='regular' className='text-xs font-normal uppercase font-body'>
                                    Regular
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label className='text-xs font-normal uppercase font-body'>Error Color</label>
                        <div className='flex gap-2'>
                            <Popover>
                                <PopoverTrigger>
                                    <div
                                        className='w-6 h-6 rounded cursor-pointer'
                                        style={{ backgroundColor: errorColor }}
                                    />
                                </PopoverTrigger>
                                <PopoverContent className='p-0 border-none'>
                                    <HexColorPicker color={errorColor} onChange={setErrorColor} />
                                </PopoverContent>
                            </Popover>
                            <Input
                                value={errorColor}
                                onChange={e => setErrorColor(e.target.value)}
                                className='text-xs uppercase'
                            />
                        </div>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label className='text-xs font-normal uppercase font-body'>Success Color</label>
                        <div className='flex gap-2'>
                            <Popover>
                                <PopoverTrigger>
                                    <div
                                        className='w-6 h-6 rounded cursor-pointer'
                                        style={{ backgroundColor: successColor }}
                                    />
                                </PopoverTrigger>
                                <PopoverContent className='p-0 border-none'>
                                    <HexColorPicker color={successColor} onChange={setSuccessColor} />
                                </PopoverContent>
                            </Popover>
                            <Input
                                value={successColor}
                                onChange={e => setSuccessColor(e.target.value)}
                                className='text-xs uppercase'
                            />
                        </div>
                    </div>
                </div>
                <Button className='w-4/12 self-end text-[10px] font-normal text-white uppercase font-body bg-primary'>
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
