import next from "next"
import { getUserSession } from "./login/actions" 

import {redirect} from "next/navigation"

export default async function AuthLayout({
    children,
}: Readonly<{children: React.ReactNode}>){
    const response = getUserSession()

    if (response?.user){
        redirect('/')


    }

    return <>{children}</>
}