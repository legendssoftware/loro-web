# LORO Admin Dashboard 🚀

A modern Next.js 14 dashboard for managing location tracking, geofencing, and business operations. Built with TypeScript and Tailwind CSS.

## 🎯 Key Features

### 1. Business Management 💼
- **Client Management**
  - Client profiles and details
  - Client filtering and organization
  - Communication tracking
  - Client cards with quick actions

- **User Management**
  - User profiles
  - Role-based access control
  - User activity tracking
  - Secure authentication

- **Claims Handling**
  - Kanban-style claims management
  - Status tracking and updates
  - Detailed claim information
  - Document attachments

- **Task Management**
  - Task assignment
  - Deadline tracking
  - Priority management
  - Progress monitoring

### 2. Inventory & Quotations 📦
- **Inventory Management**
  - Stock tracking
  - Product categories
  - Pricing management
  - Inventory alerts

- **Quotation System**
  - Quote generation
  - Approval workflow
  - Client-specific pricing
  - Quote tracking

### 3. Location Services 🗺️
- **Interactive Maps**
  - Real-time location data
  - Route optimization
  - Geofencing capabilities
  - Address verification

### 4. System Administration ⚙️
- **Settings Management**
  - Organization settings
  - User permissions
  - System configuration
  - Branding options

## 🚀 Quick Start Guide

1. **Setup (2 minutes)**
   ```bash
   git clone <repository-url>
   cd dashboard
   yarn install
   ```

2. **Environment Setup (1 minute)**
   ```bash
   cp .env.example .env.local
   # Update:
   NEXT_PUBLIC_API_URL=http://localhost:4400
   ```

3. **Start Development (1 minute)**
   ```bash
   yarn dev
   ```

4. **Authentication**
   - Visit http://localhost:3000
   - Login with demo credentials:
     - Email: admin@loro.com
     - Password: admin123

## 📱 Key Pages

1. **Client Management**
   - /clients - Client overview and management
   - /leads - Lead tracking and conversion

2. **User Management**
   - /users - User administration
   - /staff - Staff management and roles

3. **Operations**
   - /tasks - Task management dashboard
   - /claims - Claims processing
   - /quotations - Quote management
   - /inventory - Inventory tracking

4. **Location Services**
   - /map - Interactive location mapping

