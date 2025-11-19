// src/lib/auth.ts
import { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { UserModel } from '@/lib/db/models/User';
import { UserRole } from '@/types';

interface CustomUser extends NextAuthUser {
  role: UserRole;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'otp',
      name: 'OTP',
      credentials: {
        email: { label: 'Email', type: 'email' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials?.email || !credentials?.otp) {
          throw new Error('กรุณากรอกอีเมลและรหัส OTP');
        }

        const isValidOTP = await UserModel.verifyOTP(
          credentials.email,
          credentials.otp
        );

        if (!isValidOTP) {
          throw new Error('รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว');
        }

        const user = await UserModel.findByEmail(credentials.email);

        if (!user) {
          throw new Error('ไม่พบผู้ใช้ในระบบ');
        }

        // 🔧 FIX BUG 5: เช็คว่า user ถูก ban หรือไม่
        if (user.isBanned) {
          throw new Error('บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
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
        const customUser = user as CustomUser;
        token.id = customUser.id;
        token.role = customUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;

        // 🔧 FIX BUG 5: เช็คสถานะ banned ทุกครั้งที่สร้าง session
        try {
          const user = await UserModel.findByEmail(session.user.email || '');
          if (user?.isBanned) {
            // ถ้า user ถูก ban แล้ว ให้ throw error
            throw new Error('Account has been banned');
          }
        } catch (error) {
          // ถ้าเจอ error ให้ return null เพื่อบังคับ sign out
          console.error('Session validation error:', error);
          throw error;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', // เพิ่มหน้า error
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    // 🔧 FIX BUG 5: เพิ่ม event เมื่อ sign in ให้เช็คสถานะ ban
    async signIn({ user }) {
      const dbUser = await UserModel.findByEmail(user.email || '');
      if (dbUser?.isBanned) {
        throw new Error('บัญชีของคุณถูกระงับการใช้งาน');
      }
    },
  },
};
