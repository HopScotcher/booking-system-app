//app/admin/login/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import { syncUserAfterSignup, validateUserSync } from "../lib/auth-sync";
import { db } from "../lib/db";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.log("Login error:", error.code);
    redirect("/error");
  }


  const syncStatus = await validateUserSync(data.email)
  
  if (!syncStatus.synced) {
    console.error('User sync issue:', syncStatus.reason)
    redirect(`/error?reason=${encodeURIComponent(`${syncStatus.reason}`)}`)
  }

  // TODO: this might cause an error (the single() method)
//   const {data: existingUser} = await supabase.from("Users").select("*").eq("email", data?.email).limit(1).single()

//   if(!existingUser){
//     const {error: insertError} = await supabase.from("Users").insert({
//       email:data?.email,
//     })
//     if(insertError){
//       return {
//         status: insertError?.message,
//         user: null,
//       }
//     }
//   }

  // Get the callback URL from the form data or default to dashboard
  // const callbackUrl = formData.get("callbackUrl") as string;

revalidatePath('/', 'layout')
  redirect("/admin/dashboard");
}




export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const formInput = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error, data } = await supabase.auth.signUp(formInput);

  if (error) {
    // redirect('/error')
    redirect("../../error");
    // toast.error("Sorry, something went wrong")
  }else if(data?.user?.identities?.length === 0){
    return {
      status: "Email already exists, please login",
      user: null,
    }
  }

  revalidatePath("/admin/private", "layout");
  redirect("/admin/private");
}

export async function signOut(){
  const supabase = await createClient()

  const {error} = await supabase.auth.signOut()

  if(error){
    console.log(error.message)
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}


export async function getUserSession(){
  const supabase = await createClient()

  const {data, error} = await supabase.auth.getUser()

  if(error){
    return null
  }

  return {status: "success", user: data?.user}
}

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

    const business = await db.business.create({
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
      await db.business.delete({ where: { id: business.id } })
      redirect('/error?reason=sync_failed')
    }

    revalidatePath('/', 'layout')
    redirect('/admin/dashboard')
    
  } catch (error) {
    console.error('Registration error:', error)
    redirect('/error?reason=registration_failed')
  }
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
