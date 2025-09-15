//app/admin/login/page.tsx

import { login, signup } from "./actions";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <form>
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" required />
      <Button formAction={login}>Log in</Button>
      <Button formAction={signup}>Sign up</Button>
    </form>
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
