import {
  NextAuthOptions,
  User as NextAuthUser,
  Session,
  TokenSet,
} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

// Define custom token type
interface MyToken extends TokenSet {
  sub?: string;
  role?: string;
  phone?: string | null;
}

// Extend session user type
interface MySessionUser extends NextAuthUser {
  id: string;
  role: string;
  phone: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
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

        if (!user || !user.isActive) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone ?? '', // ✅ Add phone to returned user object
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.sub = user.id;
        token.phone = (user as any).phone ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      // Safely cast session.user to include custom fields
      session.user = {
        ...session.user,
        id: token.sub!,
        role: token.role ?? 'CUSTOMER',
        phone: token.phone ?? null,
      } as typeof session.user & {
        id: string;
        role: string;
        phone: string | null;
      };

      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
