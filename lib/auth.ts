import {
  NextAuthOptions,
  User as NextAuthUser,
  Session,
  TokenSet,
} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

// Define your token type with role and sub
interface MyToken extends TokenSet {
  sub?: string;
  role?: string;
}

// Extend session user type to include id and role
interface MySessionUser extends NextAuthUser {
  id: string;
  role: string;
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
        token.role = user.role;
        token.sub = user.id;
      }
      return token;
    },

    async session({
      session,
      token,
    }: {
      session: Session & { user: MySessionUser };
      token: MyToken;
    }) {
      if (token) {
        session.user.id = token.sub!; // <-- token.sub should be string
        session.user.role = token.role ?? 'CUSTOMER'; // <-- token.role should be string
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
