import { DefaultSession } from "next-auth";

import { Role, Business } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name: string | null;
      email: string | null;
      businessId: string;
      business: Business;
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    role: string;
    name: string | null;
    email: string | null;
    businessId: string;
    business: Business;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    businessId: string;
    business: any;
  }
}
