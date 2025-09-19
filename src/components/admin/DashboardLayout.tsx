"use client";

 
// import { getUserSession } from "@/app/(auth)/login/actions";

 
import { signOut } from "../../../actions/auth";
import Link from "next/link";
import { useState } from "react";
// import { User } from "@prisma/client";
import { User } from "@supabase/supabase-js";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard" },
  { name: "Bookings", href: "/admin/bookings" },
  { name: "Settings", href: "/admin/settings" },
];


interface DashboardLayoutProps{
  children: React.ReactNode;
  user: User
}
export default function DashboardLayout({
  children, user
}: DashboardLayoutProps) {
  // const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // const user = session?.user;
   

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="flex h-16 items-center justify-between bg-white px-4 shadow-sm">
        <div className="flex items-center gap-2">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          {/* Logo */}
          <Link
            href="/admin"
            className="flex items-center gap-2 text-xl font-bold text-blue-700"
          >
            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
            <span className="hidden md:inline">Booking Admin</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center justify-center flex-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="mx-4 rounded px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <div className="font-semibold text-gray-900">{ user?.email}</div>
            <div className="text-xs text-gray-500">{ user?.role}</div>
          </div>
          <button
            onClick={() => signOut()}
            className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-200 md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-center border-b">
          <span className="text-xl font-bold text-blue-700">Menu</span>
        </div>
        <nav className="flex flex-col p-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="mb-2 rounded px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => setSidebarOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="p-4 pt-8">
        {children}
      </main>
    </div>
  );
}
