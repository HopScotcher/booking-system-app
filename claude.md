# Complete Supabase Auth Integration with Manual Sync

## 1. Package Installation

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## 2. Environment Variables (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL="postgresql://user:password@host:5432/db"
DIRECT_URL="postgresql://user:password@host:5432/db"
```

## 3. Supabase Client Utilities

### /lib/supabase/client.ts (Browser Client)
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### /lib/supabase/server.ts (Server Client)
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

### /lib/supabase/middleware.ts
```typescript
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    (request.nextUrl.pathname.startsWith('/admin') ||
     request.nextUrl.pathname.startsWith('/api/bookings') ||
     request.nextUrl.pathname.startsWith('/api/services'))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

## 4. Root Middleware (/middleware.ts)

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## 5. Manual Sync Functions (/lib/auth-sync.ts)

```typescript
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

// Main sync function - creates Prisma User after successful Supabase signup
export async function syncUserAfterSignup(
  supabaseUserId: string,
  email: string,
  name: string,
  businessId: string,
  role: 'STAFF' | 'ADMIN' | 'SUPER_ADMIN' = 'ADMIN'
) {
  try {
    const user = await prisma.user.create({
      data: {
        id: supabaseUserId, // Use same ID as Supabase for consistency
        email,
        name,
        businessId,
        role,
        password: 'supabase_managed', // Placeholder - actual auth handled by Supabase
        isActive: true,
      },
      include: { business: true }
    })

    return { success: true, user }
  } catch (error) {
    console.error('Failed to sync user:', error)
    
    // If user creation fails, clean up the Supabase user
    const supabase = await createClient()
    await supabase.auth.admin.deleteUser(supabaseUserId)
    
    return { success: false, error: 'Failed to create user record' }
  }
}

// Check if user exists in both systems and is properly synced
export async function validateUserSync(email: string) {
  const supabase = await createClient()
  
  const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !supabaseUser) {
    return { synced: false, reason: 'No Supabase auth user' }
  }

  const prismaUser = await prisma.user.findUnique({
    where: { email },
    include: { business: true }
  })

  if (!prismaUser) {
    return { 
      synced: false, 
      reason: 'User exists in Supabase but not in database',
      supabaseUser 
    }
  }

  if (!prismaUser.isActive || prismaUser.deletedAt) {
    return { 
      synced: false, 
      reason: 'User is inactive or deleted',
      prismaUser 
    }
  }

  return { 
    synced: true, 
    supabaseUser, 
    prismaUser 
  }
}
```

## 6. Business Helper Functions (/lib/business.ts)

```typescript
import { prisma } from '@/lib/db'

// Get business by authenticated user's email (for admin/internal use)
export async function getCurrentUserBusiness(userEmail: string) {
  const dbUser = await prisma.user.findUnique({
    where: { email: userEmail },
    include: { 
      business: {
        select: {
          id: true,
          name: true,
          slug: true,
          email: true,
          phone: true,
          address: true,
          businessHours: true,
          bookingSettings: true
        }
      }
    }
  })

  return dbUser?.business || null
}

// Get business by slug (for public booking pages)
export async function getBusinessBySlug(slug: string) {
  return await prisma.business.findUnique({
    where: { 
      slug,
      isActive: true,
      deletedAt: null
    },
    include: {
      services: {
        where: {
          isActive: true,
          deletedAt: null
        }
      }
    }
  })
}

// Get user's business ID (lightweight function for quick checks)
export async function getUserBusinessId(userEmail: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { businessId: true }
  })
  
  return user?.businessId || null
}
```

