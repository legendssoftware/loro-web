'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SendHorizontal, Paperclip, Mic } from 'lucide-react';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export function ChatDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: 'Hi there, how may I help you today? 🚀',
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        setMessages(prev => [
            ...prev,
            {
                id: Date.now(),
                text: newMessage,
                sender: 'user',
                timestamp: new Date(),
            },
        ]);
        setNewMessage('');

        // Simulate bot response
        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now(),
                    text: 'Thanks for your message. Our support team will get back to you shortly.',
                    sender: 'bot',
                    timestamp: new Date(),
                },
            ]);
        }, 1000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[440px] h-[600px] flex flex-col gap-0 p-0'>
                <DialogHeader className='p-4 flex flex-row items-center justify-between border-b'>
                    <div className='flex items-center gap-3'>
                        <Avatar className='h-10 w-10'>
                            <AvatarFallback className='bg-primary/10 text-primary text-sm font-body uppercase'>
                                LG
                            </AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                            <DialogTitle className='text-sm font-body uppercase font-normal'>LORO GUY</DialogTitle>
                            <p className='text-[10px] text-muted-foreground font-body uppercase'>LORO TECHNICIAN</p>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className='flex-1 px-4'>
                    <div className='space-y-4 py-4'>
                        {messages.map(message => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <Avatar className='h-10 w-10'>
                                    <AvatarFallback
                                        className={`${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'} text-[10px] font-body uppercase`}
                                    >
                                        {message.sender === 'user' ? 'SG' : 'LG'}
                                    </AvatarFallback>
                                </Avatar>
                                <div
                                    className={`flex flex-col gap-1 max-w-[80%] ${message.sender === 'user' ? 'items-end' : ''}`}
                                >
                                    <div
                                        className={`rounded-xl p-3 ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'} font-body font-thin text-xs`}
                                    >
                                        {message.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className='p-4 border-t'>
                    <div className='flex items-center gap-2 bg-muted rounded-xl p-2'>
                        <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 text-muted-foreground hover:text-primary'
                        >
                            <Paperclip className='h-4 w-4' />
                        </Button>
                        <Input
                            placeholder='explain the issue here...'
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            className='flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-xs'
                        />
                        <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 text-muted-foreground hover:text-primary'
                        >
                            <Mic className='h-4 w-4' />
                        </Button>
                        <Button
                            type='submit'
                            size='icon'
                            className='h-8 w-8 bg-primary hover:bg-primary/90'
                            onClick={() => handleSendMessage()}
                        >
                            <SendHorizontal className='h-4 w-4' />
                        </Button>
                    </div>
                    <p className='text-[9px] text-center text-muted-foreground mt-2 font-body uppercase'>
                        Powered by LORO AI
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
