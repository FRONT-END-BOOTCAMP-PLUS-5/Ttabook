import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { VerifyCredentialsUseCase } from '../../auth/[...nextauth]/application/usecase';
import { SupabaseUserRepository } from '../repositories/SbUserRepository';
import { createClient } from '../supabase/server';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: '이메일', type: 'email' },
        password: { label: '비밀번호', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const supabase = await createClient();
          const userRepository = new SupabaseUserRepository(supabase);
          const verifyCredentialsUseCase = new VerifyCredentialsUseCase(
            userRepository
          );
          const user = await verifyCredentialsUseCase.execute({
            email: credentials.email,
            password: credentials.password,
          });

          if (!user) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name, // User's actual name
            type: user.type,
          };
        } catch (error) {
          console.error('인증 중 오류 발생:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/user/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.type = user.type;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.type = token.type;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
