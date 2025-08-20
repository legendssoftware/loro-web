'use client';

import { useState, useEffect, useCallback } from 'react';

interface KeyboardState {
    isVisible: boolean;
    height: number;
    isSupported: boolean;
}

/**
 * Hook to detect virtual keyboard state on mobile web browsers
 * Works with both Android and iOS by combining multiple detection methods
 */
export const useKeyboardState = (): KeyboardState => {
    const [keyboardState, setKeyboardState] = useState<KeyboardState>({
        isVisible: false,
        height: 0,
        isSupported: false,
    });

    const updateKeyboardState = useCallback((isVisible: boolean, height: number = 0) => {
        setKeyboardState(prev => ({
            ...prev,
            isVisible,
            height,
        }));
    }, []);

    useEffect(() => {
        // Check if we're in a browser environment
        if (typeof window === 'undefined') return;

        // Check for Visual Viewport API support (modern approach)
        const hasVisualViewport = 'visualViewport' in window;

        setKeyboardState(prev => ({
            ...prev,
            isSupported: hasVisualViewport || true, // Fallback always supported
        }));

        let initialViewportHeight = window.innerHeight;
        let isKeyboardVisible = false;

        // Method 1: Visual Viewport API (preferred - works on modern browsers)
        const handleVisualViewportChange = () => {
            if (!window.visualViewport) return;

            const { height } = window.visualViewport;
            const keyboardHeight = initialViewportHeight - height;
            const isVisible = keyboardHeight > 150; // Threshold for keyboard detection

            if (isVisible !== isKeyboardVisible) {
                isKeyboardVisible = isVisible;
                updateKeyboardState(isVisible, keyboardHeight);
            }
        };

        // Method 2: Window resize fallback (older browsers)
        const handleWindowResize = () => {
            // Only use this if Visual Viewport API is not available
            if (window.visualViewport) return;

            const currentHeight = window.innerHeight;
            const heightDifference = initialViewportHeight - currentHeight;
            const isVisible = heightDifference > 150; // Threshold for keyboard detection

            if (isVisible !== isKeyboardVisible) {
                isKeyboardVisible = isVisible;
                updateKeyboardState(isVisible, heightDifference);
            }
        };

        // Method 3: Input focus/blur events (additional detection)
        const handleInputFocus = () => {
            // Small delay to allow keyboard to appear
            setTimeout(() => {
                if (window.visualViewport) {
                    handleVisualViewportChange();
                } else {
                    handleWindowResize();
                }
            }, 300);
        };

        const handleInputBlur = () => {
            // Small delay to allow keyboard to disappear
            setTimeout(() => {
                if (window.visualViewport) {
                    handleVisualViewportChange();
                } else {
                    // Reset when no inputs are focused
                    const activeElement = document.activeElement;
                    const isInputFocused = activeElement && (
                        activeElement.tagName === 'INPUT' ||
                        activeElement.tagName === 'TEXTAREA' ||
                        activeElement.getAttribute('contenteditable') === 'true'
                    );

                    if (!isInputFocused) {
                        isKeyboardVisible = false;
                        updateKeyboardState(false, 0);
                    }
                }
            }, 300);
        };

        // Set up event listeners
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleVisualViewportChange);
        } else {
            window.addEventListener('resize', handleWindowResize);
        }

        // Listen for input focus/blur on the document
        document.addEventListener('focusin', handleInputFocus);
        document.addEventListener('focusout', handleInputBlur);

        // Initialize viewport height
        initialViewportHeight = window.innerHeight;

        // Cleanup
        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
            } else {
                window.removeEventListener('resize', handleWindowResize);
            }

            document.removeEventListener('focusin', handleInputFocus);
            document.removeEventListener('focusout', handleInputBlur);
        };
    }, [updateKeyboardState]);

    return keyboardState;
};
