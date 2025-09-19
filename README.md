This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```
booking-system-app
├─ .cursorrules
├─ components.json
├─ docs
│  └─ PRD.md
├─ eslint.config.mjs
├─ GUIDE.md
├─ lib
│  └─ db.ts
├─ middleware.ts
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ schema.prisma
│  └─ seed.ts
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ src
│  ├─ app
│  │  ├─ admin
│  │  │  ├─ bookings
│  │  │  │  └─ page.tsx
│  │  │  ├─ dashboard
│  │  │  │  └─ page.tsx
│  │  │  ├─ layout.tsx
│  │  │  └─ login
│  │  │     └─ page.tsx
│  │  ├─ api
│  │  │  ├─ auth
│  │  │  │  └─ [...nextauth]
│  │  │  │     └─ route.ts
│  │  │  └─ bookings
│  │  │     ├─ route.ts
│  │  │     └─ [id]
│  │  │        └─ route.ts
│  │  ├─ book
│  │  │  └─ page.tsx
│  │  ├─ confirmation
│  │  │  └─ page.tsx
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  └─ providers.tsx
│  ├─ components
│  │  ├─ admin
│  │  │  ├─ BookingFilters.tsx
│  │  │  ├─ BookingsTable.tsx
│  │  │  ├─ BookingStatusBadge.tsx
│  │  │  ├─ DashboardLayout.tsx
│  │  │  └─ StatusUpdateModal.tsx
│  │  ├─ auth
│  │  │  └─ LoginForm.tsx
│  │  ├─ booking
│  │  │  ├─ BookingForm.tsx
│  │  │  ├─ CustomerDetails.tsx
│  │  │  ├─ DateTimePicker.tsx
│  │  │  └─ ServiceSelector.tsx
│  │  └─ ui
│  │     ├─ alert.tsx
│  │     ├─ badge.tsx
│  │     ├─ button.tsx
│  │     ├─ calendar.tsx
│  │     ├─ card.tsx
│  │     ├─ dialog.tsx
│  │     ├─ form.tsx
│  │     ├─ input.tsx
│  │     ├─ label.tsx
│  │     ├─ select.tsx
│  │     ├─ sonner.tsx
│  │     ├─ table.tsx
│  │     └─ textarea.tsx
│  ├─ generated
│  ├─ hooks
│  │  ├─ getBiz.ts
│  │  └─ useBooking.ts
│  ├─ lib
│  │  ├─ api
│  │  │  ├─ client.ts
│  │  │  └─ endpoints.ts
│  │  ├─ auth
│  │  │  └─ config.ts
│  │  ├─ data
│  │  │  └─ services.ts
│  │  ├─ queryClient.ts
│  │  ├─ rate-limit.ts
│  │  ├─ utils
│  │  │  └─ dates.ts
│  │  ├─ utils.ts
│  │  └─ validations
│  │     ├─ admin.ts
│  │     ├─ booking.ts
│  │     └─ moreValidations.ts
│  └─ types
│     ├─ next-auth.d.ts
│     └─ types.ts
└─ tsconfig.json

```
`