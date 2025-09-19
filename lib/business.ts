import { db } from "./db"

// Get business by authenticated user's email (for admin/internal use)
export async function getCurrentUserBusiness(userEmail: string) {
  const dbUser = await db.user.findUnique({
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
  return await db.business.findUnique({
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
  const user = await db.user.findUnique({
    where: { email: userEmail },
    select: { businessId: true }
  })
  
  return user?.businessId || null
}