// src/types/user.ts
export enum UserRole {
  USER = 'user',
  ORGANIZER = 'organizer',
  ADMIN = 'admin'
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  lineId?: string;
  bio?: string;
  profileImage?: string;
  organization?: string;
  idCard?: string;
  address?: string;
  province?: string;
  district?: string;
  isBanned?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OTP {
  _id: string;
  email: string;
  otp: string;
  expiresAt: Date;
  createdAt: Date;
}
