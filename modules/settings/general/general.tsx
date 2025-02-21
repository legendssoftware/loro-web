'use client';

import { Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function GeneralModule() {
    return (
        <div className='flex flex-col gap-8'>
            <div className='flex flex-col gap-6 mx-auto xl:w-11/12'>
                <div>
                    <h2 className='font-normal uppercase text-md font-body'>General Settings</h2>
                    <p className='text-xs font-normal uppercase font-body text-muted-foreground'>
                        Manage your business details
                    </p>
                </div>
                <div className='grid grid-cols-2 gap-6'>
                    <div className='flex flex-col gap-1'>
                        <label className='text-xs font-normal uppercase font-body'>Business Name</label>
                        <Input placeholder='LORO' className='text-xs placeholder:text-[10px]' />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label className='text-xs font-normal uppercase font-body'>Address</label>
                        <Input
                            placeholder='123 Innovation Drive, Midrand'
                            className='text-[10px] placeholder:text-[10px] placeholder:uppercase'
                        />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label className='text-xs font-normal uppercase font-body'>Phone</label>
                        <div className='flex gap-2'>
                            <Select defaultValue='+27'>
                                <SelectTrigger className='w-[100px]'>
                                    <SelectValue placeholder='Code' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='+27' className='text-xs font-normal uppercase font-body'>
                                        +27
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Input placeholder='123' className='flex-1' />
                        </div>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label className='text-xs font-normal uppercase font-body'>Email</label>
                        <Input
                            placeholder='info@loro.co.za'
                            className='text-[10px] placeholder:text-[10px] placeholder:uppercase'
                        />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label className='text-xs font-normal uppercase font-body'>Tax Id</label>
                        <Input placeholder='VAT123456789' className='text-xs placeholder:text-[10px]' />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label className='text-xs font-normal uppercase font-body'>Currency</label>
                        <Select defaultValue='ZAR'>
                            <SelectTrigger>
                                <SelectValue placeholder='Select currency' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='ZAR' className='text-xs font-normal uppercase font-body'>
                                    ZAR (South African Rand)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label className='text-xs font-normal uppercase font-body'>Timezone</label>
                        <Select defaultValue='SAST'>
                            <SelectTrigger>
                                <SelectValue placeholder='Select timezone' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='SAST' className='text-xs font-normal uppercase font-body'>
                                    South Africa Standard Time (SAST)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label className='text-xs font-normal uppercase font-body'>Language</label>
                        <Select defaultValue='en'>
                            <SelectTrigger>
                                <SelectValue placeholder='Select language' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='en' className='text-xs font-normal uppercase font-body'>
                                    English
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className='flex flex-col gap-2'>
                    <label className='text-xs font-normal uppercase font-body'>Business Logo</label>
                    <div className='flex items-end gap-4'>
                        <div className='relative w-32 h-32 overflow-hidden border rounded-lg bg-background'>
                            <div className='absolute top-2 right-2'>
                                <Button variant='destructive' size='icon' className='w-6 h-6'>
                                    <Minus className='w-4 h-4' />
                                </Button>
                            </div>
                            <div className='flex items-center justify-center h-full'>
                                <span className='text-xl font-bold uppercase text-primary font-body'>LORO</span>
                            </div>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Button
                                size='sm'
                                className='text-[10px] font-normal uppercase font-body cursor-pointer bg-primary text-white'
                            >
                                Change Logo
                            </Button>
                            <p className='text-[10px] u font-normal text-muted-foreground font-body uppercase'>
                                Recommended: 256x256px PNG or JPG file. Maximum file size of 5MB.
                            </p>
                        </div>
                    </div>
                </div>
                <Button className='w-fit text-[10px] font-normal text-white uppercase font-body bg-primary'>
                    Save Changes
                </Button>
            </div>
            <div className='flex flex-col gap-6 mx-auto xl:w-11/12'>
                <div>
                    <h2 className='font-normal uppercase text-md font-body'>App Billing</h2>
                    <p className='text-[10px] font-normal uppercase text-muted-foreground font-body'>
                        Manage your subscription, view invoices, and control licenses
                    </p>
                </div>
                <div className='grid grid-cols-2 gap-6'>
                    <Card className='p-6'>
                        <div className='flex flex-col justify-between h-full gap-4'>
                            <div className='flex items-start justify-between'>
                                <div>
                                    <h2 className='font-normal uppercase text-md font-body'>Professional</h2>
                                    <p className='text-[10px] font-normal uppercase text-muted-foreground font-body'>
                                        Next billing date: 2024-02-01
                                    </p>
                                    <p className='mt-2 text-lg font-semibold text-primary font-body'>R199 / month</p>
                                </div>
                                <span className='px-3 py-1 text-[10px] font-normal uppercase rounded font-body bg-primary text-white'>
                                    Monthly
                                </span>
                            </div>
                            <Button className='w-full text-xs font-normal text-white uppercase font-body bg-primary'>
                                Upgrade Plan
                            </Button>
                        </div>
                    </Card>
                    <Card className='p-6'>
                        <div className='flex flex-col gap-4'>
                            <h2 className='font-normal uppercase text-md font-body'>Payment Method</h2>
                            <div className='space-y-2'>
                                <div className='flex justify-between'>
                                    <span className='text-xs font-normal uppercase font-body'>Card Type</span>
                                    <span className='text-xs font-normal uppercase font-body'>Visa</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-xs font-normal uppercase font-body'>Card Number</span>
                                    <span className='text-xs font-normal uppercase font-body'>**** **** **** 4242</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-xs font-normal uppercase font-body'>Expiry Date</span>
                                    <span className='text-xs font-normal uppercase font-body'>12/24</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-xs font-normal uppercase font-body'>Status</span>
                                    <span className='text-xs font-normal text-green-500 uppercase font-body'>
                                        Valid
                                    </span>
                                </div>
                            </div>
                            <Button className='w-full text-xs font-normal text-white uppercase font-body bg-primary'>
                                Update Payment Method
                            </Button>
                        </div>
                    </Card>
                </div>
                <div className='flex flex-col gap-4'>
                    <h2 className='font-normal uppercase text-md font-body'>Available Plans</h2>
                    <div className='grid grid-cols-4 gap-6'>
                        <Card className='p-6'>
                            <div className='flex flex-col justify-between h-full gap-4'>
                                <div>
                                    <h2 className='font-normal uppercase text-md font-body'>Starter</h2>
                                    <p className='text-xs text-muted-foreground font-body'>R99/month</p>
                                </div>
                                <ul className='space-y-2 text-sm'>
                                    <li className='text-xs font-normal uppercase font-body'>• Up to 5 Users</li>
                                    <li className='text-xs font-normal uppercase font-body'>• 1 Branch</li>
                                    <li className='text-xs font-normal uppercase font-body'>• 5GB Storage</li>
                                    <li className='text-xs font-normal uppercase font-body'>• 10K API Calls</li>
                                    <li className='text-xs font-normal uppercase font-body'>• 2 Integrations</li>
                                </ul>
                                <Button
                                    size='sm'
                                    className='w-full text-xs font-normal text-white uppercase font-body bg-primary'
                                >
                                    Select Plan
                                </Button>
                            </div>
                        </Card>
                        <Card className='p-6 border-primary'>
                            <div className='flex flex-col justify-between h-full gap-4'>
                                <div>
                                    <h2 className='font-normal uppercase text-md font-body'>Professional</h2>
                                    <p className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                        R199/month
                                    </p>
                                </div>
                                <ul className='space-y-2 text-sm'>
                                    <li className='text-xs font-normal uppercase font-body'>• Up to 20 Users</li>
                                    <li className='text-xs font-normal uppercase font-body'>• 3 Branches</li>
                                    <li className='text-xs font-normal uppercase font-body'>• 20GB Storage</li>
                                    <li className='text-xs font-normal uppercase font-body'>• 500K API Calls</li>
                                    <li className='text-xs font-normal uppercase font-body'>• 5 Integrations</li>
                                </ul>
                                <Button
                                    size='sm'
                                    className='w-full font-normal text-white uppercase border border-primary bg-primary font-body'
                                >
                                    Current Plan
                                </Button>
                            </div>
                        </Card>
                        <Card className='p-6'>
                            <div className='flex flex-col justify-between h-full gap-4'>
                                <div>
                                    <h2 className='font-normal uppercase text-md font-body'>Business</h2>
                                    <p className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                        R499/month
                                    </p>
                                </div>
                                <ul className='space-y-2 text-sm'>
                                    <li className='text-xs font-normal uppercase font-body'>• Up to 50 Users</li>
                                    <li className='text-xs font-normal uppercase font-body'>• 10 Branches</li>
                                    <li className='text-xs font-normal uppercase font-body'>• 100GB Storage</li>
                                    <li className='text-xs font-normal uppercase font-body'>• 2M API Calls</li>
                                    <li className='text-xs font-normal uppercase font-body'>• 15 Integrations</li>
                                </ul>
                                <Button
                                    size='sm'
                                    className='w-full text-xs font-normal text-white uppercase font-body bg-primary'
                                >
                                    Upgrade Plan
                                </Button>
                            </div>
                        </Card>
                        <Card className='p-6'>
                            <div className='flex flex-col justify-between h-full gap-4'>
                                <div>
                                    <h2 className='font-normal uppercase text-md font-body'>Enterprise</h2>
                                    <p className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                        R999/month
                                    </p>
                                </div>
                                <ul className='space-y-2 text-sm'>
                                    <li className='text-xs font-normal uppercase font-body'>• Unlimited Users</li>
                                    <li className='text-xs font-normal uppercase font-body'>• Unlimited Branches</li>
                                    <li className='text-xs font-normal uppercase font-body'>• 1TB Storage</li>
                                    <li className='text-xs font-normal uppercase font-body'>• 10M API Calls</li>
                                    <li className='text-xs font-normal uppercase font-body'>
                                        • Unlimited Integrations
                                    </li>
                                </ul>
                                <Button
                                    size='sm'
                                    className='w-full text-xs font-normal text-white uppercase font-body bg-primary'
                                >
                                    Contact Sales
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
                <div className='flex flex-col gap-4'>
                    <h2 className='font-normal uppercase text-md font-body'>Recent Invoices</h2>
                    <Card>
                        <table className='w-full'>
                            <thead>
                                <tr className='text-sm border-b'>
                                    <th className='p-4 text-xs font-normal text-left uppercase font-body'>
                                        Invoice ID
                                    </th>
                                    <th className='p-4 text-xs font-normal text-left uppercase font-body'>Date</th>
                                    <th className='p-4 text-xs font-normal text-left uppercase font-body'>Amount</th>
                                    <th className='p-4 text-xs font-normal text-left uppercase font-body'>Status</th>
                                    <th className='p-4 text-xs font-normal text-right uppercase font-body'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { id: 'INV-001', date: '2024-01-01', amount: 'R199', status: 'Paid' },
                                    { id: 'INV-002', date: '2023-12-01', amount: 'R199', status: 'Paid' },
                                    { id: 'INV-003', date: '2023-11-01', amount: 'R199', status: 'Paid' },
                                ].map(invoice => (
                                    <tr key={invoice.id} className='text-sm border-b last:border-0 hover:bg-muted'>
                                        <td className='p-4 text-[10px] font-normal uppercase font-body'>
                                            {invoice.id}
                                        </td>
                                        <td className='p-4 text-[10px] font-normal uppercase font-body'>
                                            {invoice.date}
                                        </td>
                                        <td className='p-4 text-[10px] font-normal uppercase font-body'>
                                            {invoice.amount}
                                        </td>
                                        <td className='p-4 text-[10px] font-normal uppercase font-body'>
                                            {invoice.status}
                                        </td>
                                        <td className='p-4 text-right text-[10px] font-normal uppercase font-body'>
                                            <Button variant='ghost' className='text-xs uppercase'>
                                                Download
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </div>
            </div>
        </div>
    );
}
