// lib/auth.ts
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { db } from "../../../lib/db"
import { Role, Business } from "@prisma/client"

// --------------------
// Extend NextAuth types for strong typing
// --------------------
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      businessId: string
      business: Business | null
    }
  }

  interface User {
    id: string
    role: Role
    businessId: string
    business: Business | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    businessId: string
    business: Business | null
  }
}

// --------------------
// Role guard helper
// --------------------
function canLogin(role: Role) {
  return role === "ADMIN" || role === "STAFF"
}

// --------------------
// NextAuth config
// --------------------
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { business: true },
        })

        if (!user) return null

        const isValid = await compare(credentials.password, user.password)
        if (!isValid || !canLogin(user.role)) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          businessId: user.businessId,
          business: user.business,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.role = user.role
        token.businessId = user.businessId
        token.business = user.business
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.role = token.role
        session.user.businessId = token.businessId
        session.user.business = token.business
      }
      return session
    },
  },
}
