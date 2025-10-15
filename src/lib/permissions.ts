// src/lib/permissions.ts
import { UserRole } from '@/types';

export const permissions = {
  createCamp: [UserRole.ORGANIZER, UserRole.ADMIN],
  editCamp: [UserRole.ORGANIZER, UserRole.ADMIN],
  deleteCamp: [UserRole.ORGANIZER, UserRole.ADMIN],
  viewAllCamps: [UserRole.ADMIN],
  reviewRegistrations: [UserRole.ORGANIZER, UserRole.ADMIN],
  approveRegistration: [UserRole.ORGANIZER, UserRole.ADMIN],
  rejectRegistration: [UserRole.ORGANIZER, UserRole.ADMIN],
  viewAllRegistrations: [UserRole.ADMIN],
  manageUsers: [UserRole.ADMIN],
  changeUserRole: [UserRole.ADMIN],
  viewUserList: [UserRole.ADMIN],
  registerCamp: [UserRole.USER, UserRole.ORGANIZER, UserRole.ADMIN],
};

export function hasPermission(userRole: UserRole, action: keyof typeof permissions): boolean {
  return permissions[action]?.includes(userRole) ?? false;
}

export function canEditCamp(userRole: UserRole, userId: string, campOrganizerId: string): boolean {
  if (userRole === UserRole.ADMIN) return true;
  if (userRole === UserRole.ORGANIZER && userId === campOrganizerId) return true;
  return false;
}

export function canReviewRegistration(userRole: UserRole, userId: string, campOrganizerId: string): boolean {
  if (userRole === UserRole.ADMIN) return true;
  if (userRole === UserRole.ORGANIZER && userId === campOrganizerId) return true;
  return false;
}