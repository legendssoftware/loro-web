'use client';

import { useState, useEffect, type FC } from 'react';
import { Button } from '@/components/ui/button';
import { PhoneCall } from 'lucide-react';
import toast from 'react-hot-toast';
import { useHelp } from '@/hooks/use-help';
import { useAuthStore } from '@/store/auth-store';

interface FloatingCallButtonProps {
    showOnScroll?: boolean;
    position?: 'bottom-right' | 'bottom-left';
    offset?: number;
}

export const FloatingCallButton: FC<FloatingCallButtonProps> = ({
    showOnScroll = true,
    position = 'bottom-right',
    offset = 24,
}) => {
    const [visible, setVisible] = useState<boolean>(!showOnScroll);
    const { isAuthenticated } = useAuthStore();
    const {
        startCall: originalStartCall,
        endCall,
        isCallActive,
        isCallInitializing,
    } = useHelp();

    // Handle scroll visibility
    useEffect(() => {
        if (!showOnScroll) return;

        const handleScroll = (): void => {
            const scrollY = window.scrollY;
            setVisible(scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [showOnScroll]);

    // Wrap startCall to only work when authenticated
    const startCall = (): void => {
        if (!isAuthenticated) {
            toast.error('Please sign in to use the voice assistant', {
                style: {
                    borderRadius: '5px',
                    background: '#333',
                    color: '#fff',
                    fontFamily: 'var(--font-unbounded)',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    fontWeight: '300',
                    padding: '16px',
                },
                duration: 2000,
                position: 'bottom-center',
                icon: '❌',
            });
            return;
        }

        originalStartCall();
    };

    // Calculate position classes based on props
    const getPositionStyles = (): Record<string, string> => {
        if (position === 'bottom-right') {
            return { right: `${offset}px`, bottom: `${offset}px` };
        }
        return { left: `${offset}px`, bottom: `${offset}px` };
    };

    if (!visible) return null;

    return (
        <div
            className="fixed z-50 transition-all duration-300 ease-in-out"
            style={{
                ...getPositionStyles(),
                transform: visible ? 'scale(1)' : 'scale(0)',
                opacity: visible ? 1 : 0,
            }}
        >
            {isCallActive ? (
                <Button
                    variant="default"
                    size="icon"
                    className="text-white bg-red-500 rounded-full shadow-lg w-14 h-14 hover:bg-red-600 animate-pulse"
                    onClick={endCall}
                >
                    <PhoneCall strokeWidth={1.5} size={24} />
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                    <span className="sr-only">End Assistant Call</span>
                </Button>
            ) : (
                <Button
                    variant="default"
                    size="icon"
                    className="text-white rounded-full shadow-lg w-14 h-14 bg-green-500 hover:bg-green-600"
                    onClick={startCall}
                    disabled={isCallInitializing}
                >
                    <PhoneCall strokeWidth={1.5} size={24} />
                    {isCallInitializing && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    )}
                    <span className="sr-only">Voice Assistant</span>
                </Button>
            )}
        </div>
    );
};
