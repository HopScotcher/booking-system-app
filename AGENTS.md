# .cursorrules - Booking System MVP Project Configuration

## Project Overview
This is a booking system MVP for SMEs (Small and Medium Enterprises), starting with a home cleaning business.
The system allows customers to book services online and businesses to manage those bookings through a dashboard.

## Tech Stack
- **Framework**: Next.js 14 with App Router (TypeScript)
- **Styling**: TailwindCSS + shadcn/ui components
- **Database**: PostgreSQL via Supabase + Prisma ORM
- **Authentication**: NextAuth.js v5 with credentials provider
- **Email**: Resend or SendGrid for transactional emails
- **Deployment**: Vercel (app) + Supabase (database)
- **State Management**: React state (useState, useReducer) + TanStack Query for server state
- **Form Handling**: React Hook Form + Zod validation

## Project Structure
```
src/
├── app/
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── bookings/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts
│       └── bookings/
│           ├── route.ts (GET with filters)
│           └── [id]/
│               └── route.ts (PATCH for updates)
├── components/
│   ├── admin/
│   │   ├── BookingsTable.tsx
│   │   ├── BookingStatusBadge.tsx
│   │   ├── BookingFilters.tsx
│   │   ├── StatusUpdateModal.tsx
│   │   └── DashboardLayout.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── ProtectedRoute.tsx
│   └── ui/ (existing shadcn components)
├── lib/
│   ├── auth/
│   │   ├── config.ts
│   │   └── providers.ts
│   ├── validations/
│   │   └── admin.ts
│   └── utils/
│       └── dates.ts
├── middleware.ts
└── types/
    └── admin.ts

## Database Schema (Key Models)
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  phone     String?
  password  String?  // hashed with bcrypt
  role      Role     @default(CUSTOMER)
  bookings  Booking[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Booking {
  id            String        @id @default(cuid())
  customerName  String
  customerEmail String
  customerPhone String
  service       String
  servicePrice  Float
  date          DateTime
  timeSlot      String
  address       String
  notes         String?
  status        BookingStatus @default(PENDING)
  userId        String?
  user          User?         @relation(fields: [userId], references: [id])
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}

enum Role {
  CUSTOMER
  ADMIN
  STAFF
}
```

## Development Rules & Conventions

### TypeScript Rules
- ALWAYS use TypeScript with strict mode enabled
- Define interfaces for all data structures (API requests/responses, component props)
- Use proper typing for database operations with Prisma
- Avoid `any` type - use `unknown` or proper type definitions
- Export types from a central `types/` directory when shared across files

### Next.js App Router Conventions
- Use Server Components by default, add "use client" only when necessary
- Server Actions for form submissions and data mutations
- API routes only for external integrations or complex operations
- Proper error boundaries and loading states
- SEO optimization with metadata exports

### Component Development
- Functional components with TypeScript interfaces for props
- Use shadcn/ui components as base, customize with TailwindCSS
- Implement proper error states and loading indicators
- Make all components mobile-responsive by default
- Use compound component patterns for complex UI elements

### Form Handling Standards
- React Hook Form for all forms with Zod validation
- Server-side validation matching client-side schemas
- Proper error display and user feedback
- Accessibility features (ARIA labels, keyboard navigation)
- Progressive enhancement (forms work without JavaScript)

### API Design Patterns
- RESTful endpoints with proper HTTP methods
- Consistent error response format:
  ```typescript
  {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "User-friendly message",
      details?: ValidationError[]
    }
  }
  ```
- Success response format:
  ```typescript
  {
    success: true,
    data: T,
    message?: string
  }
  ```
- Rate limiting on all public endpoints
- Input validation using Zod schemas
- Proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)

### Database Patterns
- Use Prisma transactions for multi-step operations
- Implement soft deletes where appropriate
- Add database indexes for frequently queried fields
- Use database constraints to enforce data integrity
- Handle database connection errors gracefully

### Authentication & Authorization
- NextAuth.js for session management
- Middleware to protect admin routes
- Role-based access control (RBAC)
- Secure password hashing with bcrypt
- CSRF protection on state-changing operations

