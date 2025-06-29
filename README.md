# Email Sequence Dashboard Frontend

A modern, responsive dashboard for managing email sequences, outreach campaigns, clients, and mailboxes. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### 🎯 Dashboard Overview
- Real-time statistics and metrics
- Interactive charts and visualizations  
- Quick access to key actions

### 📧 Email Management
- View and manage email sequences
- Track email status and performance
- Schedule and send test emails
- Reply to incoming emails

### 👥 Client Management
- Complete CRUD operations for client contacts
- Search and filter capabilities
- Company and contact information tracking
- Client interaction history

### 🚀 Outreach Campaigns
- Create and manage outreach campaigns
- Template-based email sequences
- Campaign performance tracking
- Schedule and automation controls

### 📮 Mailbox Configuration
- Multiple mailbox support
- SMTP/IMAP configuration
- Auto-detection for popular email providers
- Connection status monitoring

### ⚙️ Settings & Configuration
- User profile management
- Security settings
- Notification preferences
- Appearance customization

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **State Management**: React Context
- **Charts**: Recharts
- **Icons**: Heroicons
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API server running

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   cd email-sequence-server/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env.local` file in the frontend directory:
   ```bash
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3001](http://localhost:3001)

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── login/              # Authentication pages
│   │   ├── register/
│   │   ├── error.tsx           # Global error page
│   │   └── not-found.tsx       # 404 page
│   ├── components/
│   │   ├── dashboard/          # Dashboard components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── DashboardOverview.tsx
│   │   │   ├── EmailsView.tsx
│   │   │   ├── ClientsView.tsx
│   │   │   ├── OutreachView.tsx
│   │   │   ├── MailboxView.tsx
│   │   │   └── SettingsView.tsx
│   │   ├── forms/              # Form components
│   │   │   ├── ClientForm.tsx
│   │   │   ├── OutreachForm.tsx
│   │   │   └── MailboxForm.tsx
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Modal.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   └── providers.tsx       # React Context providers
│   ├── lib/
│   │   ├── api.ts              # API service layer
│   │   └── utils.ts            # Utility functions
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   └── styles/
│       └── globals.css         # Global styles
├── public/                     # Static assets
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## API Integration

The frontend integrates with the NestJS backend API through a centralized API service layer (`src/lib/api.ts`). This service handles:

- Authentication token management
- Request/response interceptors
- Error handling and user feedback
- Type-safe API calls

### Authentication Flow

1. User logs in through `/login` page
2. JWT token is stored in HTTP-only cookies
3. Token is automatically included in API requests
4. Automatic redirect to login on 401 responses

### Supported API Endpoints

- **Authentication**: `/users/login`, `/users/register`, `/users/profile`
- **Clients**: Full CRUD operations (`/client`)
- **Emails**: Management and scheduling (`/email`)
- **Outreach**: Campaign management (`/outreach`)
- **Mailboxes**: Configuration and management (`/mailbox`)

## Components Overview

### Dashboard Components

- **DashboardOverview**: Statistics, charts, and key metrics
- **EmailsView**: Email list, filters, and actions
- **ClientsView**: Client management with search and CRUD operations
- **OutreachView**: Campaign management and performance tracking
- **MailboxView**: Mailbox configuration and status monitoring
- **SettingsView**: User preferences and configuration

### Form Components

- **ClientForm**: Create/edit client contacts with validation
- **OutreachForm**: Campaign creation with email templates
- **MailboxForm**: SMTP/IMAP configuration with provider auto-detection

### UI Components

- **Modal**: Reusable modal component with size variants
- **LoadingSpinner**: Consistent loading states
- **ErrorBoundary**: Error handling and recovery

## Styling & Design

- **Design System**: Tailwind CSS with custom configuration
- **Color Palette**: Professional blue-gray theme
- **Typography**: Inter font family
- **Responsive**: Mobile-first design approach
- **Accessibility**: ARIA labels and keyboard navigation

## State Management

- **Authentication**: React Context for user state
- **Form State**: React Hook Form for complex forms
- **Server State**: Direct API calls with error handling
- **UI State**: Local component state with useState

## Error Handling

- **API Errors**: Centralized error handling with user-friendly messages
- **Form Validation**: Real-time validation with clear error messages
- **Error Boundaries**: Graceful error recovery with fallback UI
- **Loading States**: Skeleton loaders and spinners

## Performance Optimizations

- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching**: Browser caching and API response caching

## Development Guidelines

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Next.js recommended configuration
- **Prettier**: Automatic code formatting
- **Import Organization**: Absolute imports with path mapping

### Component Patterns

- **Functional Components**: React hooks throughout
- **Custom Hooks**: Reusable logic extraction
- **Prop Types**: TypeScript interfaces for props
- **Error Handling**: Try-catch blocks with user feedback

### Testing (Future)

- **Unit Tests**: Jest and React Testing Library
- **Integration Tests**: API integration testing
- **E2E Tests**: Playwright for user flows
- **Visual Testing**: Storybook for component development

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables

Production environment variables:

```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

## Troubleshooting

### Common Issues

1. **API Connection Errors**:
   - Check `NEXT_PUBLIC_API_URL` environment variable
   - Ensure backend server is running
   - Verify CORS configuration

2. **Authentication Issues**:
   - Clear browser cookies
   - Check JWT token expiration
   - Verify API endpoint responses

3. **Build Errors**:
   - Run `npm run type-check` for TypeScript errors
   - Check for missing dependencies
   - Verify environment variables

### Development Tips

- Use browser DevTools for debugging API calls
- Check Network tab for failed requests
- Use React DevTools for component state
- Enable verbose logging in development

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests (when available)
5. Submit a pull request

## License

This project is part of the email-sequence-server application.

## Support

For issues and questions:
- Check the backend API documentation
- Review browser console for errors
- Verify API endpoint availability
- Check network connectivity

---

**Last Updated**: June 2025
**Version**: 1.0.0
