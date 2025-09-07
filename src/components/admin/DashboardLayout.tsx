"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", href: "/admin" },
  { name: "Bookings", href: "/admin/bookings" },
  { name: "Settings", href: "/admin/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = session?.user;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Nav */}
      <header className="flex h-16 items-center justify-between bg-white px-4 shadow-sm">
        <div className="flex items-center gap-2">
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
          <Link
            href="/admin"
            className="flex items-center gap-2 text-xl font-bold text-blue-700"
          >
            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
            Booking Admin
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <div className="font-semibold text-gray-900">{user?.name}</div>
            <div className="text-xs text-gray-500">{user?.role}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
          >
            Logout
          </button>
        </div>
      </header>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-56 transform bg-white shadow-lg transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <nav className="mt-8 flex flex-col gap-2 px-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="rounded px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => setSidebarOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Main Content */}
      <main className="md:ml-56 p-4 pt-8 transition-all duration-200">
        {children}
      </main>
    </div>
  );
}
