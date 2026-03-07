// src/lib/design-system/colors.ts
/**
 * SkillScout Color System
 * สีหลักของแบรนด์ ใช้ตลอดทั้งระบบ
 * 
 * IMPORTANT: ห้ามใช้สีนอกเหนือจากที่กำหนดไว้เพื่อรักษา Brand Identity
 */

export const COLORS = {
  // Primary - สีเหลือง (Brand Color)
  primary: {
    DEFAULT: '#F2B33D', // สีเหลืองหลัก - ใช้เป็นหลักทั้งระบบ
    light: '#FFF9E6',   // พื้นหลังอ่อน
    dark: '#D89E2A',    // เหลืองเข้ม
  },

  // Secondary - สีส้ม (เสริม)
  secondary: {
    DEFAULT: '#F97316', // สีส้ม - ใช้เสริมสีเหลือง
    light: '#FED7AA',
    dark: '#EA580C',
  },

  // Status Colors (ใช้เฉพาะกรณีจำเป็น)
  success: {
    DEFAULT: '#22C55E', // เขียว - ใช้กับ success เท่านั้น
    light: '#D1FAE5',
    dark: '#16A34A',
  },

  error: {
    DEFAULT: '#EF4444', // แดง - ใช้กับ error/danger เท่านั้น
    light: '#FEE2E2',
    dark: '#DC2626',
  },

  warning: {
    DEFAULT: '#F59E0B', // ส้มเข้ม - ใช้กับ warning เท่านั้น
    light: '#FEF3C7',
    dark: '#D97706',
  },

  // Neutral Colors
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Background
  background: {
    DEFAULT: '#FFFFFF',
    alt: '#F9FAFB',
    gradient: 'from-yellow-50 via-white to-orange-50', // gradient เหลือง-ขาว-ส้ม
  },

  // ❌ ห้ามใช้สีเหล่านี้ - หลุด Brand CI
  // - สีน้ำเงิน (blue)
  // - สีม่วง (purple)
  // - สีชมพู (pink)
  // - สีเขียวสด (เว้นแต่ success state)
} as const;

/**
 * Stat Card Colors (สำหรับ dashboard cards)
 * ใช้เฉพาะสีที่อยู่ใน Brand CI
 */
export const STAT_CARD_COLORS = {
  primary: '#F2B33D',   // เหลือง
  secondary: '#F97316', // ส้ม
  success: '#22C55E',   // เขียว
  danger: '#EF4444',    // แดง
  warning: '#F59E0B',   // ส้มเข้ม
  neutral: '#6B7280',   // เทา
} as const;

/**
 * Tailwind CSS Classes สำหรับสี
 */
export const COLOR_CLASSES = {
  // Primary
  bgPrimary: 'bg-[#F2B33D]',
  bgPrimaryLight: 'bg-[#FFF9E6]',
  textPrimary: 'text-[#F2B33D]',
  borderPrimary: 'border-[#F2B33D]',

  // Secondary
  bgSecondary: 'bg-[#F97316]',
  textSecondary: 'text-[#F97316]',
  borderSecondary: 'border-[#F97316]',

  // Status Backgrounds
  bgSuccess: 'bg-green-100',
  bgError: 'bg-red-100',
  bgWarning: 'bg-orange-100',

  // Text Status
  textSuccess: 'text-green-600',
  textError: 'text-red-600',
  textWarning: 'text-orange-600',
} as const;
