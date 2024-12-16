import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "owner" | "manager";
    email: string;
    username: string; 
    name: string; 
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "owner" | "manager";
      email: string;
      username: string; 
      name: string; 
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "owner" | "manager";
    email: string;
    username: string; 
    name: string
  }
}