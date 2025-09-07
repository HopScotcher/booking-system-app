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