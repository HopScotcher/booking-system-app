import { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "../../../lib/db";
import { Role, Business, User } from "@prisma/client";

// Type declarations moved below

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    businessId: string;
    business: {
      // Define only the properties you need in the session
      id: string;
      name: string;
      email: string;
      isActive: boolean;
    };
  }

  interface Session extends DefaultSession {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    role: Role;
    businessId: string;
    business: {
      id: string;
      name: string;
      email: string;
      isActive: boolean;
    };
  }
}

function canLogin(role: Role) {
  return role === "ADMIN" || role === "STAFF" || role === "SUPER_ADMIN";
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",

  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },

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
        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth] Missing credentials");
          return null;
        }

        try {
          console.log("[Auth] Attempting to find user:", credentials.email);

          const user = await db.user.findUnique({
            where: {
              email: credentials.email,
            },
            include: {
              business: true,
            },
          });

          if (!user) {
            console.log("[Auth] User not found");
            return null;
          }

          if (!user.isActive) {
            console.log("[Auth] User is not active");
            return null;
          }

          if (user.deletedAt) {
            console.log("[Auth] User has been deleted");
            return null;
          }

          if (!user.password) {
            console.log("[Auth] No password set for user");
            return null;
          }

          console.log("[Auth] Verifying password...");
          const isValidPassword = await compare(
            credentials.password,
            user.password
          );

          if (!isValidPassword) {
            console.log("[Auth] Invalid password");
            return null;
          }

          if (!canLogin(user.role)) {
            console.log("[Auth] User role not allowed:", user.role);
            return null;
          }

          if (!user.business?.isActive) {
            console.log("[Auth] Business is not active");
            return null;
          }

          console.log("[Auth] Login successful for:", user.email);

          return {
            id: user.id,
            name: user.name || "",
            email: user.email,
            role: user.role,
            businessId: user.businessId,
            business: {
              id: user.business.id,
              name: user.business.name,
              email: user.business.email,
              isActive: user.business.isActive,
            },
          };
        } catch (error) {
          console.error("Error in authorize:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }

      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          businessId: user.businessId,
          business: user.business,
        };
      }
      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
          businessId: token.businessId,
          business: token.business,
        },
      };
    },
  },
};
