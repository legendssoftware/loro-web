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
                    'Check your team\'s LORO! See the "Total Employees" (14) and how many are "Active Now" (0 in this example). This gives you a quick understanding of your current operational capacity. 💪',
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
                title: '🤝 CLIENT RELATIONSHIP MANAGEMENT',
                description:
                    'Welcome to your Client Management hub! This is where you maintain strong relationships with your customers, track their journey, and ensure excellent service delivery. Let\'s explore how to master client management!',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            popover: {
                title: '🏢 CUSTOMER RELATIONSHIP OVERVIEW',
                description:
                    'This comprehensive client management system helps you track customer lifecycles, manage relationships, monitor satisfaction, and identify growth opportunities within your client base.',
                align: 'center',
            },
        },
        {
            element: '#client-search-input',
            popover: {
                title: '🔍 CLIENT FINDER',
                description:
                    'Quickly locate specific clients by company name, contact person, email, or phone number. Essential for immediate client service and relationship management.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#client-status-filter-trigger',
            popover: {
                title: '🚦 STATUS CLASSIFICATION',
                description:
                    'Filter clients by their relationship status: Active (current customers), Inactive (dormant accounts), Pending (prospects), Onboarding (new clients), or Terminated (former customers). This helps prioritize your attention.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#client-category-filter-trigger',
            popover: {
                title: '🏷️ CLIENT CATEGORIZATION',
                description:
                    'Organize clients by category: Enterprise (large corporations), SMB (small-medium business), Individual (personal clients), Government, or Non-Profit. Different categories may require different service approaches.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#client-industry-filter-trigger',
            popover: {
                title: '🏭 INDUSTRY SEGMENTATION',
                description:
                    'Filter by industry sectors: Technology, Healthcare, Manufacturing, Retail, Finance, Construction, etc. Understanding industry-specific needs helps tailor your services.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#client-risk-level-filter-trigger',
            popover: {
                title: '⚠️ RISK ASSESSMENT',
                description:
                    'Monitor client risk levels: Low (stable relationships), Medium (require attention), High (potential issues), Critical (immediate action needed). Proactive risk management prevents client loss.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#client-value-filter-trigger',
            popover: {
                title: '💎 CLIENT VALUE TIERS',
                description:
                    'Segment by client value: VIP (high-value accounts), Premium (significant revenue), Standard (regular clients), Basic (entry-level). Prioritize attention based on business impact.',
                side: 'bottom',
                align: 'end',
            },
        },
        {
            element: '#clear-client-filters-button',
            popover: {
                title: '❌ RESET FILTERS',
                description:
                    'Clear all active filters and search terms to return to the complete client overview. This appears when filters are applied.',
                side: 'left',
                align: 'end',
            },
        },
        {
            element: '#add-client-button',
            popover: {
                title: '➕ ONBOARD NEW CLIENTS',
                description:
                    'Ready to grow your client base? Add new clients with complete contact information, service preferences, and initial relationship details. Start building strong relationships from day one!',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#bulk-client-actions',
            popover: {
                title: '📊 BULK OPERATIONS',
                description:
                    'Select multiple clients to perform batch operations: status updates, bulk messaging, export lists, or category changes. Efficient for managing large client bases.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#clients-table',
            popover: {
                title: '📋 COMPREHENSIVE CLIENT DIRECTORY',
                description:
                    'Your complete client database! This table displays all client relationships with key information: company details, contact persons, status, value, risk level, and recent activity.',
                side: 'top',
                align: 'center',
            },
        },
        {
            element: '#clients-table-header-company',
            popover: {
                title: '🏢 COMPANY IDENTIFICATION',
                description:
                    'Client company names and primary identification. Click to sort alphabetically and quickly locate specific organizations.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#clients-table-header-contact',
            popover: {
                title: '👤 PRIMARY CONTACTS',
                description:
                    'Key contact persons within each client organization. These are your main relationship points for business communication.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#clients-table-header-status',
            popover: {
                title: '📊 RELATIONSHIP STATUS',
                description:
                    'Current client relationship status with color coding: Active (green), Pending (yellow), Inactive (gray), At Risk (red).',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#clients-table-header-value',
            popover: {
                title: '💰 CLIENT VALUE',
                description:
                    'Client value classification and revenue contribution. Helps prioritize attention and resource allocation for maximum business impact.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#clients-table-header-industry',
            popover: {
                title: '🏭 INDUSTRY SECTOR',
                description:
                    'Client industry classification helps understand their business context and tailor your services to industry-specific needs.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#clients-table-header-risk',
            popover: {
                title: '⚠️ RISK INDICATORS',
                description:
                    'Risk assessment levels help identify clients that need attention to prevent relationship deterioration or contract loss.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#clients-table-header-activity',
            popover: {
                title: '📅 RECENT ACTIVITY',
                description:
                    'Last interaction dates and activity summaries. Helps identify clients who haven\'t been contacted recently and may need attention.',
                side: 'bottom',
                align: 'end',
            },
        },
        {
            element: '.client-row',
            popover: {
                title: '🖱️ DETAILED CLIENT PROFILE',
                description:
                    'Click any client row to open their comprehensive profile with full contact information, service history, interaction timeline, and available relationship management actions.',
                side: 'right',
                align: 'start',
            },
        },
        {
            element: '#client-row-example .client-logo',
            popover: {
                title: '🏢 CLIENT BRANDING',
                description:
                    'Client company logo for visual identification. Helps personalize the relationship and quick recognition during communications.',
                side: 'right',
                align: 'start',
            },
        },
        {
            element: '#client-row-example .client-company-name',
            popover: {
                title: '🏢 COMPANY DETAILS',
                description:
                    'Complete company name and business information. This is your primary client identification and business context.',
                side: 'right',
                align: 'center',
            },
        },
        {
            element: '#client-row-example .client-contact-person',
            popover: {
                title: '👤 KEY CONTACT',
                description:
                    'Primary contact person within the client organization. This is usually your main relationship point for business communications.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#client-row-example .client-status-badge',
            popover: {
                title: '📊 STATUS INDICATOR',
                description:
                    'Current relationship status with color coding for quick visual assessment of client health and priority level.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#client-row-example .client-value-badge',
            popover: {
                title: '💎 VALUE CLASSIFICATION',
                description:
                    'Client value tier indicating their business importance and revenue contribution to help prioritize relationship management efforts.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#client-row-example .client-industry-tag',
            popover: {
                title: '🏭 INDUSTRY CONTEXT',
                description:
                    'Industry sector classification helps understand the client\'s business environment and tailor services accordingly.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#client-row-example .client-risk-indicator',
            popover: {
                title: '⚠️ RISK LEVEL',
                description:
                    'Risk assessment indicator showing the current health of the client relationship and any potential concerns that need addressing.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#client-row-example .client-contact-info',
            popover: {
                title: '📞 CONTACT METHODS',
                description:
                    'Quick access to contact information including email, phone, and address for immediate communication needs.',
                side: 'bottom',
                align: 'end',
            },
        },
        {
            element: '#client-row-example .client-quick-actions',
            popover: {
                title: '⚡ RELATIONSHIP ACTIONS',
                description:
                    'Quick action buttons for common client management tasks: send email, schedule meeting, create task, update status, or view full profile.',
                side: 'left',
                align: 'end',
            },
        },
        {
            element: '#client-analytics-summary',
            popover: {
                title: '📊 CLIENT ANALYTICS',
                description:
                    'Summary statistics showing total clients, active relationships, at-risk accounts, and revenue distribution across your client portfolio.',
                side: 'top',
                align: 'center',
            },
        },
        {
            element: '#clients-table-pagination',
            popover: {
                title: '📄 NAVIGATE CLIENT LIST',
                description:
                    'For large client databases, use pagination controls to browse through different pages of your client directory efficiently.',
                side: 'top',
                align: 'center',
            },
        },
        {
            popover: {
                title: '🤝 CLIENT RELATIONSHIP INSIGHTS',
                description:
                    'Monitor the health of your client relationships through status distribution, risk levels, and value classifications. A healthy client base typically has mostly active, low-risk, high-value relationships.',
                align: 'center',
            },
        },
        {
            popover: {
                title: '🎯 RELATIONSHIP BEST PRACTICES',
                description:
                    'Regularly review client risk levels, maintain contact frequency, track satisfaction metrics, and proactively address concerns. Use filters to identify clients needing attention.',
                align: 'center',
            },
        },
        {
            popover: {
                title: '🚀 CLIENT MANAGEMENT MASTERY!',
                description:
                    'You\'re now equipped to effectively manage your entire client portfolio! Use search and filters to find specific clients, monitor relationship health, and take proactive actions to maintain strong business relationships.',
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
                title: '👥 STAFF MANAGEMENT CENTRAL',
                description:
                    'Welcome to Staff Management! This is your comprehensive hub for managing team members, roles, permissions, and organizational structure. Let\'s explore how to effectively manage your workforce.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            popover: {
                title: '🏢 WORKFORCE OVERVIEW',
                description:
                    'This section provides a complete view of your organizational structure. You can manage employee details, assign roles, track status, and ensure proper access controls across your entire team.',
                align: 'center',
            },
        },
        {
            element: '#staff-search-input',
            popover: {
                title: '🔍 QUICK STAFF SEARCH',
                description:
                    'Need to find a specific team member quickly? Use this search bar to locate staff by name, email, or employee ID. Perfect for large teams!',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#user-status-filter-trigger',
            popover: {
                title: '🚦 STATUS FILTERING',
                description:
                    'Filter your team by employment status: Active (currently working), Pending (awaiting onboarding), Suspended (temporarily inactive), or Terminated (no longer with company). This helps you focus on specific groups.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#user-access-level-filter-trigger',
            popover: {
                title: '🛡️ ROLE-BASED FILTERING',
                description:
                    'Filter by access levels and roles: Admin (full system access), Manager (departmental oversight), Executive (strategic access), Developer (technical access), User (standard employee), or Client (external access). Essential for security audits!',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#user-branch-filter-trigger',
            popover: {
                title: '🏢 BRANCH ORGANIZATION',
                description:
                    'Filter staff by their assigned branch or location. Perfect for multi-location businesses to manage regional teams separately and ensure proper organizational structure.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#clear-staff-filters-button',
            popover: {
                title: '❌ RESET VIEW',
                description:
                    'Clear all active filters and search terms to return to the complete staff overview. This button appears when filters are applied.',
                side: 'left',
                align: 'end',
            },
        },
        {
            element: '#add-staff-button',
            popover: {
                title: '➕ ONBOARD NEW TALENT',
                description:
                    'Ready to grow your team? Click here to add new staff members. You\'ll be able to set their personal details, assign roles, choose their branch, and configure their access permissions all in one place.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#staff-table',
            popover: {
                title: '📋 COMPREHENSIVE STAFF DIRECTORY',
                description:
                    'Your complete team roster! This table shows all staff members with their key information: name, role, status, branch, contact details, and more. Each row represents one team member.',
                side: 'top',
                align: 'center',
            },
        },
        {
            element: '#staff-table-header-name',
            popover: {
                title: '👤 EMPLOYEE IDENTIFICATION',
                description:
                    'Staff member names and basic identification. Click the column header to sort alphabetically by name for easy browsing.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#staff-table-header-role',
            popover: {
                title: '🎯 ROLE & RESPONSIBILITIES',
                description:
                    'Each person\'s role and access level within your organization. This determines what features and data they can access in the system.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#staff-table-header-status',
            popover: {
                title: '📊 EMPLOYMENT STATUS',
                description:
                    'Current employment status indicator. Green typically means active, yellow for pending, red for suspended, and gray for terminated staff.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#staff-table-header-branch',
            popover: {
                title: '🏢 ORGANIZATIONAL STRUCTURE',
                description:
                    'Which branch or location each staff member is assigned to. Important for multi-location businesses and reporting structure.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#staff-table-header-contact',
            popover: {
                title: '📞 CONTACT INFORMATION',
                description:
                    'Quick access to staff contact details including email and phone numbers for easy communication.',
                side: 'bottom',
                align: 'end',
            },
        },
        {
            element: '.staff-row',
            popover: {
                title: '🖱️ DETAILED STAFF PROFILE',
                description:
                    'Click any staff member row to open their complete profile. You\'ll see full personal details, employment history, permissions, and available actions based on your role.',
                side: 'right',
                align: 'start',
            },
        },
        {
            element: '#staff-row-example .staff-avatar',
            popover: {
                title: '📸 STAFF PHOTO',
                description:
                    'Visual identification helps put faces to names. Staff can upload their own photos or admins can add them during onboarding.',
                side: 'right',
                align: 'start',
            },
        },
        {
            element: '#staff-row-example .staff-name',
            popover: {
                title: '👨‍💼 FULL NAME & TITLE',
                description:
                    'Complete staff member name and their job title. This helps identify who does what in your organization.',
                side: 'right',
                align: 'center',
            },
        },
        {
            element: '#staff-row-example .staff-role-badge',
            popover: {
                title: '🏷️ ROLE INDICATOR',
                description:
                    'Visual badge showing the staff member\'s role and access level. Color-coded for quick identification of permission levels.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#staff-row-example .staff-status-badge',
            popover: {
                title: '🚦 STATUS INDICATOR',
                description:
                    'Current employment status with color coding: Active (green), Pending (yellow), Suspended (red), Terminated (gray).',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#staff-row-example .staff-branch-info',
            popover: {
                title: '🏢 BRANCH ASSIGNMENT',
                description:
                    'Shows which branch or location this staff member belongs to. Important for organizational structure and reporting.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#staff-row-example .staff-contact-info',
            popover: {
                title: '📧 QUICK CONTACT',
                description:
                    'Email and phone information for immediate communication. Click to open your email client or dial the number directly.',
                side: 'bottom',
                align: 'end',
            },
        },
        {
            element: '#staff-row-example .staff-actions',
            popover: {
                title: '⚡ QUICK ACTIONS',
                description:
                    'Depending on your permissions, you might see action buttons for editing details, changing status, resetting passwords, or other management functions.',
                side: 'left',
                align: 'end',
            },
        },
        {
            element: '#staff-table-pagination',
            popover: {
                title: '📄 NAVIGATE LARGE TEAMS',
                description:
                    'For organizations with many staff members, use pagination controls to browse through different pages of your team directory.',
                side: 'top',
                align: 'center',
            },
        },
        {
            popover: {
                title: '📊 STAFF MANAGEMENT INSIGHTS',
                description:
                    'Pay attention to the distribution of roles and statuses in your team. A healthy organization typically has clear role hierarchies and mostly active staff members. Use filters to analyze different aspects of your workforce.',
                align: 'center',
            },
        },
        {
            popover: {
                title: '🎯 BEST PRACTICES',
                description:
                    'Regularly review staff statuses, ensure appropriate role assignments, and keep contact information updated. Use the search and filter features to quickly find team members when needed.',
                align: 'center',
            },
        },
        {
            popover: {
                title: '🚀 STAFF MANAGEMENT COMPLETE!',
                description:
                    'You\'re now equipped to effectively manage your entire workforce! Use the search and filters to find specific team members, click on rows for detailed profiles, and add new staff as your organization grows.',
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
                title: '📦 INVENTORY & STOCK MANAGEMENT',
                description:
                    'Welcome to your Inventory Control Center! This is where you track stock levels, manage products, monitor inventory value, and ensure optimal stock availability. Let\'s explore comprehensive inventory management!',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            popover: {
                title: '🏪 STOCK MANAGEMENT OVERVIEW',
                description:
                    'This comprehensive inventory system helps you maintain optimal stock levels, track product performance, manage costs, and prevent stockouts or overstock situations across your entire product catalog.',
                align: 'center',
            },
        },
        {
            element: '#product-search-input',
            popover: {
                title: '🔍 PRODUCT FINDER',
                description:
                    'Quickly locate specific products by name, SKU, barcode, or description. Essential for immediate stock checks and product management tasks.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#product-status-filter-trigger',
            popover: {
                title: '🚦 STOCK STATUS FILTERING',
                description:
                    'Filter products by availability status: Active (in stock), Inactive (discontinued), Out of Stock (need reorder), Low Stock (approaching minimum), Overstocked (excess inventory), or New (recently added).',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#product-category-filter-trigger',
            popover: {
                title: '🏷️ CATEGORY ORGANIZATION',
                description:
                    'Filter by product categories: Electronics, Clothing, Food & Beverage, Office Supplies, Hardware, etc. Organize inventory by logical groupings for better management.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#product-supplier-filter-trigger',
            popover: {
                title: '🚚 SUPPLIER FILTERING',
                description:
                    'Filter products by supplier to analyze vendor performance, manage supplier relationships, and streamline procurement processes.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#product-location-filter-trigger',
            popover: {
                title: '📍 LOCATION-BASED INVENTORY',
                description:
                    'Filter by storage location or warehouse to manage multi-location inventory and track stock distribution across different sites.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#clear-product-filters-button',
            popover: {
                title: '❌ RESET INVENTORY VIEW',
                description:
                    'Clear all active filters and search terms to return to the complete product catalog overview. This appears when filters are applied.',
                side: 'left',
                align: 'end',
            },
        },
        {
            element: '#add-product-button',
            popover: {
                title: '➕ ADD NEW PRODUCTS',
                description:
                    'Expand your inventory! Add new products with complete details: SKU, pricing, supplier information, stock levels, and reorder parameters.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#bulk-inventory-actions',
            popover: {
                title: '📊 BULK OPERATIONS',
                description:
                    'Select multiple products for batch operations: price updates, stock adjustments, category changes, or bulk exports for analysis.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#inventory-alerts-panel',
            popover: {
                title: '🚨 INVENTORY ALERTS',
                description:
                    'Monitor critical inventory alerts: low stock warnings, overstock notifications, expired products, and reorder reminders to maintain optimal inventory levels.',
                side: 'bottom',
                align: 'end',
            },
        },
        {
            element: '#inventory-table',
            popover: {
                title: '📋 COMPREHENSIVE PRODUCT CATALOG',
                description:
                    'Your complete inventory database! This table displays all products with critical information: stock levels, costs, pricing, suppliers, and performance metrics.',
                side: 'top',
                align: 'center',
            },
        },
        {
            element: '#inventory-table-header-product',
            popover: {
                title: '🏷️ PRODUCT IDENTIFICATION',
                description:
                    'Product names, SKUs, and descriptions for easy identification. Click to sort alphabetically or by SKU for quick location.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#inventory-table-header-stock',
            popover: {
                title: '📊 STOCK LEVELS',
                description:
                    'Current stock quantities with visual indicators for low stock, optimal levels, and overstock situations. Critical for availability planning.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#inventory-table-header-cost',
            popover: {
                title: '💰 COST ANALYSIS',
                description:
                    'Product costs including unit cost, total inventory value, and cost per unit metrics for financial planning and profitability analysis.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#inventory-table-header-price',
            popover: {
                title: '💲 PRICING INFORMATION',
                description:
                    'Selling prices, profit margins, and pricing tiers to understand profitability and competitive positioning for each product.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#inventory-table-header-supplier',
            popover: {
                title: '🚚 SUPPLIER DETAILS',
                description:
                    'Primary suppliers for each product, lead times, and supplier performance metrics for procurement planning and vendor management.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#inventory-table-header-movement',
            popover: {
                title: '📈 STOCK MOVEMENT',
                description:
                    'Recent stock movements, turnover rates, and velocity metrics to understand product performance and demand patterns.',
                side: 'bottom',
                align: 'end',
            },
        },
        {
            element: '.product-row',
            popover: {
                title: '🖱️ DETAILED PRODUCT PROFILE',
                description:
                    'Click any product row to access comprehensive product details, stock history, supplier information, and available inventory management actions.',
                side: 'right',
                align: 'start',
            },
        },
        {
            element: '#product-row-example .product-image',
            popover: {
                title: '📸 PRODUCT VISUALIZATION',
                description:
                    'Product images for visual identification and catalog presentation. Helps with quick recognition and customer-facing materials.',
                side: 'right',
                align: 'start',
            },
        },
        {
            element: '#product-row-example .product-name-sku',
            popover: {
                title: '🏷️ PRODUCT IDENTIFICATION',
                description:
                    'Complete product name and SKU (Stock Keeping Unit) for precise identification and catalog management.',
                side: 'right',
                align: 'center',
            },
        },
        {
            element: '#product-row-example .stock-level-indicator',
            popover: {
                title: '📊 STOCK STATUS INDICATOR',
                description:
                    'Visual stock level indicator with color coding: Green (optimal), Yellow (low stock), Red (out of stock), Blue (overstocked).',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#product-row-example .quantity-display',
            popover: {
                title: '📦 QUANTITY METRICS',
                description:
                    'Current stock quantity, minimum stock level, and maximum stock level for automated reorder management.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#product-row-example .cost-pricing-info',
            popover: {
                title: '💰 FINANCIAL METRICS',
                description:
                    'Unit cost, selling price, and total inventory value for financial analysis and profitability calculations.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#product-row-example .supplier-info',
            popover: {
                title: '🚚 SUPPLIER DETAILS',
                description:
                    'Primary supplier information and lead time data for procurement planning and vendor relationship management.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#product-row-example .movement-metrics',
            popover: {
                title: '📈 PERFORMANCE INDICATORS',
                description:
                    'Recent sales velocity, turnover rate, and movement trends to understand product performance and demand patterns.',
                side: 'bottom',
                align: 'end',
            },
        },
        {
            element: '#product-row-example .inventory-actions',
            popover: {
                title: '⚡ QUICK INVENTORY ACTIONS',
                description:
                    'Fast access to common inventory tasks: adjust stock, update pricing, reorder product, or view detailed history.',
                side: 'left',
                align: 'end',
            },
        },
        {
            element: '#inventory-summary-cards',
            popover: {
                title: '📊 INVENTORY ANALYTICS',
                description:
                    'Key inventory metrics: total products, total value, low stock alerts, and inventory turnover rates for strategic decision making.',
                side: 'top',
                align: 'center',
            },
        },
        {
            element: '#inventory-value-chart',
            popover: {
                title: '💹 INVENTORY VALUE TRACKING',
                description:
                    'Visual representation of inventory value trends over time, helping you understand investment levels and asset management.',
                side: 'top',
                align: 'center',
            },
        },
        {
            element: '#reorder-recommendations',
            popover: {
                title: '🔄 AUTOMATED REORDER SUGGESTIONS',
                description:
                    'AI-powered reorder recommendations based on sales velocity, lead times, and seasonal patterns to maintain optimal stock levels.',
                side: 'top',
                align: 'center',
            },
        },
        {
            element: '#inventory-table-pagination',
            popover: {
                title: '📄 NAVIGATE PRODUCT CATALOG',
                description:
                    'For large product catalogs, use pagination controls to browse through different pages of your inventory efficiently.',
                side: 'top',
                align: 'center',
            },
        },
        {
            popover: {
                title: '📦 INVENTORY MANAGEMENT INSIGHTS',
                description:
                    'Monitor key indicators: stock turnover rates, carrying costs, stockout frequency, and supplier performance. Healthy inventory management balances availability with cost efficiency.',
                align: 'center',
            },
        },
        {
            popover: {
                title: '🎯 INVENTORY BEST PRACTICES',
                description:
                    'Regularly review stock levels, analyze movement patterns, maintain accurate counts, and optimize reorder points. Use alerts to prevent stockouts and reduce excess inventory.',
                align: 'center',
            },
        },
        {
            popover: {
                title: '🚀 INVENTORY MASTERY COMPLETE!',
                description:
                    'You\'re now equipped to effectively manage your entire product catalog! Use search and filters to find products quickly, monitor stock levels proactively, and make data-driven inventory decisions.',
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

    // ====================
    // My Reports Page Tour (/my-reports or /reports/personal)
    // ====================
    '/my-reports': [
        {
            popover: {
                title: '📊 WELCOME TO YOUR PERSONAL ANALYTICS!',
                description:
                    'This is your personal performance dashboard! Here you can track your individual metrics, productivity, achievements, and progress over time. Let\'s explore what insights await you!',
                align: 'center',
            },
        },
        {
            element: '#my-reports-header',
            popover: {
                title: '🎯 YOUR PERFORMANCE HUB',
                description:
                    'Welcome to your personalized analytics center! This dashboard focuses specifically on YOUR contributions, achievements, and performance metrics within the organization.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#my-reports-time-filter',
            popover: {
                title: '📅 TIME PERIOD SELECTOR',
                description:
                    'Choose your analysis timeframe: Today, This Week, This Month, This Quarter, or This Year. Different time periods reveal different insights about your performance trends.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#my-reports-refresh-button',
            popover: {
                title: '🔄 REFRESH YOUR DATA',
                description:
                    'Get the latest updates on your performance metrics! Click to refresh all charts and statistics with the most current data available.',
                side: 'bottom',
                align: 'end',
            },
        },
        {
            element: '#my-performance-summary-cards',
            popover: {
                title: '📈 YOUR KEY METRICS',
                description:
                    'These cards provide a quick snapshot of your performance across different areas: tasks completed, hours worked, client interactions, sales generated, and more!',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#my-tasks-completed-card',
            popover: {
                title: '✅ TASKS ACHIEVEMENT',
                description:
                    'Track your task completion rate and productivity. See how many tasks you\'ve completed in the selected time period and your success rate.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#my-hours-worked-card',
            popover: {
                title: '⏰ TIME CONTRIBUTION',
                description:
                    'Monitor your working hours and time efficiency. See total hours worked, average daily hours, and how you compare to your targets.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#my-client-interactions-card',
            popover: {
                title: '🤝 CLIENT ENGAGEMENT',
                description:
                    'Track your client relationship building! See how many client interactions, meetings, calls, and follow-ups you\'ve completed.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#my-sales-revenue-card',
            popover: {
                title: '💰 REVENUE GENERATION',
                description:
                    'If you\'re in sales, see your revenue contributions! Track deals closed, quotations sent, and your impact on company revenue.',
                side: 'bottom',
                align: 'end',
            },
        },
        {
            element: '#my-reports-tabs',
            popover: {
                title: '📋 DETAILED ANALYTICS TABS',
                description:
                    'Dive deeper into specific areas of your performance. Each tab reveals detailed charts and metrics for different aspects of your work.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#my-tasks-analytics-tab',
            popover: {
                title: '✅ TASK PERFORMANCE DEEP DIVE',
                description:
                    'Analyze your task management skills: completion rates over time, priority handling, deadline adherence, and areas for improvement.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#my-time-analytics-tab',
            popover: {
                title: '⏱️ TIME UTILIZATION ANALYSIS',
                description:
                    'Understand your working patterns: peak productivity hours, time spent on different activities, and work-life balance insights.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#my-client-analytics-tab',
            popover: {
                title: '🤝 CLIENT RELATIONSHIP METRICS',
                description:
                    'Review your client interaction quality: response times, satisfaction ratings, relationship building progress, and communication effectiveness.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#my-sales-analytics-tab',
            popover: {
                title: '💼 SALES PERFORMANCE REVIEW',
                description:
                    'For sales professionals: conversion rates, pipeline management, quota achievement, and sales cycle analysis to boost your performance.',
                side: 'bottom',
                align: 'center',
            },
        },
        {
            element: '#my-goals-progress-tab',
            popover: {
                title: '🎯 GOAL TRACKING',
                description:
                    'Monitor your progress toward personal and professional goals set with your manager. See completion percentages and upcoming milestones.',
                side: 'bottom',
                align: 'end',
            },
        },
        {
            element: '#my-performance-chart',
            popover: {
                title: '📊 PERFORMANCE TRENDS',
                description:
                    'Visual representation of your performance over time. Identify patterns, growth areas, and celebrate your achievements with clear trend analysis.',
                side: 'top',
                align: 'center',
            },
        },
        {
            element: '#my-achievements-section',
            popover: {
                title: '🏆 YOUR ACHIEVEMENTS',
                description:
                    'Celebrate your wins! This section highlights your major accomplishments, milestones reached, and recognition received during the selected period.',
                side: 'top',
                align: 'center',
            },
        },
        {
            element: '#my-improvement-suggestions',
            popover: {
                title: '💡 GROWTH OPPORTUNITIES',
                description:
                    'AI-powered suggestions for improvement based on your performance data. These insights help you identify areas to focus on for professional growth.',
                side: 'top',
                align: 'center',
            },
        },
        {
            element: '#export-my-report-button',
            popover: {
                title: '📄 EXPORT YOUR REPORT',
                description:
                    'Share your achievements! Export your performance report as PDF for performance reviews, goal-setting meetings, or personal records.',
                side: 'left',
                align: 'end',
            },
        },
        {
            popover: {
                title: '🌟 PERFORMANCE INSIGHTS',
                description:
                    'Use these analytics to understand your work patterns, identify your strengths, and find opportunities for growth. Regular review helps you stay aligned with your career goals.',
                align: 'center',
            },
        },
        {
            popover: {
                title: '🚀 YOUR ANALYTICS JOURNEY COMPLETE!',
                description:
                    'You\'re now equipped to track and improve your personal performance! Use different time periods to see various trends, and don\'t forget to celebrate your achievements along the way!',
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
                    'Check your team\'s LORO! See the "Total Employees" (14) and how many are "Active Now" (0 in this example). This gives you a quick understanding of your current operational capacity. 💪',
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
