
//app/admin/login/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
// import { toast } from 'sonner'

import { createClient } from '../../../../lib/supabase/server' 

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)
  console.log(error)

  if (error) {
    // redirect('/error')
     redirect('../../error')
    
  }

  revalidatePath('/private', 'layout')
  redirect('/private')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    // redirect('/error')
     redirect('../../error')
    // toast.error("Sorry, something went wrong")

  }

  revalidatePath('/private', 'layout')
  redirect('/private')
}