## 7. Authentication Actions (/actions/auth.ts)

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { validateUserSync, syncUserAfterSignup } from '@/lib/auth-sync'
import { prisma } from '@/lib/db'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  // Check if user is properly synced between Supabase and Prisma
  const syncStatus = await validateUserSync(data.email)
  
  if (!syncStatus.synced) {
    console.error('User sync issue:', syncStatus.reason)
    redirect(`/error?reason=${encodeURIComponent(syncStatus.reason)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/admin/dashboard')
}

// For business registration (onboarding)
export async function registerBusiness(formData: FormData) {
  try {
    const businessName = formData.get('businessName') as string
    const ownerName = formData.get('ownerName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    // Step 1: Create Supabase auth user
    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          business_name: businessName,
          owner_name: ownerName
        }
      }
    })

    if (authError || !authData.user) {
      redirect('/error?reason=signup_failed')
    }

    // Step 2: Create business record
    const slug = businessName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)

    const business = await prisma.business.create({
      data: {
        name: businessName,
        email,
        slug: `${slug}-${Math.random().toString(36).substring(7)}`,
        businessHours: {
          monday: { open: '09:00', close: '17:00', closed: false },
          tuesday: { open: '09:00', close: '17:00', closed: false },
          wednesday: { open: '09:00', close: '17:00', closed: false },
          thursday: { open: '09:00', close: '17:00', closed: false },
          friday: { open: '09:00', close: '17:00', closed: false },
          saturday: { open: '09:00', close: '17:00', closed: false },
          sunday: { open: '09:00', close: '17:00', closed: true },
        }
      }
    })

    // Step 3: Sync user - create Prisma User record
    const syncResult = await syncUserAfterSignup(
      authData.user.id,
      email,
      ownerName,
      business.id,
      'ADMIN'
    )

    if (!syncResult.success) {
      // Clean up business if user sync fails
      await prisma.business.delete({ where: { id: business.id } })
      redirect('/error?reason=sync_failed')
    }

    revalidatePath('/', 'layout')
    redirect('/admin/dashboard')
    
  } catch (error) {
    console.error('Registration error:', error)
    redirect('/error?reason=registration_failed')
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// Add staff member (admin action)
export async function addStaffMember(formData: FormData) {
  const supabase = await createClient()
  
  const staffData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    name: formData.get('name') as string,
  }

  // Get current admin's business
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const syncStatus = await validateUserSync(user.email!)
  if (!syncStatus.synced) throw new Error('Admin user not properly synced')

  const businessId = syncStatus.prismaUser!.businessId

  // Create Supabase auth user for staff
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: staffData.email,
    password: staffData.password,
  })

  if (authError || !authData.user) {
    throw new Error(authError?.message || 'Failed to create staff auth')
  }

  // Sync staff user to Prisma
  const syncResult = await syncUserAfterSignup(
    authData.user.id,
    staffData.email,
    staffData.name,
    businessId,
    'STAFF'
  )

  if (!syncResult.success) {
    throw new Error('Failed to create staff record')
  }

  revalidatePath('/admin/staff')
  return { success: true, user: syncResult.user }
}
```

## 8. Business API Route (/src/app/api/business/current/route.ts)

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserBusiness } from '@/lib/business'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const business = await getCurrentUserBusiness(user.email!)

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    return NextResponse.json(business)
  } catch (error) {
    console.error('Error fetching business:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## 9. Services API Route (/src/app/api/services/route.ts)

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserBusinessId } from '@/lib/business'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const businessId = await getUserBusinessId(user.email!)

    if (!businessId) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const services = await prisma.service.findMany({
      where: {
        businessId,
        isActive: true,
        deletedAt: null
      },
      orderBy: { name: 'asc' }
    })

    const servicesWithHours = services.map(service => ({
      ...service,
      durationHours: service.duration / 60
    }))

    return NextResponse.json(servicesWithHours)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## 10. Public Booking Page (/src/app/book/page.tsx)

```typescript
import { getBusinessBySlug } from '@/lib/business'
import { notFound } from 'next/navigation'
import BookingForm from '@/components/booking/BookingForm'

interface BookingPageProps {
  searchParams: { business?: string }
}

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const businessSlug = searchParams.business

  if (!businessSlug) {
    notFound()
  }

  const business = await getBusinessBySlug(businessSlug)

  if (!business) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Book with {business.name}</h1>
      <BookingForm business={business} services={business.services} />
    </div>
  )
}
```

## 11. Protected Admin Layout (/src/app/admin/layout.tsx)

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { validateUserSync } from '@/lib/auth-sync'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }

  // Validate that user is properly synced between Supabase and Prisma
  const syncStatus = await validateUserSync(user.email!)
  
  if (!syncStatus.synced) {
    console.error('Admin user sync issue:', syncStatus.reason)
    redirect(`/error?reason=${encodeURIComponent(syncStatus.reason)}`)
  }

  return (
    <div className="admin-layout">
      <nav className="admin-nav">
        <p>Welcome, {syncStatus.prismaUser!.name}</p>
        <p>Business: {syncStatus.prismaUser!.business.name}</p>
      </nav>
      {children}
    </div>
  )
}
```

## 12. Auth Confirmation Route (/src/app/api/auth/confirm/route.ts)

```typescript
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/admin/dashboard'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      redirect(next)
    }
  }

  redirect('/error')
}
```

## 13. Login Page (/src/app/(auth)/login/page.tsx)

```typescript
import { login } from '@/actions/auth'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    redirect('/admin/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold">Sign in to your account</h2>
        </div>
        <form className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full rounded-md border px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 block w-full rounded-md border px-3 py-2"
            />
          </div>
          <button
            formAction={login}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
```

## 14. Business Registration Page (/src/app/(auth)/register/page.tsx)

```typescript
import { registerBusiness } from '@/actions/auth'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold">Create your business account</h2>
        </div>
        <form className="mt-8 space-y-6">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium">
              Business Name
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              required
              className="mt-1 block w-full rounded-md border px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="ownerName" className="block text-sm font-medium">
              Your Name
            </label>
            <input
              id="ownerName"
              name="ownerName"
              type="text"
              required
              className="mt-1 block w-full rounded-md border px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-md border px-3 py-2"
            />
          </div>
          <button
            formAction={registerBusiness}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Create Business Account
          </button>
        </form>
      </div>
    </div>
  )
}
```

## 15. Business Context Hook (/hooks/useBusiness.ts)

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useBusiness() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['business'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const response = await fetch('/api/business/current')
      if (!response.ok) throw new Error('Failed to fetch business')
      
      return response.json()
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

## Key Features Implemented:

1. **Manual Sync System**: Creates Prisma User records after successful Supabase signup
2. **Multi-tenant Support**: Business detection via slug in URL for public booking
3. **Protected Admin Routes**: Middleware + component-level protection with sync validation
4. **Business Context**: Automatic business detection for current authenticated user
5. **Error Handling**: Comprehensive error handling with cleanup on failures
6. **Staff Management**: Admins can add staff members with proper sync
7. **Atomic Operations**: If any step fails during registration, everything rolls back
8. **Separation of Concerns**: Clear distinction between public booking and admin access

## Important Notes:

1. **Email Templates**: Update Supabase email templates to use `/api/auth/confirm` route
2. **Public URLs**: Use format `/book?business=business-slug` for public booking
3. **Database Cleanup**: Failed syncs automatically clean up Supabase auth records
4. **Sync Validation**: Every admin page access validates sync status
5. **Multi-tenant Ready**: Each business gets isolated data access