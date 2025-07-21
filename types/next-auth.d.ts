import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      phone?: string;
      createdAt?: string; // add createdAt here as optional or required
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    phone?: string;
    createdAt?: string;
  }
}