// Shared helper — returns true if the role has admin-level access
export function isAdminRole(role?: string | null): boolean {
  return role === 'admin' || role === 'super_admin';
}

export function isSuperAdmin(role?: string | null): boolean {
  return role === 'super_admin';
}
