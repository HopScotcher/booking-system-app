// src/app/admin/template.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Booking System",
  description: "Admin dashboard and management for your business.",
};

export default function AdminTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}