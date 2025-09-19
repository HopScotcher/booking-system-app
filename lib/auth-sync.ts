import { db } from './db'
import { createClient } from './supabase/server'

// Main sync function - creates Prisma User after successful Supabase signup
export async function syncUserAfterSignup(
  supabaseUserId: string,
  email: string,
  name: string,
  businessId: string,
  role: 'STAFF' | 'ADMIN' | 'SUPER_ADMIN' = 'ADMIN'
) {
  try {
    const user = await db.user.create({
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

  const prismaUser = await db.user.findUnique({
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