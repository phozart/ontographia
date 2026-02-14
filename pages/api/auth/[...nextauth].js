// pages/api/auth/[...nextauth].js
// NextAuth credentials provider using the existing userRepository.

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { userRepository } from '../../../lib/repositories';

const envSecret = process.env.NEXTAUTH_SECRET;

if (!envSecret && process.env.NODE_ENV === 'production') {
  throw new Error(
    'NEXTAUTH_SECRET environment variable is required in production. ' +
    'Generate one with: openssl rand -base64 32'
  );
}

// In development/test, use a deterministic fallback so builds succeed
const resolvedSecret = envSecret || 'dev-only-nextauth-secret-not-for-production';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const username = credentials?.username;
        const password = credentials?.password;
        if (!username || !password) return null;

        const user = await userRepository.verifyUser(username, password);
        if (!user) return null;

        return {
          id: user.id,
          username: user.username,
          email: user.email,
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
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = session.user || {};
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.email = token.email;
      session.user.role = token.role;
      return session;
    },
  },
  secret: resolvedSecret,
  debug: process.env.NODE_ENV !== 'production',
};

export default NextAuth(authOptions);
