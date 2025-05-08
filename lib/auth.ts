import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions, Role, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Adapter } from "next-auth/adapters";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

import { prisma } from "@/lib/prisma";

// Define our custom session and user types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      role: Role;
      image: string | null;
    };
  }

  type Role = "AUTHOR" | "EDITOR" | "ADMIN" | "OWNER";

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
    image?: string | null;
  }
}

// Declare JWT module for token customization
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    image?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/error",
  },
  debug: process.env.NODE_ENV === "development",
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          // Find the user by email
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          // If user doesn't exist or has no password set
          if (!user || !user.password) {
            console.log("User not found or has no password");
            return null;
          }

          // Compare passwords
          const passwordValid = await compare(
            credentials.password,
            user.password
          );

          if (!passwordValid) {
            console.log("Invalid password");
            return null;
          }

          // Return the user without sensitive data
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name || null;
        session.user.email = token.email || null;
        session.user.role = token.role as Role;
        session.user.image = token.image || null;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "AUTHOR"; // Make sure this preserves OWNER role
        token.image = user.image || null;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Limit URL length to prevent redirect loops
      if (url.length > 1000) {
        return baseUrl + "/admin";
      }

      // Allow relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // Allow URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        return url;
      }

      return baseUrl;
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);
