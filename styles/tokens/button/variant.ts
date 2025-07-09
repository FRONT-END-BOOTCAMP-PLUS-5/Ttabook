import spacing from '../spacing';
import { color } from '../color';

export const buttonVariants = {
  primary: {
    background: color.primary,
    color: color.textPrimary,
    border: `1px solid ${color.primary}`,
    padding: `0 ${spacing[5]}`,
    hover: {
      background: color.primaryDark,
      color: color.background,
      border: `1px solid ${color.primaryDark}`,
    },
    active: {
      background: color.primaryLight,
      color: color.textPrimary,
      border: `1px solid ${color.primaryLight}`,
    },
    disabled: {
      background: color.background,
      color: color.textSecondary,
      border: `1px solid ${color.primaryLight}`,
    },
  },
  secondary: {
    background: color.secondary,
    color: color.textPrimary,
    border: `1px solid ${color.secondary}`,
    padding: `0 ${spacing[5]}`,
    hover: {
      background: color.primary,
      color: color.background,
      border: `1px solid ${color.primary}`,
    },
    active: {
      background: color.primaryLight,
      color: color.textPrimary,
      border: `1px solid ${color.primaryLight}`,
    },
    disabled: {
      background: color.background,
      color: color.textSecondary,
      border: `1px solid ${color.secondary}`,
    },
  },
  outline: {
    background: 'transparent',
    color: color.primaryDark,
    border: `1px solid ${color.primaryDark}`,
    padding: `0 ${spacing[5]}`,
    hover: {
      background: color.primaryLight,
      color: color.primaryDark,
      border: `1px solid ${color.primary}`,
    },
    active: {
      background: color.primary,
      color: color.background,
      border: `1px solid ${color.primary}`,
    },
    disabled: {
      background: 'transparent',
      color: color.textSecondary,
      border: `1px solid ${color.primaryLight}`,
    },
  },
  ghost: {
    background: 'transparent',
    color: color.primaryDark,
    border: 'none',
    padding: `0 ${spacing[5]}`,
    hover: {
      background: color.primaryLight,
      color: color.primaryDark,
      border: 'none',
    },
    active: {
      background: color.primary,
      color: color.background,
      border: 'none',
    },
    disabled: {
      background: 'transparent',
      color: color.textSecondary,
      border: 'none',
    },
  },
  danger: {
    background: color.error,
    color: color.background,
    border: `1px solid ${color.error}`,
    padding: `0 ${spacing[5]}`,
    hover: {
      background: color.errorDark,
      color: color.background,
      border: `1px solid ${color.errorDark}`,
    },
    active: {
      background: color.error,
      color: color.background,
      border: `1px solid ${color.error}`,
    },
    disabled: {
      background: color.background,
      color: color.textSecondary,
      border: `1px solid ${color.error}`,
    },
  },
} as const;

export type ButtonVariant = keyof typeof buttonVariants;
