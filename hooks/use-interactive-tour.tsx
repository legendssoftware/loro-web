'use client';

import { useCallback } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';

// Define tour steps for different routes
const tourSteps: { [key: string]: DriveStep[] } = {
    // ====================
    // Landing Page Tour (/landing-page)
    // ====================
    '/landing-page': [
        {
            popover: {
                title: '👋 Hey there!',
                description:
                    "Welcome to Loro CRM!, Let's explore our landing page and learn how to get the most out of your visit.",
                align: 'center',
            },
        },
        {
            element: '#learn-about-loro-button',
            popover: {
                title: '📞 INSTANT ASSISTANCE',
                description:
                    "Have questions about Loro? On desktop, click the green learn about loro button in the top menu to start a voice call with our AI assistant. On mobile, tap the menu icon in the top-right to access this feature. Ask anything about Loro's capabilities!",
                side: 'bottom',
                align: 'center',
            },
        },
        {
            popover: {
                title: 'DISCOVER LORO CRM',
                description:
                    "Scroll down to explore Loro's powerful features, or click Sign In or Sign Up to get started with your account.",
                align: 'center',
            },
        },
    ],

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
            element: '#tour-step-report-toggle',
            popover: {
                title: 'REPORT MODE TOGGLE',
                description:
                    "📊 Click to switch between User and Organization reports. When on User mode, you'll see personal metrics and data. Organization mode shows company-wide analytics and team performance. The display shows the actual user or organization name for easy identification.",
                side: 'bottom',
                align: 'center',
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
                title: '🔄 REAL-TIME DATA ARCHITECTURE',
                description:
                    'Our dashboard operates with a 0.5% error rate and refreshes every 5 minutes. Data is cached for optimal performance with a 15-minute expiration to balance freshness and system load.',
                align: 'center',
            },
        },
        {
            popover: {
                title: '📊 LIVE DATA PROCESSING',
                description:
                    'Live metrics are processed using a distributed stream architecture with incremental updates. This provides near real-time insights while maintaining system stability across high user loads.',
                align: 'center',
            },
        },
        {
            element: '#live-overview-refresh-button',
            popover: {
                title: '🔄 MANUAL REFRESH',
                description:
                    'Need the very latest data immediately? Click this refresh button at any time to pull the most current metrics directly from our data services. Perfect when making time-sensitive decisions.',
                side: 'bottom',
                align: 'end',
            },
        },
        {
            element: '#toggle-license-info-button',
            popover: {
                title: '👁️ TOGGLE VISIBILITY',
                description:
                    'Click this button to hide or show the License Information card below, giving you more space if needed.',
                side: 'bottom',
                align: 'end',
            },
        },
        {
            element: '#live-overview-license-info',
            popover: {
                title: '🔑 LICENSE DETAILS',
                description:
                    'Displays your current Loro CRM license plan, status, validity, and user/branch limits. Keep an eye on this to ensure smooth operation!',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#toggle-summary-cards-button',
            popover: {
                title: '👁️ TOGGLE SUMMARY VISIBILITY',
                description:
                    'Use this button to collapse or expand the entire grid of summary cards below. Handy for focusing on the detailed charts!',
                side: 'bottom',
                align: 'end',
            },
        },
        {
            element: '#live-overview-summary-cards-grid',
            popover: {
                title: '📊 Key Metrics at a Glance!',
                description:
                    "This top section gives you a powerful, summarized view of your core operational areas. Each card highlights crucial numbers for Workforce, Tasks, Leads, Sales, and Clients. Let's look at them one by one! 👇",
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-summary-card-attendance-stats',
            popover: {
                title: '⏱️ ATTENDANCE AVERAGES',
                description:
                    'Quickly see the average shift duration and average break time for your team today. Useful for understanding overall work patterns.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-summary-card-checkins',
            popover: {
                title: '📍 CHECK-IN COUNT',
                description:
                    'Shows the total number of check-ins recorded today, including client visits. Helps monitor daily activity levels.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-summary-card-workforce',
            popover: {
                title: '👥 Workforce Snapshot',
                description:
                    'Check your team\'s pulse! See the "Total Employees" (14) and how many are "Active Now" (0 in this example). This gives you a quick understanding of your current operational capacity. 💪',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-summary-card-tasks',
            popover: {
                title: '✅ Tasks Tracker',
                description:
                    'Stay on top of productivity! This card shows how many tasks were "Completed Today" (7) and how many are currently "In Progress" (2). Essential for monitoring workflow and efficiency. 🗓️',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-summary-card-leads',
            popover: {
                title: '💡 Leads Funnel Overview',
                description:
                    'How are your new opportunities looking? See how many leads were "Generated Today" (2) and the number of "Pending" leads (35) that need attention. Key for your sales pipeline! 🚀',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-summary-card-sales',
            popover: {
                title: '💰 Sales Performance',
                description:
                    'Money talks! View your "Revenue Today" (R 1,574.98) and the number of "Quotations" made (3). This is a direct indicator of your daily sales success. 📈',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-summary-card-clients',
            popover: {
                title: '🤝 Client Engagement',
                description:
                    'Keep your clients happy! Track "Interactions Today" (0) and see how many "New Clients" (0) you\'ve welcomed. Vital for customer relationship management. 😊',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-tabs-list',
            popover: {
                title: '🔍 Dive Deeper with Tabs!',
                description:
                    "Want more detail? This Tab Bar is your gateway to in-depth analytics for each specific area. The currently selected tab's content is shown below. Let's explore each tab! 👇",
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-tab-trigger-custom-report',
            popover: {
                title: '📊 Custom Report',
                description:
                    "Currently selected, this tab shows 'Activating Soon', meaning customizable reporting features are coming. This will let you build reports tailored to your specific business needs. 🔮",
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#live-overview-tab-trigger-workforce',
            popover: {
                title: '👥 Workforce Analytics',
                description:
                    'Click here to see detailed workforce metrics like employee hourly activity trends, productivity rates, attendance patterns, and more. Perfect for monitoring team efficiency and engagement. 📉',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#live-overview-tab-trigger-tasks',
            popover: {
                title: '✅ Tasks Insights',
                description:
                    'Access comprehensive task analytics including completion rates, priority distribution, aging analysis, and assignee performance. Helps identify workflow bottlenecks and star performers. 📋',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#live-overview-tab-trigger-taskflags',
            popover: {
                title: '🚩 Task Flags Analysis',
                description:
                    'Monitor issues and blockers with detailed flag analytics. See flag status distribution, most flagged tasks, top flag creators, and recent flags that need attention. Crucial for quality management. ⚠️',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#live-overview-tab-trigger-leads',
            popover: {
                title: '🌱 Leads Performance',
                description:
                    'Analyze your lead generation efforts with charts showing hourly activity, status distribution by category, and top performing lead generators. Optimize your customer acquisition strategy. 💰',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-tab-trigger-sales',
            popover: {
                title: '💵 Sales Analytics',
                description:
                    'Track your revenue performance with detailed sales metrics. View hourly sales activity, weekly revenue trends, top performers, average order values, and quotation analysis. 📊',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-tab-trigger-products',
            popover: {
                title: '🛍️ Product Insights',
                description:
                    'Get visibility into your product performance with category and status distribution charts, top performing products data, and inventory stats including low stock alerts. 📦',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-tab-trigger-claims',
            popover: {
                title: '📝 Claims Overview',
                description:
                    'Monitor expense claims with detailed analytics on status and category distribution, top claim creators, and recent claim submissions. Essential for financial oversight. 💸',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-tab-trigger-journals',
            popover: {
                title: '📓 Journals Analytics',
                description:
                    'Review journal entry metrics including status distribution, top creators, and recent entries. Perfect for tracking field notes, client interactions, and internal communications. 📔',
                side: 'bottom',
                align: 'end',
            },
        },
        {
            element: '#live-overview-tab-trigger-clients',
            popover: {
                title: '🤝 CLIENT ANALYTICS',
                description:
                    'Study client acquisition trends, retention rates, satisfaction scores, and lifetime value metrics. Segment clients by various attributes for targeted strategies.',
                side: 'top',
                align: 'end',
            },
        },
        {
            element: '#live-overview-tab-content-custom-report',
            popover: {
                title: '💡 Tab Content Area',
                description:
                    "This space displays the detailed data for whichever tab you've selected above. Each tab reveals different charts, tables, and metrics specific to that area of your business. Try clicking different tabs to explore! 📈",
                side: 'top',
                align: 'center',
            },
        },
        {
            element: '#tour-step-help-trigger',
            popover: {
                title: '🔍 Need Help Anytime?',
                description:
                    "If you ever need assistance understanding any metrics or features, simply click this help icon to restart the tour or access the voice assistant for immediate support. We're here to help you get the most from your analytics! 🤝",
                side: 'bottom',
                align: 'end',
            },
        },
        {
            popover: {
                title: "🎉 You're All Set to Explore! 🎉",
                description:
                    'That covers the Live Organization Overview! Remember to click through the different tabs to see detailed analytics for each section. Use the refresh button to get the latest data, and enjoy your real-time insights! Happy exploring! 🚀',
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
                    'Welcome to the Leads section! Manage potential customer interactions and track their progress.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            popover: {
                title: '📋 LEADS BOARD OVERVIEW',
                description:
                    'This is your kanban-style leads management board. Leads are organized by status columns showing the full lifecycle from initial contact to conversion or decline.',
                align: 'center',
            },
        },
        {
            element: '#pending-leads-column',
            popover: {
                title: '⏱️ PENDING LEADS',
                description:
                    'New leads start here. These are fresh opportunities that need initial review and follow-up. The number shows how many leads are waiting for your attention.',
                side: 'top',
                align: 'start',
            },
        },
        {
            element: '#approved-leads-column',
            popover: {
                title: '✅ APPROVED LEADS',
                description:
                    "These leads have been qualified and approved for follow-up. They're promising opportunities that your team is actively pursuing.",
                side: 'top',
                align: 'start',
            },
        },
        {
            element: '#review-leads-column',
            popover: {
                title: '🔍 UNDER REVIEW',
                description:
                    "Leads requiring additional information or verification before proceeding. They're being evaluated for potential or waiting for specific details.",
                side: 'top',
                align: 'center',
            },
        },
        {
            element: '#declined-leads-column',
            popover: {
                title: '❌ DECLINED LEADS',
                description:
                    'These opportunities were evaluated but determined not to be a good fit. Keeping them visible helps track patterns and improve lead qualification.',
                side: 'top',
                align: 'center',
            },
        },
        {
            element: '#cancelled-leads-column',
            popover: {
                title: '🚫 CANCELLED LEADS',
                description:
                    'Leads that were initially promising but later cancelled due to changed circumstances or requirements. Different from declined as these had positive initial engagement.',
                side: 'top',
                align: 'end',
            },
        },
        {
            element: '#converted-leads-column',
            popover: {
                title: '🎯 CONVERTED TO CLIENTS',
                description:
                    "Success! These leads have been successfully converted into paying clients. They've completed the sales funnel and are now in your client database.",
                side: 'top',
                align: 'end',
            },
        },
        {
            element: '#lead-card-example',
            popover: {
                title: '📇 LEAD CARD',
                description:
                    'Each card represents one lead. The color band shows status, and cards display key contact information, notes, creation date, and the team member who added them.',
                side: 'right',
                align: 'start',
            },
        },
        {
            element: '#lead-name-field',
            popover: {
                title: '👤 LEAD NAME & DETAILS',
                description:
                    'The primary lead information including name, business, and a brief note about their interest or situation. Click on any lead to see full details and contact information.',
                side: 'right',
                align: 'start',
            },
        },
        {
            element: '#lead-contact-details',
            popover: {
                title: '📞 CONTACT DETAILS',
                description:
                    "Essential contact information for follow-up. Depending on the lead, you'll see email, phone number, and business location for quick reference.",
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#lead-metadata-section',
            popover: {
                title: '📅 LEAD METADATA',
                description:
                    'See at a glance when the lead was created and other important timestamps. Historical data helps you make informed decisions about follow-up timing.',
                side: 'top',
                align: 'start',
            },
        },
        {
            element: '#lead-quick-actions',
            popover: {
                title: '⚡ QUICK ACTIONS',
                description:
                    'Access common actions directly from the lead card, i.e call, email, message as a way to save time and improve efficiency.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            popover: {
                title: '📊 LEADS INSIGHTS',
                description:
                    'Pay attention to the numbers at the top of each column. They provide a quick snapshot of your sales funnel and help identify bottlenecks or opportunities for improvement.',
                align: 'center',
            },
        },
        {
            popover: {
                description:
                    "That's the Leads page! You're now equipped to effectively manage your sales pipeline from initial contact to client conversion.",
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
                    'Manage all your active clients, view their details, and track interactions.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#client-status-filter-trigger',
            popover: {
                title: 'FILTER BY STATUS',
                description:
                    '🚦 Filter the client list by their status (Active, Inactive, Pending, etc.).',
                side: 'bottom',
            },
        },
        {
            element: '#client-category-filter-trigger',
            popover: {
                title: 'FILTER BY CATEGORY',
                description:
                    '🏷️ Filter the list by client category, if applicable.',
                side: 'bottom',
            },
        },
        {
            element: '#client-industry-filter-trigger',
            popover: {
                title: 'FILTER BY INDUSTRY',
                description: "🏭 Filter the list by the client's industry.",
                side: 'bottom',
            },
        },
        {
            element: '#client-risk-level-filter-trigger',
            popover: {
                title: 'FILTER BY RISK LEVEL',
                description:
                    '⚠️ Filter clients based on their assigned risk level (Low, Medium, High, Critical).',
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
            element: '#clients-table',
            popover: {
                title: 'CLIENT LIST',
                description:
                    '📋 Browse, search, and manage your existing clients here based on active filters. Click a row to view details.',
                side: 'top',
                align: 'center',
            },
        },
        {
            element: '.client-row',
            popover: {
                title: 'CLIENT DETAILS',
                description:
                    '🖱️ Clicking a client opens their detailed profile, showing contact info, address, history, associated tasks, status, risk level, and more.',
                side: 'right',
                align: 'start',
            },
        },
        {
            popover: {
                description:
                    "That covers the Clients section! You\'re ready to manage your customer base.",
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
                description:
                    "That's the Staff section! You\'re all set to manage your team.",
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
                    'Welcome to the Tasks section! Here you can create, assign, and monitor work tasks for your team. Track progress and ensure timely completion.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            popover: {
                title: '📋 TASKS BOARD OVERVIEW',
                description:
                    'This is your kanban-style task management board. Tasks are organized by status columns showing the full lifecycle from planning to completion or cancellation.',
                align: 'center',
            },
        },
        // Pending Column
        {
            element: '#pending-tasks-column',
            popover: {
                title: '⏱️ PENDING TASKS',
                description:
                    'New tasks start here. These are tasks that are waiting to be started. The number shows how many tasks are pending.',
                side: 'top',
                align: 'start',
            },
        },
        // Postponed Column
        {
            element: '#postponed-tasks-column',
            popover: {
                title: '⏳ POSTPONED TASKS',
                description:
                    'Tasks that have been postponed for later action. Keep an eye on these to avoid missing deadlines.',
                side: 'top',
                align: 'start',
            },
        },
        // In Progress Column
        {
            element: '#inprogress-tasks-column',
            popover: {
                title: '🚧 IN PROGRESS',
                description:
                    'Tasks currently being worked on. Move tasks here when your team starts working on them.',
                side: 'top',
                align: 'center',
            },
        },
        // Overdue Column
        {
            element: '#overdue-tasks-column',
            popover: {
                title: '⏰ OVERDUE TASKS',
                description:
                    'Tasks that have missed their deadline. Review and take action to get these back on track.',
                side: 'top',
                align: 'center',
            },
        },
        // Missed Column
        {
            element: '#missed-tasks-column',
            popover: {
                title: '❌ MISSED TASKS',
                description:
                    'Tasks that were not completed as planned. Analyze these to improve future performance.',
                side: 'top',
                align: 'center',
            },
        },
        // Cancelled Column
        {
            element: '#cancelled-tasks-column',
            popover: {
                title: '🚫 CANCELLED TASKS',
                description:
                    'Tasks that have been cancelled and will not be completed. These are kept for record-keeping.',
                side: 'top',
                align: 'end',
            },
        },
        // Completed Column
        {
            element: '#completed-tasks-column',
            popover: {
                title: '🎉 COMPLETED TASKS',
                description:
                    "Tasks that have been successfully completed. Celebrate your team's achievements here!",
                side: 'top',
                align: 'end',
            },
        },
        // Example Task Card (first card in Pending column)
        {
            element: '#task-card-example',
            popover: {
                title: '🗂️ TASK CARD',
                description:
                    'Each card represents a task. Cards display the title, status, priority, assignees, progress, and more. Click a card to view full details and take action.',
                side: 'right',
                align: 'start',
            },
        },
        // Task Title
        {
            element: '#task-card-example #task-title-field',
            popover: {
                title: '📝 TASK TITLE',
                description:
                    'This is the main title of the task. Make titles clear and descriptive for easy tracking.',
                side: 'right',
                align: 'start',
            },
        },
        // Task Status Badge
        {
            element: '#task-card-example #task-status-badge',
            popover: {
                title: '📌 STATUS BADGE',
                description:
                    'Shows the current status of the task (Pending, In Progress, Completed, etc.).',
                side: 'right',
                align: 'start',
            },
        },
        // Task Assignees
        {
            element: '#task-card-example #task-assignees',
            popover: {
                title: '👥 ASSIGNEES',
                description:
                    'Displays the team members assigned to this task. Assign tasks to the right people for efficient workflow.',
                side: 'bottom',
                align: 'start',
            },
        },
        // Task Progress (if subtasks exist)
        {
            element: '#task-card-example #task-progress-bar',
            popover: {
                title: '📈 TASK PROGRESS',
                description:
                    'Shows how much of the task is complete, based on subtasks. Keep an eye on progress to ensure timely completion.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            popover: {
                title: '📊 TASKS INSIGHTS',
                description:
                    'Pay attention to the numbers at the top of each column. They provide a quick snapshot of your workflow and help identify bottlenecks or opportunities for improvement.',
                align: 'center',
            },
        },
        {
            popover: {
                description:
                    "That's the Tasks page! You're now equipped to effectively manage your team's work from planning to completion.",
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
                    'Welcome to the Claims section! Here you can review, approve, reject, and track expense and other claims submitted by staff.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            popover: {
                title: '📋 CLAIMS BOARD OVERVIEW',
                description:
                    'This is your kanban-style claims management board. Claims are organized by status columns showing the full lifecycle from submission to approval, payment, or rejection.',
                align: 'center',
            },
        },
        // Pending Column
        {
            element: '#pending-claims-column',
            popover: {
                title: '⏱️ PENDING CLAIMS',
                description:
                    'New claims start here. These are claims that are waiting for review. The number shows how many claims are pending.',
                side: 'top',
                align: 'start',
            },
        },
        // Cancelled Column
        {
            element: '#cancelled-claims-column',
            popover: {
                title: '🚫 CANCELLED CLAIMS',
                description:
                    'Claims that have been cancelled and will not be processed. These are kept for record-keeping.',
                side: 'top',
                align: 'end',
            },
        },
        // Declined Column
        {
            element: '#declined-claims-column',
            popover: {
                title: '❌ DECLINED CLAIMS',
                description:
                    'Claims that were not approved. Analyze these to improve future submissions.',
                side: 'top',
                align: 'center',
            },
        },
        // Approved Column
        {
            element: '#approved-claims-column',
            popover: {
                title: '✅ APPROVED CLAIMS',
                description:
                    'Claims that have been approved and are ready for payment.',
                side: 'top',
                align: 'center',
            },
        },
        // Paid Column
        {
            element: '#paid-claims-column',
            popover: {
                title: '💵 PAID CLAIMS',
                description:
                    "Claims that have been paid out. Keep track of your organization's expenses here.",
                side: 'top',
                align: 'center',
            },
        },
        // Rejected Column
        {
            element: '#rejected-claims-column',
            popover: {
                title: '🚫 REJECTED CLAIMS',
                description:
                    'Claims that have been rejected. Review reasons for rejection to help staff submit better claims in the future.',
                side: 'top',
                align: 'center',
            },
        },
        // Example Claim Card (first card in Pending column)
        {
            element: '#claim-card-example',
            popover: {
                title: '🗂️ CLAIM CARD',
                description:
                    'Each card represents a claim. Cards display the amount, status, owner, and more. Click a card to view full details and take action.',
                side: 'right',
                align: 'start',
            },
        },
        // Claim Amount/Title
        {
            element: '#claim-card-example #claim-title-field',
            popover: {
                title: '💰 CLAIM AMOUNT',
                description:
                    'This is the amount being claimed. Review carefully before approving.',
                side: 'right',
                align: 'start',
            },
        },
        // Claim Status Badge
        {
            element: '#claim-card-example #claim-status-badge',
            popover: {
                title: '📌 STATUS BADGE',
                description:
                    'Shows the current status of the claim (Pending, Approved, Paid, etc.).',
                side: 'right',
                align: 'start',
            },
        },
        // Claim Owner
        {
            element: '#claim-card-example #claim-owner',
            popover: {
                title: '👤 CLAIM OWNER',
                description:
                    'Displays the staff member who submitted this claim. Ensure the claim is from a valid user.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            popover: {
                title: '📊 CLAIMS INSIGHTS',
                description:
                    'Pay attention to the numbers at the top of each column. They provide a quick snapshot of your claims workflow and help identify bottlenecks or opportunities for improvement.',
                align: 'center',
            },
        },
        {
            popover: {
                description:
                    "That's the Claims page! You're now equipped to efficiently manage, review, and process claims from submission to payment.",
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
                    'Welcome to the Journals section! Here you can review, manage, and track activity logs, notes, and interactions entered by staff.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            popover: {
                title: '📋 JOURNALS BOARD OVERVIEW',
                description:
                    'This is your kanban-style journals management board. Journals are organized by status columns showing the full lifecycle from draft to published or archived.',
                align: 'center',
            },
        },
        // Pending Column
        {
            element: '#pending-journals-column',
            popover: {
                title: '⏱️ PENDING REVIEW',
                description:
                    'New journals start here. These are journals that are waiting for review or approval. The number shows how many journals are pending.',
                side: 'top',
                align: 'start',
            },
        },
        // Draft Column
        {
            element: '#draft-journals-column',
            popover: {
                title: '📝 DRAFTS',
                description:
                    'Journals that are being drafted and not yet published. Continue editing or submit for review when ready.',
                side: 'top',
                align: 'start',
            },
        },
        // Rejected Column
        {
            element: '#rejected-journals-column',
            popover: {
                title: '❌ REJECTED JOURNALS',
                description:
                    'Journals that were not approved. Review feedback and update as needed.',
                side: 'top',
                align: 'center',
            },
        },
        // Archived Column
        {
            element: '#archived-journals-column',
            popover: {
                title: '📦 ARCHIVED JOURNALS',
                description:
                    'Journals that have been archived for record-keeping. These are not active but are kept for reference.',
                side: 'top',
                align: 'center',
            },
        },
        // Published Column
        {
            element: '#published-journals-column',
            popover: {
                title: '✅ PUBLISHED JOURNALS',
                description:
                    'Journals that have been reviewed and published. These are visible to the relevant users.',
                side: 'top',
                align: 'end',
            },
        },
        // Example Journal Card (first card in Pending column)
        {
            element: '#journal-card-example',
            popover: {
                title: '🗂️ JOURNAL CARD',
                description:
                    'Each card represents a journal entry. Cards display the title, status, owner, and more. Click a card to view full details and take action.',
                side: 'right',
                align: 'start',
            },
        },
        // Journal Title
        {
            element: '#journal-card-example #journal-title-field',
            popover: {
                title: '📝 JOURNAL TITLE',
                description:
                    'This is the main title of the journal entry. Make titles clear and descriptive for easy tracking.',
                side: 'right',
                align: 'start',
            },
        },
        // Journal Status Badge
        {
            element: '#journal-card-example #journal-status-badge',
            popover: {
                title: '📌 STATUS BADGE',
                description:
                    'Shows the current status of the journal (Pending Review, Draft, Published, etc.).',
                side: 'right',
                align: 'start',
            },
        },
        // Journal Owner
        {
            element: '#journal-card-example #journal-owner',
            popover: {
                title: '👤 JOURNAL OWNER',
                description:
                    'Displays the staff member who created this journal entry. Ensure the entry is from a valid user.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            popover: {
                title: '📊 JOURNALS INSIGHTS',
                description:
                    'Pay attention to the numbers at the top of each column. They provide a quick snapshot of your journals workflow and help identify bottlenecks or opportunities for improvement.',
                align: 'center',
            },
        },
        {
            popover: {
                description:
                    "That's the Journals page! You're now equipped to efficiently manage, review, and publish activity logs and notes.",
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
                description:
                    "That's the Live Map! You\'re ready to visualize your operations.",
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
                title: '🧾 QUOTATIONS MANAGEMENT',
                description:
                    'Welcome to the Quotations section! Here you can create, review, and manage sales quotations for your clients.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            popover: {
                title: '📋 QUOTATIONS BOARD OVERVIEW',
                description:
                    'This is your kanban-style quotations management board. Quotations are organized by status, making it easy to track their progress from draft to completion.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#draft-quotations-column',
            popover: {
                title: 'Draft Quotations',
                description:
                    'All new quotations start here as drafts. You can edit, send, or move them to the next stage.',
                side: 'top',
                align: 'start',
            },
        },
        {
            element: '#pendinginternal-quotations-column',
            popover: {
                title: 'Internal Review',
                description:
                    'Quotations under internal review before being sent to the client.',
                side: 'top',
                align: 'start',
            },
        },
        {
            element: '#pendingclient-quotations-column',
            popover: {
                title: 'Client Review',
                description:
                    'Quotations sent to the client for their review and approval.',
                side: 'top',
                align: 'start',
            },
        },
        {
            element: '#negotiation-quotations-column',
            popover: {
                title: 'Negotiation',
                description: 'Quotations in negotiation with the client.',
                side: 'top',
                align: 'start',
            },
        },
        {
            element: '#approved-quotations-column',
            popover: {
                title: 'Approved',
                description:
                    'Quotations that have been approved by the client.',
                side: 'top',
                align: 'start',
            },
        },
        {
            element: '#rejected-quotations-column',
            popover: {
                title: 'Rejected',
                description:
                    'Quotations that have been rejected by the client.',
                side: 'top',
                align: 'start',
            },
        },
        {
            element: '#sourcing-quotations-column',
            popover: {
                title: 'Sourcing',
                description:
                    'Quotations in the sourcing stage, preparing for fulfillment.',
                side: 'top',
                align: 'start',
            },
        },
        {
            element: '#packing-quotations-column',
            popover: {
                title: 'Packing',
                description: 'Quotations being packed for delivery.',
                side: 'top',
                align: 'start',
            },
        },
        {
            element: '#infulfillment-quotations-column',
            popover: {
                title: 'In Fulfillment',
                description: 'Quotations currently being fulfilled.',
                side: 'top',
                align: 'start',
            },
        },
        {
            element: '#paid-quotations-column',
            popover: {
                title: 'Paid',
                description: 'Quotations that have been paid by the client.',
                side: 'top',
                align: 'start',
            },
        },
        {
            element: '#outfordelivery-quotations-column',
            popover: {
                title: 'Out for Delivery',
                description:
                    'Quotations that are out for delivery to the client.',
                side: 'top',
                align: 'start',
            },
        },
        {
            element: '#delivered-quotations-column',
            popover: {
                title: 'Delivered',
                description:
                    'Quotations that have been delivered to the client.',
                side: 'top',
                align: 'start',
            },
        },
        {
            element: '#returned-quotations-column',
            popover: {
                title: 'Returned',
                description: 'Quotations that have been returned.',
                side: 'top',
                align: 'start',
            },
        },
        {
            element: '#completed-quotations-column',
            popover: {
                title: 'Completed',
                description: 'Quotations that have been fully completed.',
                side: 'top',
                align: 'start',
            },
        },
        {
            element: '#cancelled-quotations-column',
            popover: {
                title: 'Cancelled',
                description: 'Quotations that have been cancelled.',
                side: 'top',
                align: 'start',
            },
        },
        {
            element: '#postponed-quotations-column',
            popover: {
                title: 'Postponed',
                description: 'Quotations that have been postponed.',
                side: 'top',
                align: 'start',
            },
        },
        // Example card and fields
        {
            element: '#quotation-card-example',
            popover: {
                title: 'Quotation Card Example',
                description:
                    'This is an example quotation card. Click to view more details or take actions.',
                side: 'right',
                align: 'center',
            },
        },
        {
            element: '#quotation-title-field',
            popover: {
                title: 'Quotation Number',
                description: 'Displays the unique quotation number.',
                side: 'top',
                align: 'start',
            },
        },
        {
            element: '#quotation-status-badge',
            popover: {
                title: 'Status Badge',
                description: 'Shows the current status of the quotation.',
                side: 'top',
                align: 'start',
            },
        },
        {
            element: '#quotation-client',
            popover: {
                title: 'Client',
                description:
                    'Displays the client associated with this quotation.',
                side: 'top',
                align: 'start',
            },
        },
        {
            element: '#quotation-amount',
            popover: {
                title: 'Total Amount',
                description: 'Shows the total value of the quotation.',
                side: 'top',
                align: 'start',
            },
        },
        {
            popover: {
                description:
                    "That's the Quotations page! You're now equipped to manage, track, and process quotations from draft to completion.",
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
                align: 'start',
            },
        },
        {
            element: '#product-search-input',
            popover: {
                title: 'SEARCH PRODUCTS',
                description:
                    '🔍 Quickly find specific products by name or SKU using the search bar.',
                side: 'bottom',
            },
        },
        {
            element: '#product-status-filter-trigger',
            popover: {
                title: 'FILTER BY STATUS',
                description:
                    '🚦 Filter the product list by status (Active, Inactive, Out of Stock, New, etc.).',
                side: 'bottom',
            },
        },
        {
            element: '#product-category-filter-trigger',
            popover: {
                title: 'FILTER BY CATEGORY',
                description: '🏷️ Filter the list by product category.',
                side: 'bottom',
            },
        },
        {
            element: '#clear-product-filters-button',
            popover: {
                title: 'CLEAR FILTERS',
                description:
                    '❌ This button appears when filters are active. Click to remove search and filters.',
                side: 'left',
                align: 'end',
            },
        },
        {
            element: '#inventory-table',
            popover: {
                title: 'STOCK LEVEL OVERVIEW',
                description:
                    '📋 View current stock quantities, cost, and total value for all products based on your filters. Click a product for more actions.',
                side: 'top',
                align: 'center',
            },
        },
        {
            popover: {
                description:
                    "That's Inventory Management! You\'re ready to track your stock.",
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
                description:
                    "That's the Settings area! You\'re ready to configure the application.",
                align: 'center',
            },
        },
    ],

    // ========================================
    // Live Overview Report Page Tour (/dashboard/reports/live-overview)
    // ========================================
    '/dashboard/reports/live-overview': [
        {
            popover: {
                title: '🌟 Welcome to Your Live Organization Overview! 🌟',
                description:
                    "Get ready for a real-time snapshot of your entire operation! This dashboard is designed to give you immediate insights into key metrics and performance analytics. Let's walk through what you can see and do here. ✨",
                align: 'center',
            },
        },
        {
            element: '#live-overview-breadcrumbs',
            popover: {
                title: '🗺️ Your Navigational Compass',
                description:
                    'Lost? Never! These breadcrumbs show your current path within the Loro dashboard. You can easily click back to the main "Reports" section or the primary "Dashboard". It\'s your quick way to navigate! 🧭',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#live-overview-header',
            popover: {
                title: '📢 Report Title & Purpose',
                description:
                    'You\'re looking at the "LIVE ORGANIZATION OVERVIEW" – your central hub for real-time metrics and performance analytics across your organization. It\'s all about giving you the latest data, right now! ⏱️',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-refresh-button',
            popover: {
                title: '🔄 Keep it Current!',
                description:
                    "Data changes fast! Click this \"Refresh\" button whenever you want to ensure you're viewing the absolute latest information. It's especially handy if you've been on the page for a while. ⚡",
                side: 'bottom',
                align: 'end',
            },
        },
        {
            element: '#live-overview-summary-cards-grid',
            popover: {
                title: '📊 Key Metrics at a Glance!',
                description:
                    "This top section gives you a powerful, summarized view of your core operational areas. Each card highlights crucial numbers for Workforce, Tasks, Leads, Sales, and Clients. Let's look at them one by one! 👇",
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-summary-card-workforce',
            popover: {
                title: '👥 Workforce Snapshot',
                description:
                    'Check your team\'s pulse! See the "Total Employees" (14) and how many are "Active Now" (0 in this example). This gives you a quick understanding of your current operational capacity. 💪',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-summary-card-tasks',
            popover: {
                title: '✅ Tasks Tracker',
                description:
                    'Stay on top of productivity! This card shows how many tasks were "Completed Today" (7) and how many are currently "In Progress" (2). Essential for monitoring workflow and efficiency. 🗓️',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-summary-card-leads',
            popover: {
                title: '💡 Leads Funnel Overview',
                description:
                    'How are your new opportunities looking? See how many leads were "Generated Today" (2) and the number of "Pending" leads (35) that need attention. Key for your sales pipeline! 🚀',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-summary-card-sales',
            popover: {
                title: '💰 Sales Performance',
                description:
                    'Money talks! View your "Revenue Today" (R 1,574.98) and the number of "Quotations" made (3). This is a direct indicator of your daily sales success. 📈',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-summary-card-clients',
            popover: {
                title: '🤝 Client Engagement',
                description:
                    'Keep your clients happy! Track "Interactions Today" (0) and see how many "New Clients" (0) you\'ve welcomed. Vital for customer relationship management. 😊',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-tabs-list',
            popover: {
                title: '🔍 Dive Deeper with Tabs!',
                description:
                    "Want more detail? This Tab Bar is your gateway to in-depth analytics for each specific area. The currently selected tab's content is shown below. Let's explore each tab! 👇",
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-tab-trigger-workforce',
            popover: {
                title: '👥 Workforce Analytics',
                description:
                    'Click here to see detailed workforce metrics like employee hourly activity trends, productivity rates, attendance patterns, and more. Perfect for monitoring team efficiency and engagement. 📉',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#live-overview-tab-trigger-tasks',
            popover: {
                title: '✅ Tasks Insights',
                description:
                    'Access comprehensive task analytics including completion rates, priority distribution, aging analysis, and assignee performance. Helps identify workflow bottlenecks and star performers. 📋',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#live-overview-tab-trigger-taskflags',
            popover: {
                title: '🚩 Task Flags Analysis',
                description:
                    'Monitor issues and blockers with detailed flag analytics. See flag status distribution, most flagged tasks, top flag creators, and recent flags that need attention. Crucial for quality management. ⚠️',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#live-overview-tab-trigger-leads',
            popover: {
                title: '🌱 Leads Performance',
                description:
                    'Analyze your lead generation efforts with charts showing hourly activity, status distribution by category, and top performing lead generators. Optimize your customer acquisition strategy. 💰',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-tab-trigger-sales',
            popover: {
                title: '💵 Sales Analytics',
                description:
                    'Track your revenue performance with detailed sales metrics. View hourly sales activity, weekly revenue trends, top performers, average order values, and quotation analysis. 📊',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-tab-trigger-products',
            popover: {
                title: '🛍️ Product Insights',
                description:
                    'Get visibility into your product performance with category and status distribution charts, top performing products data, and inventory stats including low stock alerts. 📦',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-tab-trigger-claims',
            popover: {
                title: '📝 Claims Overview',
                description:
                    'Monitor expense claims with detailed analytics on status and category distribution, top claim creators, and recent claim submissions. Essential for financial oversight. 💸',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#live-overview-tab-trigger-journals',
            popover: {
                title: '📓 Journals Analytics',
                description:
                    'Review journal entry metrics including status distribution, top creators, and recent entries. Perfect for tracking field notes, client interactions, and internal communications. 📔',
                side: 'bottom',
                align: 'end',
            },
        },
        {
            element: '#live-overview-tab-trigger-clients',
            popover: {
                title: '🤝 CLIENT ANALYTICS',
                description:
                    'Study client acquisition trends, retention rates, satisfaction scores, and lifetime value metrics. Segment clients by various attributes for targeted strategies.',
                side: 'top',
                align: 'end',
            },
        },
        {
            element: '#live-overview-tab-content-custom-report',
            popover: {
                title: '💡 Tab Content Area',
                description:
                    "This space displays the detailed data for whichever tab you've selected above. Each tab reveals different charts, tables, and metrics specific to that area of your business. Try clicking different tabs to explore! 📈",
                side: 'top',
                align: 'center',
            },
        },
        {
            element: '#tour-step-help-trigger',
            popover: {
                title: '🔍 Need Help Anytime?',
                description:
                    "If you ever need assistance understanding any metrics or features, simply click this help icon to restart the tour or access the voice assistant for immediate support. We're here to help you get the most from your analytics! 🤝",
                side: 'bottom',
                align: 'end',
            },
        },
        {
            popover: {
                title: "🎉 You're All Set to Explore! 🎉",
                description:
                    'That covers the Live Organization Overview! Remember to click through the different tabs to see detailed analytics for each section. Use the refresh button to get the latest data, and enjoy your real-time insights! Happy exploring! 🚀',
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
