// src/lib/utils/sanitize.ts
export function sanitizeString(input: string): string {
  return input.trim().replace(/<[^>]*>/g, '').substring(0, 1000);
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '').substring(0, 10);
}
