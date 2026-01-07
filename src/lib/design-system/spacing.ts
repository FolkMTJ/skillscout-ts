// src/lib/design-system/spacing.ts
/**
 * SkillScout Spacing System
 * ระยะห่างมาตรฐาน
 */

export const SPACING = {
  // Container Padding
  containerPadding: 'px-4',
  containerMaxWidth: 'max-w-7xl mx-auto',

  // Section Spacing
  sectionPadding: 'py-12',
  sectionPaddingLarge: 'py-20',

  // Card Padding
  cardPadding: 'p-6',
  cardPaddingLarge: 'p-8',

  // Gap
  gap: {
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  },
} as const;
