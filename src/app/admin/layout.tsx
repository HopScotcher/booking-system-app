import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import DashboardLayout from "@/components/admin/DashboardLayout";

export const metadata: Metadata = {
  title: "Admin | Booking System",
  description: "Admin dashboard and management for your business.",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </SessionProvider>
  );
}
