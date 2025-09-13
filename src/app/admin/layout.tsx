"use client";

import { SessionProvider } from "next-auth/react";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { Suspense } from "react";

// export const metadata = {
//   title: "Admin | Booking System",
//   description: "Admin dashboard and management for your business.",
// };

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardLayout>{children}</DashboardLayout>
      </Suspense>
    </SessionProvider>
  );
}
