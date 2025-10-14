// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { UserModel } from '@/lib/db/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'otp',
      name: 'OTP',
      credentials: {
        email: { label: 'Email', type: 'email' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) {
          throw new Error('กรุณากรอกอีเมลและรหัส OTP');
        }

        // Verify OTP
        const isValidOTP = await UserModel.verifyOTP(
          credentials.email,
          credentials.otp
        );

        if (!isValidOTP) {
          throw new Error('รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว');
        }

        // Get user
        const user = await UserModel.findByEmail(credentials.email);

        if (!user) {
          throw new Error('ไม่พบผู้ใช้ในระบบ');
        }

        return {
          id: user._id?.toString() || '',
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.profileImage,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
