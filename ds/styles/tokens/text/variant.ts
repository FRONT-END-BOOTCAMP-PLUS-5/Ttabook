import { color } from '../color';

export const textVariants = {
  primary: {
    color: color.textPrimary,
    background: 'transparent',
    decoration: 'none',
  },
  secondary: {
    color: color.textSecondary,
    background: 'transparent',
    decoration: 'none',
  },
  accent: {
    color: color.accent,
    background: 'transparent',
    decoration: 'underline',
  },
  danger: {
    color: color.error,
    background: 'transparent',
    decoration: 'none',
  },
  disabled: {
    color: color.textSecondary,
    background: 'transparent',
    decoration: 'line-through',
  },
} as const;

export type TextVariant = keyof typeof textVariants;