import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions, Role, Session, User } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      role: Role;
    };
  }
  enum Role {
    USER = "AUTHOR",
    ADMIN = "ADMIN",
    EDITOR = "EDITOR",
  }

  interface User {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  }
}
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as unknown as PrismaAdapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/error", // Use a separate error page
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async session({ token, session }: { token: JWT; session: Session }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name || null;
        session.user.email = token.email || null;
        session.user.role = token.role as Role;
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // Add a redirect callback to prevent URL parameter bloat
    async redirect({ url, baseUrl }) {
      // Limit URL length to prevent redirect loops
      if (url.length > 1000) {
        return baseUrl + "/admin/login";
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
