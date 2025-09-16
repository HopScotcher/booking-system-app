//app/admin/login/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
// import { toast } from 'sonner'

import { createClient } from "../../../../lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error("Login error:", error.message);
    redirect("/admin/error");
  }

  // TODO: this might cause an error (the single() method)
  const {data: existingUser} = await supabase.from("Users").select("*").eq("email", data?.email).limit(1).single()

  if(!existingUser){
    const {error: insertError} = await supabase.from("Users").insert({
      email:data?.email,
    })
    if(insertError){
      return {
        status: insertError?.message,
        user: null,
      }
    }
  }

  // Get the callback URL from the form data or default to dashboard
  const callbackUrl = formData.get("callbackUrl") as string;

  revalidatePath("/admin", "layout");
  redirect(callbackUrl || "/admin/dashboard");
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

export async function SignOut(){
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

  return {status: "success", user: data.session?.user}
}