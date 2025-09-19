// import { SessionProvider } from "next-auth/react";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { Suspense } from "react";
// import { getUserSession } from "../(auth)/login/actions";
import { getUserSession } from "../../../actions/auth";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { validateUserSync } from "../../../lib/auth-sync";

// export const metadata = {
//   title: "Admin | Booking System",
//   description: "Admin dashboard and management for your business.",
// };

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {


// TODO: use an action function here to reduce redundancy 
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }

  // Validate that user is properly synced between Supabase and Prisma
  const syncStatus = await validateUserSync(user.email!)
  
  if (!syncStatus.synced) {
    console.error('Admin user sync issue:', syncStatus.reason)
    redirect(`/error?reason=${encodeURIComponent(`${syncStatus.reason}`)}`)
  }



  return (
    // <SessionProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardLayout user={user}>{children}</DashboardLayout>
      </Suspense>
    // </SessionProvider>
  );
}
