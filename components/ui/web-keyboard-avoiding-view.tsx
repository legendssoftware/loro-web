'use client';

import React, { useEffect, useRef } from 'react';
import { useKeyboardState } from '@/hooks/use-keyboard-state';
import { cn } from '@/lib/utils';

interface WebKeyboardAvoidingViewProps {
    children: React.ReactNode;
    className?: string;
    behavior?: 'padding' | 'height' | 'position';
    offset?: number;
    enabled?: boolean;
}

/**
 * Web-compatible KeyboardAvoidingView component
 * Automatically adjusts layout when virtual keyboard appears on mobile devices
 */
export const WebKeyboardAvoidingView: React.FC<WebKeyboardAvoidingViewProps> = ({
    children,
    className,
    behavior = 'height',
    offset = 0,
    enabled = true,
}) => {
    const { isVisible, height } = useKeyboardState();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!enabled || typeof window === 'undefined') return;

        const container = containerRef.current;
        if (!container) return;

        // Update CSS custom properties for keyboard state
        container.style.setProperty('--keyboard-visible', isVisible ? '1' : '0');
        container.style.setProperty('--keyboard-height', `${height}px`);

        // Apply behavior-specific adjustments
        if (isVisible) {
            const adjustedHeight = height + offset;

            switch (behavior) {
                case 'padding':
                    container.style.paddingBottom = `${adjustedHeight}px`;
                    break;
                case 'height':
                    // Use calc() to subtract keyboard height from viewport
                    container.style.minHeight = `calc(100vh - ${adjustedHeight}px)`;
                    container.style.maxHeight = `calc(100vh - ${adjustedHeight}px)`;
                    break;
                case 'position':
                    container.style.transform = `translateY(-${adjustedHeight / 2}px)`;
                    break;
            }
        } else {
            // Reset styles when keyboard is hidden
            container.style.paddingBottom = '';
            container.style.minHeight = '';
            container.style.maxHeight = '';
            container.style.transform = '';
        }
    }, [isVisible, height, behavior, offset, enabled]);

    return (
        <div
            ref={containerRef}
            className={cn(
                'transition-all duration-300 ease-in-out',
                // CSS fallbacks for browsers that support dynamic viewport units
                'supports-[height:100dvh]:min-h-dvh',
                className
            )}
            style={{
                // CSS custom properties for advanced styling
                '--keyboard-height': '0px',
                '--keyboard-visible': '0',
            } as React.CSSProperties}
        >
            {children}
        </div>
    );
};

/**
 * Higher-order component version for easier wrapping
 */
export const withWebKeyboardAvoiding = <P extends object>(
    Component: React.ComponentType<P>,
    options?: Omit<WebKeyboardAvoidingViewProps, 'children'>
) => {
    const WrappedComponent: React.FC<P> = (props) => (
        <WebKeyboardAvoidingView {...options}>
            <Component {...props} />
        </WebKeyboardAvoidingView>
    );

    WrappedComponent.displayName = `withWebKeyboardAvoiding(${Component.displayName || Component.name})`;

    return WrappedComponent;
};
