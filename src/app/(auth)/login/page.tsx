import { login, signup } from "./actions";
import { Button } from "@/components/ui/button";
import { createClient } from "../../../../lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  // Check if user is already logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // If already logged in, redirect to callback URL or dashboard
    redirect(searchParams.callbackUrl || "/admin/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6">
          <input
            type="hidden"
            name="callbackUrl"
            value={searchParams.callbackUrl || "/admin/dashboard"}
          />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex flex-col  items-center justify-center space-y-4">
            <Button
              formAction={login}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in
            </Button>
            <Button
              formAction={signup}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Sign up
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// import { Metadata } from "next";
// import { getServerSession } from "next-auth";
// import { redirect } from "next/navigation";
// import LoginForm from "@/components/auth/LoginForm";
// import { authOptions } from "@/lib/auth/config";

// export const metadata: Metadata = {
//   title: "Admin Login | Booking System",
//   description: "Sign in to your business dashboard.",
// };

// export default async function AdminLoginPage() {
//   const session = await getServerSession(authOptions);
//   if (session?.user?.role === "ADMIN" || session?.user?.role === "STAFF") {
//     redirect("/dashboard");
//   }
//   return (
//     <main className="flex min-h-screen items-center justify-center bg-gray-50">
//       <LoginForm />
//     </main>
//   );
// }
