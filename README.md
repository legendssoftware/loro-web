# LORO App 🚀

A modern Next.js 14 admin dashboard for managing location tracking, geofencing, workforce management, and business operations. Built with TypeScript, Tailwind CSS, and Shadcn UI.

## 🎯 Key Features

### 1. Location & Workforce Management 🗺️
- **Real-time Worker Tracking**
  - Interactive map visualization with worker positions
  - Custom markers for different activities (check-in, tasks, leads, etc.)
  - Detailed worker popups with status, tasks, and schedules
  - Geofencing capabilities
  - Historical tracking data
  
- **Worker Status Management**
  - Status tracking (working, on break, completed)
  - Job progress monitoring
  - Break time management
  - Schedule visualization

### 2. Business Operations 💼
- **Client Management**
  - Client profiles and details
  - Communication tracking
  - Client cards with quick actions

- **Task Management**
  - Task assignment and tracking
  - Deadline monitoring
  - Priority management
  - Progress visualization

- **Claims Processing**
  - Kanban-style claims management
  - Status tracking
  - Document attachments

### 3. Analytics & Reporting 📊
- **Business Intelligence**
  - Real-time metrics dashboards
  - Performance tracking
  - Resource utilization
  - Custom reports

### 4. System Administration ⚙️
- **User Management**
  - Role-based access control
  - User activity tracking
  - Secure authentication
  - Profile management

## 🚀 Getting Started

1. **Installation**
   ```bash
   git clone <repository-url>
   cd dashboard
   yarn install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Update:
   NEXT_PUBLIC_API_URL=http://localhost:4400
   ```

3. **Development Server**
   ```bash
   yarn dev
   # Access at http://localhost:3000
   ```

4. **Authentication**
   - Login with demo credentials:
     - Email: admin@loro.com
     - Password: admin123

## 📱 Key Pages

1. **Dashboard & Analytics**
   - `/` - Main dashboard with key metrics
   - `/analytics` - Detailed performance analytics

2. **Location Management**
   - `/map` - Interactive map with worker tracking
   - `/geofences` - Geofence management

3. **Business Operations**
   - `/clients` - Client management
   - `/tasks` - Task dashboard
   - `/claims` - Claims processing
   - `/leads` - Lead tracking

4. **System Administration**
   - `/users` - User management
   - `/settings` - System configuration

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
- **Maps**: [React Leaflet](https://react-leaflet.js.org/)

## 📂 Project Structure

```
dashboard/
├── app/                  # Next.js App Router pages
│   ├── clients/          # Client management
│   ├── users/            # User management
│   ├── tasks/            # Task management
│   ├── claims/           # Claims processing
│   ├── map/              # Location mapping
│   ├── sign-in/          # Authentication pages
│   └── layout.tsx        # Root layout
├── components/           # Shared UI components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── navigation/       # Navigation elements
├── modules/              # Feature modules
│   ├── map/              # Map-related components
│   ├── clients/          # Client-related components
│   ├── tasks/            # Task-related components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions & data
│   ├── services/         # API services
│   ├── utils/            # Helper utilities
│   ├── types/            # TypeScript types
├── store/                # Zustand state stores
├── providers/            # Context providers
└── styles/               # Global styles
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
```

## 🤝 Support

Need help with the dashboard?
Contact: support@loro.com


## Author 👨‍💻

[@Brandon-Online01](https://github.com/Brandon-Online01)

