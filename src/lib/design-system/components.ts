// src/lib/design-system/components.ts
/**
 * SkillScout Reusable Component Styles
 * Style patterns ที่ใช้ซ้ำทั้งระบบ
 */

/**
 * Card Styles
 */
export const CARD_STYLES = {
  default: 'shadow-lg hover:shadow-xl transition-shadow',
  interactive: 'shadow-md hover:shadow-xl transition-all cursor-pointer',
  flat: 'shadow-md',
} as const;

/**
 * Button Styles (ใช้กับ HeroUI Button)
 */
export const BUTTON_VARIANTS = {
  primary: {
    color: 'warning' as const,
    className: 'font-semibold',
  },
  secondary: {
    variant: 'bordered' as const,
    className: 'font-semibold',
  },
  danger: {
    color: 'danger' as const,
    className: 'font-semibold',
  },
  success: {
    color: 'success' as const,
    className: 'font-semibold',
  },
} as const;

/**
 * Badge Styles (RIASEC, Status, etc.)
 */
export const BADGE_STYLES = {
  riasec: 'w-10 h-10 bg-[#F2B33D] rounded-full flex items-center justify-center font-bold text-white',
  riasecSmall: 'w-8 h-8 bg-[#F2B33D] rounded-full flex items-center justify-center text-xs font-bold text-white',
  status: {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  },
  demand: {
    high: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-gray-100 text-gray-700',
  },
} as const;

/**
 * Input/Form Styles
 */
export const INPUT_STYLES = {
  default: '',
  search: 'max-w-xl',
} as const;

/**
 * Section Background Styles
 */
export const SECTION_STYLES = {
  gradient: 'bg-gradient-to-br from-yellow-50 via-white to-orange-50',
  primary: 'bg-[#F2B33D]',
  white: 'bg-white',
  gray: 'bg-gray-50',
} as const;

/**
 * Icon Container Styles
 */
export const ICON_CONTAINER = {
  primary: 'w-16 h-16 bg-[#F2B33D] rounded-full flex items-center justify-center',
  small: 'w-10 h-10 bg-[#F2B33D] rounded-full flex items-center justify-center font-bold text-white',
} as const;

/**
 * Highlight Box Styles (สำหรับข้อความสำคัญ)
 */
export const HIGHLIGHT_BOX = {
  primary: 'bg-yellow-50 rounded-lg p-4',
  info: 'bg-blue-50 rounded-lg p-4',
  success: 'bg-green-50 rounded-lg p-4',
} as const;
