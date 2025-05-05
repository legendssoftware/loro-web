'use client';

import { useEffect, useCallback } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { usePathname } from 'next/navigation';

// Define tour steps for different routes
const tourSteps: { [key: string]: DriveStep[] } = {
    '/': [
        // Steps for the Home page (assuming '/' is the home route)
        {
            // Intro Step (No element targets the center)
            popover: {
                title: '👋 WELCOME!',
                description:
                    "Let\'s quickly explore the main navigation elements to get you oriented.",
                side: 'left', // Doesn't matter much when no element
                align: 'center',
            },
        },
        {
            element: '#tour-step-side-drawer-trigger',
            popover: {
                title: 'MAIN NAVIGATION',
                description:
                    '☰ Access all major sections like Clients, Tasks, and Settings from here.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#tour-step-branch-name',
            popover: {
                title: 'CURRENT CONTEXT',
                description:
                    "🏢 Displays your active branch. If you're a client, it shows 'Client Portal'.",
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#tour-step-sign-out',
            popover: {
                title: 'SIGN OUT',
                description:
                    '🔒 Ready to leave? Click here to securely end your session.',
                side: 'bottom',
                align: 'end',
            },
        },
        {
            element: '#tour-step-help-trigger',
            popover: {
                title: 'NEED ASSISTANCE?',
                description:
                    '❓ Get help! Use the voice assistant for quick support or restart this tour.',
                side: 'bottom',
                align: 'end',
            },
        },
        {
            element: '#tour-step-theme-toggler',
            popover: {
                title: 'DISPLAY MODE',
                description:
                    '🎨 Prefer light or dark? Toggle your interface theme anytime.',
                side: 'left',
                align: 'start',
            },
        },
        {
            element: '#tour-step-avatar',
            popover: {
                title: 'YOUR PROFILE',
                description:
                    '👤 Your avatar. The green dot confirms your license is active.',
                side: 'left',
                align: 'end',
            },
        },
        {
            element: '#tour-step-home-content',
            popover: {
                title: 'DASHBOARD OVERVIEW',
                description:
                    '📊 This central area shows key reports and data relevant to the current page.',
                side: 'top', // Changed side for potentially better visibility
                align: 'center',
            },
        },
        {
            // Outro Step (No element targets the center)
            popover: {
                title: '🎉 ALL SET!',
                description:
                    "That covers the main navigation! You\'re ready to explore the dashboard.",
                side: 'right', // Doesn't matter much when no element
                align: 'center',
            },
        },
    ],
    // Define steps for other routes here, e.g., '/clients': [...]
};

export function useInteractiveTour() {
    const pathname = usePathname();

    const startTour = useCallback(() => {
        const stepsForCurrentRoute = tourSteps[pathname] || [];

        if (stepsForCurrentRoute.length === 0) {
            console.warn(`No tour steps defined for route: ${pathname}`);
            return;
        }

        const driverObj = driver({
            showProgress: true,
            allowClose: true,
            popoverClass: 'dashboard-tour-popover',
            steps: stepsForCurrentRoute,
            onDestroyStarted: () => {
                if (!driverObj.isActive()) {
                    return;
                }
                driverObj.destroy();
            },
        });

        // Add custom CSS for the popover
        const style = document.createElement('style');
        style.textContent = `
          .dashboard-tour-popover {
            font-family: var(--font-body);
            border-radius: 8px;
          }
          .driver-popover-title {
            font-family: var(--font-body);
            font-size: 10px; /* Use text-xs equivalent */
            text-transform: uppercase;
            font-weight: 600; /* Adjust weight as needed */
            margin-bottom: 4px;
          }
          .driver-popover-description {
            font-family: var(--font-body);
            font-size: 12px; /* Adjust description font size if needed */
            font-weight: 300;
          }
          .driver-navigation-btns button {
             font-family: var(--font-body);
             text-transform: uppercase;
             font-size: 10px;
             padding: 6px 10px;
          }
        `;
        document.head.appendChild(style);

        driverObj.drive();

        return () => {
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
            if (driverObj.isActive()) {
                driverObj.destroy();
            }
        };
    }, [pathname]);

    return { startTour };
}
