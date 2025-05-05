'use client';

import { useCallback } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';

// Define tour steps for different routes
const tourSteps: { [key: string]: DriveStep[] } = {
    // ====================
    // Home Page Tour (/)
    // ====================
    '/': [
        {
            popover: {
                title: '👋 WELCOME!',
                description:
                    "Let's quickly explore the main navigation elements to get you oriented.",
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
                    "🏢 Displays your active branch. If you\'re a client, it shows \'Client Portal\'.",
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
                side: 'top',
                align: 'center',
            },
        },
        {
            popover: {
                title: '🎉 ALL SET!',
                description:
                    "That covers the main navigation! You\'re ready to explore the dashboard.",
                align: 'center',
            },
        },
    ],

    // ====================
    // Leads Page Tour (/leads)
    // ====================
    '/leads': [
        {
            element: '#leads-page-title',
            popover: {
                title: '👋 LEADS DASHBOARD',
                description:
                    "Welcome to the Leads section! Manage potential customer interactions and track their progress.",
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#add-lead-button',
            popover: {
                title: 'ADD NEW LEAD',
                description:
                    '➕ Use this button to capture details for a new potential customer, often entered via the dashboard.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#leads-table',
            popover: {
                title: 'LEADS COLLECTION',
                description:
                    '📋 This list shows leads, primarily collected by field agents via the Loro mobile app (available on app stores or the landing page). Click a lead to view details.',
                side: 'top',
                align: 'center',
            },
        },
        {
            element: '.lead-card',
            popover: {
                title: 'LEAD DETAILS',
                description:
                    "🖱️ Clicking a lead opens a detailed modal. Here you can review information, see activity history, and use quick actions.",
                side: 'right',
                align: 'start',
            },
        },
        {
            element: '#lead-quick-actions-footer',
            popover: {
                title: 'QUICK ACTIONS (in Modal)',
                description:
                    '⚡ Use the buttons in the modal footer to quickly update status (Pending, Review, Approved, Declined, Cancelled), Create a Task, Convert to Client, or Delete the lead.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            popover: {
                title: '💡 LEADS TOUR COMPLETE',
                description:
                    "You've got the basics of managing leads! Keep statuses updated for accurate tracking.",
                align: 'center',
            },
        },
    ],

    // ====================
    // Clients Page Tour (/clients)
    // ====================
    '/clients': [
        {
            element: '#clients-page-title',
            popover: {
                title: '👋 CLIENT MANAGEMENT',
                description:
                    "Manage all your active clients, view their details, and track interactions.",
                side: 'bottom',
            },
        },
        {
            element: '#add-client-button',
            popover: {
                title: 'ADD NEW CLIENT',
                description:
                    '➕ Use this button to register a new client in the system.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#clients-filters',
            popover: {
                title: 'FILTER & SEARCH CLIENTS',
                description:
                    '🔍 Find specific clients using search or filter by status, risk level, or other criteria.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#clients-table',
            popover: {
                title: 'CLIENT LIST',
                description:
                    '📋 Browse, search, and manage your existing clients here. Click to view details.',
                side: 'top',
            },
        },
        {
            element: '.client-row',
            popover: {
                title: 'CLIENT DETAILS',
                description:
                    '🖱️ Clicking a client opens their detailed profile, showing contact info, address, history, associated tasks, and more.',
                side: 'right',
                align: 'start',
            },
        },
        {
            popover: {
                title: '💡 CLIENTS TOUR COMPLETE',
                description: 'You now know how to navigate the Clients page!',
                align: 'center',
            },
        },
    ],

    // ====================
    // Staff Page Tour (/staff)
    // ====================
    '/staff': [
        {
            element: '#staff-page-title',
            popover: {
                title: '👥 STAFF MANAGEMENT',
                description:
                    'Manage your team members, roles, and permissions here.',
                side: 'bottom',
            },
        },
        {
            element: '#add-staff-button',
            popover: {
                title: 'ADD STAFF MEMBER',
                description:
                    '➕ Onboard new employees and assign their roles and branch.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#user-status-filter-trigger',
            popover: {
                title: 'FILTER BY STATUS',
                description:
                    '🚦 Filter the staff list by their current status (Active, Pending, Suspended, etc.).',
                side: 'bottom',
            },
        },
        {
            element: '#user-access-level-filter-trigger',
            popover: {
                title: 'FILTER BY ACCESS LEVEL',
                description:
                    '🛡️ Filter the list by user role (Admin, Manager, Worker, etc.).',
                side: 'bottom',
            },
        },
        {
            element: '#user-branch-filter-trigger',
            popover: {
                title: 'FILTER BY BRANCH',
                description:
                    '🏢 Filter the staff list to show members of a specific branch.',
                side: 'bottom',
            },
        },
        {
            element: '#clear-user-filters-button',
            popover: {
                title: 'CLEAR FILTERS',
                description:
                    '❌ Click here to remove all active filters and view the full staff list.',
                side: 'left',
                align: 'end',
            },
        },
        {
            element: '#staff-table',
            popover: {
                title: 'STAFF LIST',
                description:
                    '📋 View all staff members based on filters. See their role, status, and branch.',
                side: 'top',
            },
        },
        {
            element: '.staff-row',
            popover: {
                title: 'VIEW/EDIT STAFF',
                description:
                    '🖱️ Clicking a staff member opens their details modal. From there, you can view full information and potentially perform actions like editing details, changing status/role, or resetting credentials (permissions permitting).',
                side: 'right',
                align: 'start',
            },
        },
        {
            popover: {
                title: '💡 STAFF TOUR COMPLETE',
                description: 'Now you know how to manage your staff records and access!',
                align: 'center',
            },
        },
    ],

    // ====================
    // Tasks Page Tour (/tasks)
    // ====================
    '/tasks': [
        {
            element: '#tasks-page-title',
            popover: {
                title: '✅ TASK MANAGEMENT',
                description:
                    'Create, assign, and monitor work tasks for your team. Track progress and ensure timely completion.',
                side: 'bottom',
            },
        },
        {
            element: '#add-task-button',
            popover: {
                title: 'CREATE NEW TASK',
                description:
                    '➕ Define new tasks, add descriptions, link them to clients or projects, assign users, and set priorities and deadlines.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#task-view-switcher',
            popover: {
                title: 'CHANGE VIEW',
                description:
                    '👀 Switch between List, Board (Kanban), or Calendar views to visualize tasks in the way that suits you best.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#tasks-filters',
            popover: {
                title: 'FILTER TASKS',
                description:
                    '🔍 Use filters to find tasks by status (Pending, In Progress, Done), priority, assignee, client, or due date.',
                side: 'bottom',
            },
        },
        {
            element: '#tasks-board',
            popover: {
                title: 'TASK OVERVIEW',
                description:
                    '📋 See all tasks based on your current view and filters. Drag and drop (on Board view) to change status or click a task card/row to see full details.',
                side: 'top',
            },
        },
        {
            element: '.task-card',
            popover: {
                title: 'TASK DETAILS',
                description:
                    '🖱️ Clicking a task opens its details. Review the description, check linked client info, see updates, and change its status.',
                side: 'right',
                align: 'start',
            },
        },
        {
            popover: {
                title: '💡 TASKS TOUR COMPLETE',
                description: 'You\'re ready to manage your team\'s workload effectively!',
                align: 'center',
            },
        },
    ],

    // ====================
    // Claims Page Tour (/claims)
    // ====================
    '/claims': [
        {
            element: '#claims-page-title',
            popover: {
                title: '💸 CLAIMS MANAGEMENT',
                description:
                    'Review, approve, or reject expense and other claims submitted by staff efficiently.',
                side: 'bottom',
            },
        },
        {
            element: '#claims-filters',
            popover: {
                title: 'FILTER CLAIMS',
                description:
                    '🔍 Find specific claims using filters for status (Pending, Approved, Rejected), submitting user, claim type, or date range.',
                side: 'bottom',
            },
        },
        {
            element: '#claims-table',
            popover: {
                title: 'CLAIMS LIST',
                description:
                    '📋 This table shows all submitted claims matching your filters. See key info like submitter, amount, and status at a glance.',
                side: 'top',
            },
        },
        {
            element: '.claim-row',
            popover: {
                title: 'REVIEW CLAIM DETAILS',
                description:
                    '🖱️ Click on a claim row to open the details modal. Review the submitted information, check any attached receipts or documents, and then Approve or Reject the claim with an optional comment.',
                side: 'right',
                align: 'start',
            },
        },
        {
            popover: {
                title: '💡 CLAIMS TOUR COMPLETE',
                description: 'You can now efficiently manage and process staff claims!',
                align: 'center',
            },
        },
    ],

    // ====================
    // Journals Page Tour (/journals)
    // ====================
    '/journals': [
        {
            element: '#journals-page-title',
            popover: {
                title: '📓 JOURNALS & ACTIVITY LOGS',
                description:
                    'Review activity logs, notes, and interactions entered by staff, often linked to clients or tasks.',
                side: 'bottom',
            },
        },
        {
            element: '#journals-filters',
            popover: {
                title: 'FILTER JOURNAL ENTRIES',
                description:
                    '🔍 Search for specific journal entries by the user who created them, a date range, or the client/task they are linked to.',
                side: 'bottom',
            },
        },
        {
            element: '#journals-table',
            popover: {
                title: 'JOURNAL FEED / LIST',
                description:
                    '📋 Browse the chronological log of activities and notes submitted by your team according to your filters.',
                side: 'top',
            },
        },
        {
            element: '.journal-entry',
            popover: {
                title: 'VIEW ENTRY DETAILS',
                description:
                    '📄 Click an entry to read the full note or log details entered by the staff member.',
                side: 'right',
                align: 'start',
            },
        },
        {
            popover: {
                title: '💡 JOURNALS TOUR COMPLETE',
                description: 'Stay informed about team activities and client interactions!',
                align: 'center',
            },
        },
    ],

    // ====================
    // Map Page Tour (/map)
    // ====================
    '/map': [
        {
            element: '#map-container',
            popover: {
                title: '🗺️ LIVE OPERATIONS MAP',
                description:
                    'Visualize real-time locations of your field staff, view client locations, active task sites, and even competitor positions.',
                side: 'top',
                align: 'center',
            },
        },
        {
            element: '#map-filters',
            popover: {
                title: 'MAP FILTERS & LAYERS',
                description:
                    '👤 Toggle visibility for specific users, teams, clients, tasks, or competitors. You can also toggle layers like live traffic or predefined geofence zones.',
                side: 'left',
                align: 'start',
            },
        },
        {
            element: '.map-marker',
            popover: {
                title: 'INTERACTIVE MAP MARKERS',
                description:
                    '🖱️ Click on any marker (user, client, task, competitor) to pop up a card with more details, status, and recent activity information.',
                side: 'right',
                align: 'start',
            },
        },
        {
            element: '#map-controls',
            popover: {
                title: 'MAP CONTROLS',
                description:
                    '➕ Zoom in/out and pan the map to focus on specific areas of operation.',
                side: 'left',
                align: 'end',
            },
        },
        {
            popover: {
                title: '💡 MAP TOUR COMPLETE',
                description: 'Get a real-time geographical overview of your operations!',
                align: 'center',
            },
        },
    ],

    // ====================
    // Quotations Page Tour (/quotations)
    // ====================
    '/quotations': [
        {
            element: '#quotations-page-title',
            popover: {
                title: '📝 QUOTATION MANAGEMENT',
                description:
                    'Create, send, manage, and track customer quotations. Monitor their status from draft to conversion into orders.',
                side: 'bottom',
            },
        },
        {
            element: '#add-quotation-button',
            popover: {
                title: 'CREATE NEW QUOTATION',
                description:
                    '➕ Generate new quotations for clients. Add products or services, specify quantities, and set pricing.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#quotations-filters',
            popover: {
                title: 'FILTER QUOTATIONS',
                description:
                    '🔍 Find quotations by status (Draft, Sent, Approved, Rejected, Converted), client, or date range.',
                side: 'bottom',
            },
        },
        {
            element: '#quotations-table',
            popover: {
                title: 'QUOTATION LIST',
                description:
                    '📋 View all quotations matching your filters, their current status, total value, and associated client. Click any row to manage it.',
                side: 'top',
            },
        },
        {
            element: '.quotation-row',
            popover: {
                title: 'MANAGE QUOTATION DETAILS',
                description:
                    '🖱️ Open a quotation to review/edit items, adjust pricing, use the integrated chat to discuss with the client (if applicable), send it, and finally convert it to an order upon client approval.',
                side: 'right',
                align: 'start',
            },
        },
        {
            popover: {
                title: '💡 QUOTATIONS TOUR COMPLETE',
                description: 'Streamline your sales workflow from initial quote to confirmed order!',
                align: 'center',
            },
        },
    ],

    // ====================
    // Inventory Page Tour (/inventory)
    // ====================
    '/inventory': [
        {
            element: '#inventory-page-title',
            popover: {
                title: '📦 INVENTORY & STOCK',
                description:
                    'Track product stock levels across locations, manage inventory value, and perform stock adjustments.',
                side: 'bottom',
            },
        },
        {
            element: '#inventory-search-filter',
            popover: {
                title: 'SEARCH & FILTER PRODUCTS',
                description:
                    '🔍 Quickly find specific products by name or SKU. Filter the list by category, location, or stock status (e.g., show only low stock items).',
                side: 'bottom',
            },
        },
        {
            element: '#inventory-table',
            popover: {
                title: 'STOCK LEVEL OVERVIEW',
                description:
                    '📋 View current stock quantities, cost, and total value for all products based on your filters. Monitor stock movements.',
                side: 'top',
            },
        },
        {
            element: '#adjust-stock-button',
            popover: {
                title: 'ADJUST STOCK QUANTITIES',
                description:
                    '📊 Use this function (permissions permitting) to manually update stock quantities after a physical count, receiving new stock, or correcting discrepancies.',
                side: 'left',
                align: 'start',
            },
        },
        {
            element: '#inventory-reports-link',
            popover: {
                title: 'INVENTORY REPORTS',
                description:
                    '📈 Access detailed reports on inventory valuation, stock movement history, and low stock alerts.',
                side: 'left',
                align: 'end',
            },
        },
        {
            popover: {
                title: '💡 INVENTORY TOUR COMPLETE',
                description: 'Keep your stock levels accurate and gain insights into inventory value!',
                align: 'center',
            },
        },
    ],

    // ====================
    // Settings Page Tour (/settings)
    // ====================
    '/settings': [
        {
            element: '#settings-page-title',
            popover: {
                title: '⚙️ APPLICATION SETTINGS',
                description:
                    'Configure organization details, manage user roles & permissions, set up integrations, manage billing, and personalize application behavior.',
                side: 'bottom',
            },
        },
        {
            element: '#settings-navigation',
            popover: {
                title: 'SETTINGS CATEGORIES',
                description:
                    '📂 Use this navigation menu to switch between different configuration sections like Your Profile, Organization Settings, User Roles, Branch Management, Integrations, Billing, etc.',
                side: 'right',
                align: 'start',
            },
        },
        {
            element: '#settings-content-area',
            popover: {
                title: 'CONFIGURE OPTIONS',
                description:
                    '✏️ Within the selected category, you can view and modify various settings. Adjust options and remember to save your changes where applicable!',
                side: 'top',
            },
        },
        {
            popover: {
                title: '💡 SETTINGS TOUR COMPLETE',
                description: 'Tailor the application settings to perfectly fit your organization\'s needs!',
                align: 'center',
            },
        },
    ],
};

export function useInteractiveTour() {
    const pathname = usePathname();

    const startTour = useCallback(() => {
        const stepsForCurrentRoute = tourSteps[pathname] || [];

        if (stepsForCurrentRoute.length === 0) {
            console.warn(`No tour steps defined for route: ${pathname}`);
            // Optionally show a toast message
            toast.error(`No interactive tour available for this page yet.`, {
                style: {
                    borderRadius: '5px',
                    background: '#333',
                    color: '#fff',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    fontWeight: '300',
                    padding: '16px',
                },
                duration: 2500,
                position: 'bottom-center',
                icon: ' TOUR🏗️',
            });
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

        const style = document.createElement('style');
        style.textContent = `
          .dashboard-tour-popover {
            font-family: var(--font-body);
            border-radius: 8px;
          }
          .driver-popover-title {
            font-family: var(--font-body);
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 4px;
          }
          .driver-popover-description {
            font-family: var(--font-body);
            font-size: 12px;
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
