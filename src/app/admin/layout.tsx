// import { SessionProvider } from "next-auth/react";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { Suspense } from "react";
import { getUserSession } from "../(auth)/login/actions";
import { redirect } from "next/navigation";

// export const metadata = {
//   title: "Admin | Booking System",
//   description: "Admin dashboard and management for your business.",
// };

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  const response = await getUserSession()

  if (!response?.user){
    redirect('/login')
  }

  return (
    // <SessionProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardLayout user={response.user}>{children}</DashboardLayout>
      </Suspense>
    // </SessionProvider>
  );
}
