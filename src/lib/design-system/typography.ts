// src/lib/design-system/typography.ts
/**
 * SkillScout Typography System
 * ขนาดและสไตล์ตัวอักษร
 */

export const TYPOGRAPHY = {
  // Headings
  h1: 'text-4xl md:text-5xl font-bold',
  h2: 'text-3xl md:text-4xl font-bold',
  h3: 'text-2xl font-bold',
  h4: 'text-xl font-bold',
  h5: 'text-lg font-bold',

  // Body
  body: 'text-base',
  bodyLarge: 'text-lg',
  bodySmall: 'text-sm',

  // Special
  subtitle: 'text-xl md:text-2xl text-gray-600',
  caption: 'text-sm text-gray-600',
  label: 'text-sm font-semibold text-gray-600',
} as const;