5. **Administration**
   - /settings - System configuration
   - /resellers - Reseller management

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: 
  - [Zustand](https://github.com/pmndrs/zustand)
  - React Context
- **API Management**: [TanStack Query](https://tanstack.com/query)
- **Authentication**: JWT token-based auth with refresh tokens
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)

## 📂 Project Structure

```
dashboard/
├── app/                  # Next.js App Router pages
│   ├── clients/          # Client management
│   ├── users/            # User management
│   ├── tasks/            # Task management
│   ├── claims/           # Claims processing
│   ├── inventory/        # Inventory management
│   ├── quotations/       # Quote system
│   ├── settings/         # System settings
│   ├── map/              # Location mapping
│   ├── sign-in/          # Authentication pages
│   └── layout.tsx        # Root layout
├── components/           # Shared UI components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── navigation/       # Navigation elements
│   └── auth/             # Auth components
├── modules/              # Feature modules
│   ├── clients/          # Client-related components
│   ├── users/            # User-related components
│   ├── tasks/            # Task-related components
│   └── claims/           # Claims-related components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── services/         # API services
│   ├── utils/            # Helper utilities
│   └── types/            # TypeScript type definitions
├── store/                # Zustand state stores
├── providers/            # Context providers
└── styles/               # Global styles
```

## 🔄 Recent Updates

### Authentication System Improvements
- Fixed page refresh redirection issue
- Improved token refresh mechanism
- Enhanced session persistence
- Smoother authentication flow
- Route preservation during page refreshes

### Performance Optimizations
- Reduced unnecessary re-renders
- Optimized data fetching with React Query
- Improved component memoization
- Enhanced routing transitions

## 🤝 Support

Need help with the dashboard?
Contact: support@loro.com

## 📝 Troubleshooting

### Authentication Issues
If you experience authentication problems:
1. Clear browser cookies and local storage
2. Ensure your API server is running
3. Check your network connections
4. Verify correct API endpoints in .env

### Page Navigation
If experiencing routing issues:
1. Ensure you're using client-side navigation (`useRouter` from next/navigation)
2. Avoid full page refreshes when possible
3. Use Link components for internal navigation

## 🎯 Demo Features

### 1. Location Management 📍
- **Real-time Tracking**
  - Live location updates on map
  - Historical tracking data
  - Battery and network status
  - Device information

- **Geofence Management**
  - Visual geofence creation
  - Entry/exit notifications
  - Area analytics
  - Compliance reporting

- **Stop Analysis**
  - Stop detection visualization
  - Duration analytics
  - Address verification
  - Pattern recognition

### 2. Business Intelligence 📊
- **Analytics Dashboard**
  - Real-time metrics
  - Performance tracking
  - Resource utilization
  - Custom reports

- **Team Management**
  - Employee tracking
  - Task assignment
  - Performance metrics
  - Attendance tracking

### 3. System Administration 🔧
- Role-based access control
- Organization settings
- API key management
- Audit logging

## 🚀 Quick Demo Guide

1. **Setup (2 minutes)**
   ```bash
   git clone <repository-url>
   cd dashboard
   yarn install
   ```

2. **Environment Setup (1 minute)**
   ```bash
   cp .env.example .env.local
   # Update:
   NEXT_PUBLIC_API_URL=http://localhost:4400
   ```

3. **Start Development (1 minute)**
   ```bash
   yarn dev
   ```

4. **Demo Flow (15 minutes)**

   a. **Authentication**
   - Visit http://localhost:3000
   - Login with demo credentials:
     - Email: admin@loro.com
     - Password: admin123

   b. **Location Tracking Demo**
   - Navigate to "Tracking" section
   - View real-time location updates
   - Filter by date/employee
   - Export tracking data

   c. **Geofence Management**
   - Go to "Geofences" section
   - Create new geofence area
   - Set rules and notifications
   - View entry/exit events

   d. **Analytics Review**
   - Open "Dashboard" section
   - Review key metrics
   - Generate custom reports
   - Export analytics data

## 📱 Key Pages for Demo

1. **Location Management**
   - /tracking
   - /geofences
   - /stops

2. **Analytics**
   - /dashboard
   - /reports
   - /analytics

3. **Administration**
   - /settings
   - /users
   - /roles

## 🎨 UI Components

Built with Shadcn UI, featuring:
- Interactive maps
- Data tables
- Charts and graphs
- Form components
- Modal dialogs

## 📊 Demo Data

Test accounts available:
- Admin: admin@loro.com / admin123
- Manager: manager@loro.com / manager123
- Viewer: viewer@loro.com / viewer123

## 🔧 Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:4400
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_token
```

## ✨ Features

- **🔐 Authentication & User Management**
  - Secure login system
  - Password reset functionality
  - Email verification
  - OTP verification
  - User profile management
  - Role-based access control

- **📊 Business Intelligence**
  - Interactive dashboards
  - Real-time analytics
  - Performance metrics
  - Sales reporting
  - Resource utilization
  - KPI tracking

- **👥 Client Management**
  - Client profiles
  - Communication history
  - Document management
  - Service history
  - Relationship tracking
  - Client analytics

- **📝 Task Management**
  - Task creation and assignment
  - Priority management
  - Deadline tracking
  - Progress monitoring
  - Team collaboration
  - Task automation

- **🏢 Office Management**
  - Resource scheduling
  - Meeting management
  - Equipment tracking
  - Visitor management
  - Office announcements
  - Space utilization

- **💼 Document Management**
  - Document upload
  - Version control
  - Secure sharing
  - Template management
  - Document generation
  - Search and retrieval

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: 
  - [Zustand](https://github.com/pmndrs/zustand)
  - React Context
- **API Management**: [React Query](https://tanstack.com/query)
- **Authentication**: JWT token-based auth
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Linting**: ESLint with custom configuration
- **Formatting**: Prettier with consistent rules

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- Yarn package manager
- Access to the backend API endpoints

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/loro-dashboard.git
cd dashboard
```

2. Install dependencies
```bash
yarn install
```

3. Create environment variables
```bash
cp .env.example .env.local
# Update the .env.local file with your configuration
```

4. Start the development server
```bash
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📂 Project Structure

```
dashboard/
├── app/                  # Next.js App Router pages
│   ├── sign-in/          # Authentication pages
│   ├── sign-up/
│   ├── forgot-password/
│   ├── new-password/
│   ├── verify-email/
│   ├── verify-otp/
│   ├── my-office/        # Main application pages
│   ├── landing-page/     # Public landing page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Root page
├── components/           # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── modules/              # Feature modules
├── public/               # Static assets
├── providers/            # Context providers
├── store/                # State management
├── styles/               # Global styles
│── data/                 # Static data and mocks
├── types/                # TypeScript types
├── .env                  # Environment variables
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind configuration
└── package.json          # Dependencies and scripts
```

## 🧪 Development

### Available Scripts

```bash
# Development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Lint code
yarn lint

# Format code
yarn format
```

### Code Style

We follow strict TypeScript best practices and maintain consistent code style using ESLint and Prettier. The configuration is defined in:

- `.eslint.config.mjs`
- `.prettierrc`
- `.editorconfig`

## 🚢 Deployment

The application can be deployed to any hosting platform that supports Next.js applications:

- [Vercel](https://vercel.com/) (recommended)
- [Netlify](https://www.netlify.com/)
- [AWS Amplify](https://aws.amazon.com/amplify/)
- Self-hosted with Docker

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

[@Brandon-Online01](https://github.com/Brandon-Online01)
