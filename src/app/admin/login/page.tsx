import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { authOptions } from "@/lib/auth/config";

export const metadata: Metadata = {
  title: "Admin Login | Booking System",
  description: "Sign in to your business dashboard.",
};

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role === "ADMIN" || session?.user?.role === "STAFF") {
    redirect("/dashboard");
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <LoginForm />
    </main>
  );
}
