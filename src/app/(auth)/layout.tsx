import next from "next";
import { getUserSession } from "./login/actions";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const response = await getUserSession()

  if (response?.user) {
    redirect("/admin/dashboard");
  }

  return <>{children}</>;
}
