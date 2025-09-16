"use server"

import { revalidatePath } from "next/cache"
import {redirect} from "next/navigation"

import { createClient } from "../lib/supabase/server"
import { headers } from "next/headers"

// export async fucntion signup(forma)