import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      businessId: string;
      business: any;
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    role: string;
    businessId: string;
    business: any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    businessId: string;
    business: any;
  }
}