### Error Handling
- Global error boundary for React components
- API error handling with proper logging
- User-friendly error messages (no technical details exposed)
- Fallback UI states for failed data loading
- Error tracking integration (Sentry in production)

### Performance & Optimization
- Image optimization with Next.js Image component
- Code splitting and lazy loading where appropriate
- Database query optimization (select only needed fields)
- Caching strategies for static and dynamic content
- Bundle analysis to monitor build size

### Security Standards
- Input sanitization and validation on all user inputs
- SQL injection prevention (Prisma handles this)
- XSS prevention with proper escaping
- HTTPS everywhere (enforced in production)
- Environment variables for all secrets
- Rate limiting to prevent abuse

## Code Style & Quality

### Naming Conventions
- **Components**: PascalCase (BookingForm, AdminDashboard)
- **Files**: kebab-case for pages, PascalCase for components
- **Variables/Functions**: camelCase (getUserBookings, isAuthenticated)
- **Constants**: UPPER_SNAKE_CASE (MAX_BOOKINGS_PER_DAY)
- **Database fields**: camelCase in Prisma, snake_case in SQL

### Import Organization
```typescript
// 1. React and Next.js imports
import { useState } from 'react'
import { NextRequest, NextResponse } from 'next/server'

// 2. Third-party library imports
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

// 3. Internal imports (utilities, components)
import { db } from '@/lib/db'
import { BookingForm } from '@/components/booking/BookingForm'

// 4. Type imports (always last, separated)
import type { Booking, User } from '@prisma/client'
```

### Code Documentation
- JSDoc comments for complex functions and API endpoints
- README files for each major directory explaining purpose
- Inline comments for complex business logic only
- API documentation with request/response examples

## Testing Standards
- Unit tests for utility functions and complex business logic
- Integration tests for API endpoints
- Component testing with React Testing Library
- E2E tests for critical user flows (booking, login)
- Database tests with proper cleanup and isolation

## Environment & Configuration
- Use environment variables for all configuration
- Separate .env files for different environments
- Never commit secrets to version control
- Document all required environment variables in README

## Business Logic Rules

### Booking System Rules
- Bookings can only be made for future dates (minimum 2 hours ahead)
- Time slots are in 1-hour increments from 8 AM to 6 PM
- Maximum 30 days advance booking allowed
- Customers can have maximum 3 pending bookings at once
- Booking cancellation allowed up to 24 hours before appointment

### Email Notification Rules
- Send customer confirmation email immediately after booking
- Send business notification email within 5 minutes
- Retry failed emails up to 3 times with exponential backoff
- Include booking details and cancellation instructions
- Use professional email templates with business branding

### Admin Dashboard Rules
- Only ADMIN and STAFF roles can access admin routes
- Booking status can only be updated by authenticated users
- Log all booking modifications with user and timestamp
- Export functionality limited to last 12 months of data
- Dashboard should handle up to 1000 bookings efficiently

## Common Patterns & Examples

### API Route Pattern
```typescript
// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const createBookingSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  // ... other fields
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createBookingSchema.parse(body)
    
    const booking = await db.booking.create({
      data: validatedData
    })
    
    return NextResponse.json({
      success: true,
      data: booking,
      message: 'Booking created successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input data', details: error.errors } },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    )
  }
}
```

### Component Pattern
```typescript
// components/booking/BookingForm.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { bookingSchema } from '@/lib/validations'

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => Promise<void>
  isLoading?: boolean
}

export function BookingForm({ onSubmit, isLoading }: BookingFormProps) {
  const form = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      // ... other defaults
    }
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Form fields with proper error handling */}
    </form>
  )
}
```

## Performance Targets
- Page load time: < 3 seconds
- API response time: < 500ms
- Mobile responsiveness: 100% compatibility
- Lighthouse score: > 90 for all metrics
- Database query time: < 100ms for most operations

## Deployment Requirements
- Zero-downtime deployments
- Database migration strategy for production
- Environment-specific configuration
- Health check endpoints for monitoring
- Error tracking and logging in production

When generating code, always follow these rules and patterns. Prioritize type safety, user experience, and maintainable architecture. Ask for clarification if requirements conflict with these standards.