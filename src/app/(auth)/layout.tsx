import { getUserSession } from "../../../actions/auth"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

export default async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const response = await getUserSession()
  const headersList = await headers()
  const pathname = headersList.get("x-invoke-path") || ""

  if (response?.user) {
    // allow signout if logged in
    if (pathname.includes("/signout")) {
      return <>{children}</>
    }

    // block login/signup if logged in
    if (pathname.includes("/login") || pathname.includes("/signup")) {
      redirect("/admin/dashboard")
    }
  }

  return <>{children}</>
}
